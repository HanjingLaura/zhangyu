import { Redis } from "@upstash/redis";
import { addFun, createGame, finishGame, hint, pass, submit } from "./engine";
import { idiomIndex } from "./dictionary";
import { narrateGame } from "./octopus-ai";
import { appearanceOf } from "./player";
import { MAX_PLAYERS, parseRoomOptions } from "./seats";
import { computeShells } from "./wardrobe";
import type { Danmaku, Game, GameConfig, LinkMode, RoomMember, RoomSnapshot, UserPublic } from "./types";

export type RoomRecord = {
  code: string;
  hostId: string;
  members: RoomMember[];
  status: RoomSnapshot["status"];
  mode: RoomSnapshot["mode"];
  tentacles: number;
  opening: GameConfig["opening"];
  maxRounds: number;
  buzz: boolean;
  game: Game | null;
  danmaku: Danmaku[];
  rev: number;
};

const ROOM_TTL = 60 * 60 * 24;
type RoomCache = {
  get: (key: string) => Promise<unknown | null>;
  set: (key: string, value: unknown, options?: { ttl?: number; name?: string; tags?: string[] }) => Promise<void>;
  delete: (key: string) => Promise<void>;
};
const g = globalThis as typeof globalThis & {
  __zyRooms?: Map<string, RoomRecord>;
  __zyRedis?: Redis | null;
  __zyCache?: RoomCache | null;
};

function rooms() {
  if (!g.__zyRooms) g.__zyRooms = new Map();
  return g.__zyRooms;
}

function getRedis() {
  if (g.__zyRedis !== undefined) return g.__zyRedis;
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    g.__zyRedis = Redis.fromEnv();
  } else {
    g.__zyRedis = null;
  }
  return g.__zyRedis;
}

async function getSharedCache() {
  if (g.__zyCache !== undefined) return g.__zyCache;
  if (!process.env.VERCEL || getRedis()) {
    g.__zyCache = null;
    return null;
  }
  try {
    const { getCache } = await import("@vercel/functions");
    g.__zyCache = getCache({ namespace: "zy-rooms" });
  } catch {
    g.__zyCache = null;
  }
  return g.__zyCache;
}

function roomKey(code: string) {
  return `zy:room:${code}`;
}

function revKey(code: string) {
  return `zy:room:${code}:rev`;
}

function asRoom(value: unknown): RoomRecord | null {
  if (!value || typeof value !== "object") return null;
  const room = value as RoomRecord;
  if (!room.code || !Array.isArray(room.members)) return null;
  return {
    ...room,
    rev: Number(room.rev ?? 1),
    buzz: Boolean(room.buzz),
    danmaku: room.danmaku ?? [],
    members: room.members,
  };
}

function decodeRoom(value: unknown) {
  if (typeof value === "string") {
    try {
      return asRoom(JSON.parse(value));
    } catch {
      return null;
    }
  }
  return asRoom(value);
}

const CREATE_LUA = `
if redis.call('EXISTS', KEYS[1]) == 1 then return 0 end
redis.call('SET', KEYS[1], ARGV[1], 'EX', tonumber(ARGV[2]))
redis.call('SET', KEYS[2], '1', 'EX', tonumber(ARGV[2]))
return 1
`;

const SAVE_LUA = `
if redis.call('GET', KEYS[2]) ~= ARGV[1] then return 0 end
redis.call('SET', KEYS[1], ARGV[2], 'EX', tonumber(ARGV[3]))
redis.call('SET', KEYS[2], ARGV[4], 'EX', tonumber(ARGV[3]))
return 1
`;

const DELETE_LUA = `
if redis.call('GET', KEYS[2]) ~= ARGV[1] then return 0 end
redis.call('DEL', KEYS[1], KEYS[2])
return 1
`;

async function readRedis(code: string) {
  const redis = getRedis();
  if (!redis) return null;
  const [raw, rev] = await Promise.all([
    redis.get<string | RoomRecord>(roomKey(code)),
    redis.get<string | number>(revKey(code)),
  ]);
  const room = decodeRoom(raw);
  if (!room) return null;
  room.rev = Number(rev ?? room.rev ?? 1);
  return room;
}

export async function getRoom(code: string) {
  const key = code.toUpperCase();
  if (getRedis()) return readRedis(key);
  const cache = await getSharedCache();
  if (cache) return decodeRoom(await cache.get(roomKey(key)));
  return rooms().get(key) ?? null;
}

