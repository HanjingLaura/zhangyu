import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { avatarUrl, saveAvatarDataUrl } from "./avatar";
import { hashPassword, normalizeName, verifyPassword } from "./auth";
import { addFun, createGame, finishGame, hint, pass, submit } from "./engine";
import { idiomIndex } from "./dictionary";
import type { Danmaku, Game, GameConfig, RoomSnapshot, UserPublic } from "./types";

type UserRecord = {
  id: string;
  name: string;
  password: string;
  avatarRev: number;
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
    map.set(row.name.toLowerCase(), { ...row, avatarRev: row.avatarRev ?? 0 });
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
  };
}

export function findUserById(id: string) {
  return [...memory().users.values()].find((user) => user.id === id) ?? null;
}

export function registerUser(name: string, password: string) {
  const clean = normalizeName(name);
  if (clean.length < 2) throw new Error("名字至少两个字");
  if (password.length < 4) throw new Error("密码至少四位");
  const key = clean.toLowerCase();
  if (memory().users.has(key)) throw new Error("这个名字已经被占用");
  const user: UserRecord = {
    id: `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name: clean,
    password: hashPassword(password),
    avatarRev: 0,
  };
  memory().users.set(key, user);
  saveUsers();
  return publicUser(user);
}

export function loginUser(name: string, password: string) {
  const user = memory().users.get(normalizeName(name).toLowerCase());
  if (!user || !verifyPassword(password, user.password)) {
    throw new Error("名字或密码不对");
  }
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

function makeCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 20; attempt += 1) {
    let code = "";
    for (let i = 0; i < 4; i += 1) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    if (!memory().rooms.has(code)) return code;
  }
  throw new Error("暂时开不出新桌");
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

export function createRoom(user: UserPublic) {
  const code = makeCode();
  const room: RoomRecord = {
    code,
    hostId: user.id,
    members: [{ id: user.id, name: user.name }],
    status: "lobby",
    mode: "char",
    tentacles: 8,
    opening: "yiming",
    maxRounds: 100,
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
  if (!room) throw new Error("没有这张桌子");
  const seated = room.members.find((member) => member.id === user.id);
  if (seated) return snapshot(room);
  if (room.status !== "lobby") throw new Error("这桌已经开打了");
  if (room.members.length >= 4) throw new Error("这桌坐满了");
  room.members.push({ id: user.id, name: user.name });
  return snapshot(room);
}

export function configureRoom(
  code: string,
  userId: string,
  patch: Partial<Pick<RoomRecord, "mode" | "tentacles" | "opening" | "maxRounds">>,
) {
  const room = getRoom(code);
  if (!room) throw new Error("没有这张桌子");
  if (room.hostId !== userId) throw new Error("只有开桌的人能改");
  if (room.status !== "lobby") throw new Error("已经开打了");
  if (patch.mode) room.mode = patch.mode;
  if (patch.tentacles) room.tentacles = patch.tentacles;
  if (patch.opening) room.opening = patch.opening;
  if (patch.maxRounds) room.maxRounds = patch.maxRounds;
  return snapshot(room);
}

export function startRoom(code: string, userId: string) {
  const room = getRoom(code);
  if (!room) throw new Error("没有这张桌子");
  if (room.hostId !== userId) throw new Error("只有开桌的人能开打");
  if (room.members.length < 2) throw new Error("至少两个人才能开打");
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

export function playRoom(
  code: string,
  userId: string,
  action: "submit" | "hint" | "pass" | "finish",
  word = "",
) {
  const room = getRoom(code);
  if (!room?.game) throw new Error("这桌还没开打");
  if (action === "finish") {
    if (room.hostId !== userId) throw new Error("只有开桌的人能散场");
    room.game = finishGame(room.game);
    room.status = "finished";
    return snapshot(room);
  }
  if (room.game.status !== "playing") throw new Error("这局已经结束了");
  const current = room.game.players[room.game.turn];
  if (current.id !== userId) throw new Error(`现在轮到 ${current.name}`);

  if (action === "hint") room.game = hint(idiomIndex, room.game);
  else if (action === "pass") room.game = pass(idiomIndex, room.game).game;
  else room.game = submit(idiomIndex, room.game, word).game;
  if (room.game.status === "finished") room.status = "finished";
  return snapshot(room);
}

export function postDanmaku(code: string, user: UserPublic, text: string) {
  const room = getRoom(code);
  if (!room) throw new Error("没有这张桌子");
  if (!room.members.some((member) => member.id === user.id)) {
    throw new Error("你不在这桌上");
  }
  const clean = text.replace(/\s+/g, " ").trim().slice(0, 24);
  if (!clean) throw new Error("弹幕是空的");
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
