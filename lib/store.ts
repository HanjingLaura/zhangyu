import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { avatarUrl, saveAvatarDataUrl } from "./avatar";
import { hashPassword, normalizeName, verifyPassword } from "./auth";
import { addFun, createGame, finishGame, hint, pass, submit } from "./engine";
import { idiomIndex } from "./dictionary";
import { narrateGame } from "./octopus-ai";
import { MAX_PLAYERS, parseRoomOptions } from "./seats";
import { historyFromGame, historyForUser, type HistoryRecord } from "./history";
import { computeShells, getOutfit, isFreeOutfit, normalizeOwned, normalizeOutfitId, OUTFITS } from "./wardrobe";
import type { Danmaku, Game, GameConfig, LinkMode, RoomSnapshot, UserPublic } from "./types";

type UserRecord = {
  id: string;
  name: string;
  password: string;
  avatarRev: number;
  shells: number;
  owned: string[];
  outfit: string;
};

type RoomRecord = {
  code: string;
  hostId: string;
  members: { id: string; name: string }[];
  status: RoomSnapshot["status"];
  mode: RoomSnapshot["mode"];
  tentacles: number;
  opening: GameConfig["opening"];
  maxRounds: number;
  game: Game | null;
  danmaku: Danmaku[];
};

type Memory = {
  users: Map<string, UserRecord>;
  rooms: Map<string, RoomRecord>;
};

const USERS_PATH = join(process.cwd(), "data", "users.json");
const HISTORY_PATH = join(process.cwd(), "data", "history.json");
const g = globalThis as typeof globalThis & { __zhangyu?: Memory };

function memory(): Memory {
  if (!g.__zhangyu) {
    g.__zhangyu = { users: loadUsers(), rooms: new Map() };
  }
  return g.__zhangyu;
}

function loadUsers() {
  const map = new Map<string, UserRecord>();
  if (!existsSync(USERS_PATH)) return map;
  const rows = JSON.parse(readFileSync(USERS_PATH, "utf8")) as UserRecord[];
  for (const row of rows) {
    map.set(row.name.toLowerCase(), {
      ...row,
      avatarRev: row.avatarRev ?? 0,
      shells: row.shells ?? 0,
      owned: normalizeOwned(row.owned),
      outfit: normalizeOutfitId(row.outfit),
    });
  }
  return map;
}

function saveUsers() {
  mkdirSync(dirname(USERS_PATH), { recursive: true });
  writeFileSync(USERS_PATH, JSON.stringify([...memory().users.values()], null, 2));
}

export function publicUser(user: UserRecord): UserPublic {
  return {
    id: user.id,
    name: user.name,
    avatarUrl: avatarUrl(user.id, user.avatarRev),
    shells: user.shells ?? 0,
    owned: normalizeOwned(user.owned),
    outfit: normalizeOutfitId(user.outfit),
  };
}

export function findUserById(id: string) {
  return [...memory().users.values()].find((user) => user.id === id) ?? null;
}