async function createRecord(room: RoomRecord) {
  const redis = getRedis();
  if (redis) {
    const ok = await redis.eval(CREATE_LUA, [roomKey(room.code), revKey(room.code)], [
      JSON.stringify(room),
      String(ROOM_TTL),
    ]);
    return Number(ok) === 1;
  }
  const cache = await getSharedCache();
  if (cache) {
    if (decodeRoom(await cache.get(roomKey(room.code)))) return false;
    await cache.set(roomKey(room.code), room, { ttl: ROOM_TTL, name: `room-${room.code}` });
    return true;
  }
  if (rooms().has(room.code)) return false;
  rooms().set(room.code, room);
  return true;
}

async function saveRoom(next: RoomRecord, expectedRev: number) {
  const room = { ...next, rev: expectedRev + 1 };
  const redis = getRedis();
  if (redis) {
    const ok = await redis.eval(SAVE_LUA, [roomKey(room.code), revKey(room.code)], [
      String(expectedRev),
      JSON.stringify(room),
      String(ROOM_TTL),
      String(room.rev),
    ]);
    return Number(ok) === 1;
  }
  const cache = await getSharedCache();
  if (cache) {
    const current = decodeRoom(await cache.get(roomKey(room.code)));
    if (!current || current.rev !== expectedRev) return false;
    await cache.set(roomKey(room.code), room, { ttl: ROOM_TTL, name: `room-${room.code}` });
    return true;
  }
  const current = rooms().get(room.code);
  if (!current || current.rev !== expectedRev) return false;
  rooms().set(room.code, room);
  return true;
}

async function removeRoom(code: string, expectedRev: number) {
  const redis = getRedis();
  if (redis) {
    const ok = await redis.eval(DELETE_LUA, [roomKey(code), revKey(code)], [String(expectedRev)]);
    return Number(ok) === 1;
  }
  const cache = await getSharedCache();
  if (cache) {
    const current = decodeRoom(await cache.get(roomKey(code)));
    if (!current || current.rev !== expectedRev) return false;
    await cache.delete(roomKey(code));
    return true;
  }
  const current = rooms().get(code);
  if (!current || current.rev !== expectedRev) return false;
  rooms().delete(code);
  return true;
}

async function mutateRoom(
  code: string,
  fn: (room: RoomRecord) => RoomRecord | Promise<RoomRecord | null> | null,
) {
  const key = code.toUpperCase();
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const room = await getRoom(key);
    if (!room) throw new Error("房间不存在");
    const next = await fn(structuredClone(room));
    if (next === null) {
      if (await removeRoom(key, room.rev)) return null;
      continue;
    }
    next.code = room.code;
    if (await saveRoom(next, room.rev)) return next;
  }
  throw new Error("请重试");
}

function randomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

function decorateGame(room: RoomRecord): Game | null {
  if (!room.game) return null;
  const byId = new Map(room.members.map((member) => [member.id, member]));
  return {
    ...room.game,
    players: room.game.players.map((player) => {
      const member = byId.get(player.id);
      return member
        ? {
            ...player,
            name: member.name,
            avatarUrl: member.avatarUrl,
            outfit: member.outfit,
          }
        : player;
    }),
  };
}

export function snapshot(room: RoomRecord): RoomSnapshot {
  return {
    code: room.code,
    hostId: room.hostId,
    members: room.members,
    status: room.status,
    mode: room.mode,
    tentacles: room.tentacles,
    opening: room.opening,
    maxRounds: room.maxRounds,
    buzz: Boolean(room.buzz || room.game?.buzz),
    game: decorateGame(room),
    danmaku: room.danmaku,
  };
}

function payoutRoom(room: RoomRecord) {
  if (!room.game || room.game.status !== "finished" || room.game.payouts) return room;
  const titles = room.game.titles;
  const payouts: Record<string, number> = {};
  for (const player of room.game.players) {
    payouts[player.id] = computeShells(player, titles);
  }
  room.game = { ...room.game, payouts };
  return room;
}

export async function createRoom(
  user: UserPublic,
  options?: { mode?: LinkMode; maxRounds?: number; buzz?: boolean },
) {
  const picked = parseRoomOptions(options ?? {});
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = randomCode();
    const room: RoomRecord = {
      code,
      hostId: user.id,
      members: [appearanceOf(user)],
      status: "lobby",
      mode: picked.mode,
      tentacles: 8,
      opening: "yiming",
      maxRounds: picked.maxRounds,
      buzz: picked.buzz,
      game: null,
      danmaku: [],
      rev: 1,
    };
    if (await createRecord(room)) return snapshot(room);
  }
  throw new Error("创建失败，请重试");
}

export async function joinRoom(code: string, user: UserPublic) {
  const room = await mutateRoom(code, (current) => {
    const seated = current.members.find((member) => member.id === user.id);
    if (seated) {
      Object.assign(seated, appearanceOf(user));
      return current;
    }
    if (current.status !== "lobby") throw new Error("房间已开始");
    if (current.members.length >= MAX_PLAYERS) throw new Error("房间已满");
    current.members.push(appearanceOf(user));
    return current;
  });
  return snapshot(room!);
}

export async function configureRoom(
  code: string,
  userId: string,
  patch: Partial<Pick<RoomRecord, "mode" | "tentacles" | "opening" | "maxRounds">>,
) {
  const room = await mutateRoom(code, (current) => {
    if (current.hostId !== userId) throw new Error("只有房主能修改");
    if (current.status !== "lobby") throw new Error("房间已开始");
    if (patch.mode) current.mode = patch.mode;
    if (patch.tentacles) current.tentacles = patch.tentacles;
    if (patch.opening) current.opening = patch.opening;
    if (patch.maxRounds) current.maxRounds = patch.maxRounds;
    return current;
  });
  return snapshot(room!);
}

export async function startRoom(code: string, userId: string) {
  const room = await mutateRoom(code, (current) => {
    if (current.hostId !== userId) throw new Error("只有房主能开始");
    if (current.members.length < 2) throw new Error("至少 2 人");
    current.game = createGame(idiomIndex, {
      names: current.members.map((member) => member.name),
      seatPlayers: current.members,
      mode: current.mode,
      tentacles: current.tentacles,
      opening: current.opening,
      maxRounds: current.maxRounds,
      buzz: current.buzz,
    });
    current.status = "playing";
    return current;
  });
  return snapshot(room!);
}

export async function playRoom(
  code: string,
  userId: string,
  action: "submit" | "hint" | "pass" | "finish",
  word = "",
  prev?: string,
) {
  const room = await mutateRoom(code, async (current) => {
    if (!current.game) throw new Error("房间还没开始");
    if (action === "finish") {
      if (current.hostId !== userId) throw new Error("只有房主能结束");
      current.game = finishGame(current.game);
      current.status = "finished";
      current.game = await narrateGame(current.game, "finish", word, "finished");
      return payoutRoom(current);
    }
    if (current.game.status !== "playing") throw new Error("本局已结束");
    const seated = current.game.players.findIndex((player) => player.id === userId);
    if (seated < 0) throw new Error("你不在这个房间");
    if (current.game.buzz) {
      if (action === "hint" || action === "pass") throw new Error("抢答不用这个");
      current.game = { ...current.game, turn: seated };
    } else {
      const player = current.game.players[current.game.turn];
      if (player.id !== userId) throw new Error(`轮到 ${player.name}`);
    }
    if (action === "submit" && prev && current.game.chain.at(-1) !== prev) {
      throw new Error("慢了");
    }

    let reason: "hint" | ReturnType<typeof submit>["reason"] = "hint";
    if (action === "hint") {
      current.game = hint(idiomIndex, current.game);
    } else if (action === "pass") {
      const result = pass(idiomIndex, current.game);
      current.game = result.game;
      reason = result.reason;
    } else {
      const result = submit(idiomIndex, current.game, word);
      current.game = result.game;
      reason = result.reason;
    }
    if (current.game.status === "finished") current.status = "finished";
    current.game = await narrateGame(
      current.game,
      action,
      word,
      current.game.status === "finished" && action !== "hint" ? "finished" : reason,
    );
    if (current.game.status === "finished") payoutRoom(current);
    return current;
  });
  return snapshot(room!);
}

export async function postDanmaku(code: string, user: UserPublic, text: string) {
  const room = await mutateRoom(code, (current) => {
    if (!current.members.some((member) => member.id === user.id)) {
      throw new Error("你不在这个房间");
    }
    const clean = text.replace(/\s+/g, " ").trim().slice(0, 24);
    if (!clean) throw new Error("弹幕不能为空");
    const item: Danmaku = {
      id: `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
      userId: user.id,
      name: user.name,
      text: clean,
      at: Date.now(),
    };
    current.danmaku = [...current.danmaku, item].slice(-40);
    if (current.game?.status === "playing") {
      current.game = addFun(current.game, user.id, 1);
    }
    return current;
  });
  return snapshot(room!);
}

export async function leaveRoom(code: string, userId: string) {
  try {
    const room = await mutateRoom(code, (current) => {
      current.members = current.members.filter((member) => member.id !== userId);
      if (current.members.length === 0) return null;
      if (current.hostId === userId) current.hostId = current.members[0].id;
      return current;
    });
    return room ? snapshot(room) : null;
  } catch (error) {
    if (error instanceof Error && error.message === "房间不存在") return null;
    throw error;
  }
}

export function resetMemoryRooms() {
  rooms().clear();
  g.__zyRedis = null;
  delete g.__zyCache;
}