export function registerUser(name: string, password: string) {
  const clean = normalizeName(name);
  if (clean.length < 2) throw new Error("昵称至少 2 个字");
  if (password.length < 4) throw new Error("密码至少 4 位");
  const key = clean.toLowerCase();
  if (memory().users.has(key)) throw new Error("昵称已被使用");
  const user: UserRecord = {
    id: `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name: clean,
    password: hashPassword(password),
    avatarRev: 0,
    shells: 0,
    owned: normalizeOwned(["astronaut"]),
    outfit: "astronaut",
  };
  memory().users.set(key, user);
  saveUsers();
  return publicUser(user);
}

export function loginUser(name: string, password: string) {
  const user = memory().users.get(normalizeName(name).toLowerCase());
  if (!user || !verifyPassword(password, user.password)) {
    throw new Error("昵称或密码错误");
  }
  return publicUser(user);
}

export function resetPassword(name: string, password: string) {
  const user = memory().users.get(normalizeName(name).toLowerCase());
  if (!user) throw new Error("昵称不存在");
  if (password.length < 4) throw new Error("密码至少 4 位");
  user.password = hashPassword(password);
  saveUsers();
  return publicUser(user);
}

export function setUserAvatar(userId: string, dataUrl: string) {
  const user = findUserById(userId);
  if (!user) throw new Error("请先登录");
  saveAvatarDataUrl(userId, dataUrl);
  user.avatarRev = (user.avatarRev ?? 0) + 1;
  saveUsers();
  return publicUser(user);
}

export function setUserName(userId: string, name: string) {
  const user = findUserById(userId);
  if (!user) throw new Error("请先登录");
  const clean = normalizeName(name);
  if (clean.length < 2) throw new Error("昵称至少 2 个字");
  const nextKey = clean.toLowerCase();
  const oldKey = user.name.toLowerCase();
  if (nextKey !== oldKey && memory().users.has(nextKey)) {
    throw new Error("昵称已被使用");
  }
  if (nextKey !== oldKey) {
    memory().users.delete(oldKey);
    user.name = clean;
    memory().users.set(nextKey, user);
  }
  for (const room of memory().rooms.values()) {
    for (const member of room.members) {
      if (member.id === userId) member.name = clean;
    }
    if (room.game) {
      const player = room.game.players.find((item) => item.id === userId);
      if (player) player.name = clean;
    }
  }
  saveUsers();
  return publicUser(user);
}

function makeCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 20; attempt += 1) {
    let code = "";
    for (let i = 0; i < 4; i += 1) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    if (!memory().rooms.has(code)) return code;
  }
  throw new Error("创建失败，请重试");
}

function decorateMembers(members: RoomRecord["members"]) {
  return members.map((member) => {
    const user = findUserById(member.id);
    return user
      ? publicUser(user)
      : { id: member.id, name: member.name };
  });
}

function decorateGame(game: Game | null): Game | null {
  if (!game) return null;
  return {
    ...game,
    players: game.players.map((player) => {
      const user = findUserById(player.id);
      return {
        ...player,
        avatarUrl: user ? publicUser(user).avatarUrl : player.avatarUrl,
        outfit: user ? publicUser(user).outfit : player.outfit,
      };
    }),
  };
}

export function snapshot(room: RoomRecord): RoomSnapshot {
  return {
    code: room.code,
    hostId: room.hostId,
    members: decorateMembers(room.members),
    status: room.status,
    mode: room.mode,
    tentacles: room.tentacles,
    opening: room.opening,
    maxRounds: room.maxRounds,
    game: decorateGame(room.game),
    danmaku: room.danmaku,
  };
}

export function createRoom(user: UserPublic, options?: { mode?: LinkMode; maxRounds?: number }) {
  const picked = parseRoomOptions(options ?? {});
  const code = makeCode();
  const room: RoomRecord = {
    code,
    hostId: user.id,
    members: [{ id: user.id, name: user.name }],
    status: "lobby",
    mode: picked.mode,
    tentacles: 8,
    opening: "yiming",
    maxRounds: picked.maxRounds,
    game: null,
    danmaku: [],
  };
  memory().rooms.set(code, room);
  return snapshot(room);
}

export function getRoom(code: string) {
  return memory().rooms.get(code.toUpperCase()) ?? null;
}

export function joinRoom(code: string, user: UserPublic) {
  const room = getRoom(code);
  if (!room) throw new Error("房间不存在");
  const seated = room.members.find((member) => member.id === user.id);
  if (seated) return snapshot(room);
  if (room.status !== "lobby") throw new Error("房间已开始");
  if (room.members.length >= MAX_PLAYERS) throw new Error("房间已满");
  room.members.push({ id: user.id, name: user.name });
  return snapshot(room);
}

export function configureRoom(
  code: string,
  userId: string,
  patch: Partial<Pick<RoomRecord, "mode" | "tentacles" | "opening" | "maxRounds">>,
) {
  const room = getRoom(code);
  if (!room) throw new Error("房间不存在");
  if (room.hostId !== userId) throw new Error("只有房主能修改");
  if (room.status !== "lobby") throw new Error("房间已开始");
  if (patch.mode) room.mode = patch.mode;
  if (patch.tentacles) room.tentacles = patch.tentacles;
  if (patch.opening) room.opening = patch.opening;
  if (patch.maxRounds) room.maxRounds = patch.maxRounds;
  return snapshot(room);
}

export function startRoom(code: string, userId: string) {
  const room = getRoom(code);
  if (!room) throw new Error("房间不存在");
  if (room.hostId !== userId) throw new Error("只有房主能开始");
  if (room.members.length < 2) throw new Error("至少 2 人");
  room.game = createGame(idiomIndex, {
    names: room.members.map((member) => member.name),
    seatPlayers: decorateMembers(room.members),
    mode: room.mode,
    tentacles: room.tentacles,
    opening: room.opening,
    maxRounds: room.maxRounds,
  });
  room.status = "playing";
  return snapshot(room);
}

export async function playRoom(
  code: string,
  userId: string,
  action: "submit" | "hint" | "pass" | "finish",
  word = "",
) {
  const room = getRoom(code);
  if (!room?.game) throw new Error("房间还没开始");
  if (action === "finish") {
    if (room.hostId !== userId) throw new Error("只有房主能结束");
    room.game = finishGame(room.game);
    room.status = "finished";
    room.game = await narrateGame(room.game, "finish", word, "finished");
    payoutRoom(room);
    return snapshot(room);
  }
  if (room.game.status !== "playing") throw new Error("本局已结束");
  const current = room.game.players[room.game.turn];
  if (current.id !== userId) throw new Error(`轮到 ${current.name}`);

  let reason: "hint" | ReturnType<typeof submit>["reason"] = "hint";
  if (action === "hint") {
    room.game = hint(idiomIndex, room.game);
  } else if (action === "pass") {
    const result = pass(idiomIndex, room.game);
    room.game = result.game;
    reason = result.reason;
  } else {
    const result = submit(idiomIndex, room.game, word);
    room.game = result.game;
    reason = result.reason;
  }
  if (room.game.status === "finished") room.status = "finished";
  room.game = await narrateGame(
    room.game,
    action,
    word,
    room.game.status === "finished" && action !== "hint" ? "finished" : reason,
  );
  if (room.game.status === "finished") payoutRoom(room);
  return snapshot(room);
}

export function postDanmaku(code: string, user: UserPublic, text: string) {
  const room = getRoom(code);
  if (!room) throw new Error("房间不存在");
  if (!room.members.some((member) => member.id === user.id)) {
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
  room.danmaku = [...room.danmaku, item].slice(-40);
  if (room.game?.status === "playing") {
    room.game = addFun(room.game, user.id, 1);
  }
  return snapshot(room);
}

let historyCache: HistoryRecord[] | null = null;

function loadHistory() {
  if (!existsSync(HISTORY_PATH)) return [] as HistoryRecord[];
  try {
    return JSON.parse(readFileSync(HISTORY_PATH, "utf8")) as HistoryRecord[];
  } catch {
    return [];
  }
}

function historyList() {
  if (!historyCache) historyCache = loadHistory();
  return historyCache;
}

function persistHistory() {
  mkdirSync(dirname(HISTORY_PATH), { recursive: true });
  writeFileSync(HISTORY_PATH, JSON.stringify(historyList(), null, 2));
}

function archiveGame(room: RoomRecord) {
  if (!room.game || room.game.status !== "finished") return;
  const record = historyFromGame({ code: room.code, game: room.game, danmaku: room.danmaku });
  const list = historyList();
  if (
    list.some(
      (item) => item.code === record.code && item.chain.join("→") === record.chain.join("→") && item.rounds === record.rounds,
    )
  ) {
    return;
  }
  historyCache = [record, ...list].slice(0, 80);
  persistHistory();
}

export function listHistory(userId: string) {
  return historyForUser(historyList(), userId).slice(0, 40);
}

function payoutRoom(room: RoomRecord) {
  if (!room.game || room.game.status !== "finished" || room.game.payouts) return;
  const titles = room.game.titles;
  const payouts: Record<string, number> = {};
  for (const player of room.game.players) {
    const user = findUserById(player.id);
    if (!user) continue;
    const amount = computeShells(player, titles);
    user.shells = (user.shells ?? 0) + amount;
    payouts[player.id] = amount;
  }
  if (Object.keys(payouts).length) saveUsers();
  room.game = { ...room.game, payouts };
  archiveGame(room);
}

export function buyOutfit(userId: string, outfitId: string) {
  const user = findUserById(userId);
  if (!user) throw new Error("请先登录");
  const outfit = getOutfit(outfitId);
  if (isFreeOutfit(outfit.id)) {
    user.outfit = outfit.id;
    saveUsers();
    return publicUser(user);
  }
  if ((user.owned ?? []).includes(outfit.id)) {
    user.outfit = outfit.id;
    saveUsers();
    return publicUser(user);
  }
  if ((user.shells ?? 0) < outfit.price) throw new Error("贝壳不够");
  user.shells -= outfit.price;
  user.owned = [...new Set([...normalizeOwned(user.owned), outfit.id])];
  user.outfit = outfit.id;
  saveUsers();
  return publicUser(user);
}

export function grantWardrobe(userId: string) {
  const user = findUserById(userId);
  if (!user) throw new Error("请先登录");
  user.shells = Math.max(user.shells ?? 0, 80);
  user.owned = OUTFITS.map((outfit) => outfit.id);
  saveUsers();
  return publicUser(user);
}

export function wearOutfit(userId: string, outfitId: string) {
  const user = findUserById(userId);
  if (!user) throw new Error("请先登录");
  const outfit = getOutfit(outfitId);
  if (!isFreeOutfit(outfit.id) && !(user.owned ?? []).includes(outfit.id)) {
    throw new Error("还没买");
  }
  user.outfit = outfit.id;
  saveUsers();
  return publicUser(user);
}

export function leaveRoom(code: string, userId: string) {
  const room = getRoom(code);
  if (!room) return null;
  room.members = room.members.filter((member) => member.id !== userId);
  if (room.members.length === 0) {
    memory().rooms.delete(room.code);
    return null;
  }
  if (room.hostId === userId) room.hostId = room.members[0].id;
  return snapshot(room);
}
