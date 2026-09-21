import { normalizeName } from "./auth";
import { historyFromGame, type HistoryRecord } from "./history";
import { getOutfit, isFreeOutfit, normalizeOwned, normalizeOutfitId } from "./wardrobe";
import type { RoomSnapshot, UserPublic } from "./types";

export const LOCAL_KEY = "zy:local";

type LocalProfile = {
  id: string;
  name: string;
  pin: string;
  avatarUrl?: string;
  shells: number;
  owned: string[];
  outfit: string;
  paid: string[];
};

type LocalDB = {
  currentId: string | null;
  users: Record<string, LocalProfile>;
  history: HistoryRecord[];
};

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

let injected: StorageLike | null = null;

export function useLocalStorage(store: StorageLike | null) {
  injected = store;
}

function storage(): StorageLike | null {
  if (injected) return injected;
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function emptyDb(): LocalDB {
  return { currentId: null, users: {}, history: [] };
}

function readDb(): LocalDB {
  const store = storage();
  if (!store) return emptyDb();
  try {
    const raw = store.getItem(LOCAL_KEY);
    if (!raw) return emptyDb();
    const parsed = JSON.parse(raw) as Partial<LocalDB>;
    return {
      currentId: typeof parsed.currentId === "string" ? parsed.currentId : null,
      users: parsed.users && typeof parsed.users === "object" ? parsed.users : {},
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return emptyDb();
  }
}

function writeDb(db: LocalDB) {
  storage()?.setItem(LOCAL_KEY, JSON.stringify(db));
}

export async function hashPin(pin: string) {
  const bytes = new TextEncoder().encode(`zhangyu:${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function publicUser(user: LocalProfile): UserPublic {
  return {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl,
    shells: user.shells ?? 0,
    owned: normalizeOwned(user.owned),
    outfit: normalizeOutfitId(user.outfit),
  };
}

function requireUser(db: LocalDB, id = db.currentId) {
  if (!id) throw new Error("请先登录");
  const user = db.users[id];
  if (!user) throw new Error("请先登录");
  user.owned = normalizeOwned(user.owned);
  user.outfit = normalizeOutfitId(user.outfit);
  user.shells = user.shells ?? 0;
  user.paid = user.paid ?? [];
  return user;
}

function findByName(db: LocalDB, name: string) {
  const key = normalizeName(name).toLowerCase();
  return Object.values(db.users).find((user) => user.name.toLowerCase() === key) ?? null;
}

export function loadCurrentUser() {
  const db = readDb();
  if (!db.currentId || !db.users[db.currentId]) return null;
  return publicUser(requireUser(db));
}

export async function registerLocal(name: string, password: string, avatarUrl?: string) {
  const clean = normalizeName(name);
  if (clean.length < 2) throw new Error("昵称至少 2 个字");
  if (password.length < 4) throw new Error("密码至少 4 位");
  const db = readDb();
  if (findByName(db, clean)) throw new Error("本机已有这个昵称");
  const user: LocalProfile = {
    id: `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    name: clean,
    pin: await hashPin(password),
    avatarUrl: avatarUrl || undefined,
    shells: 0,
    owned: normalizeOwned(["astronaut"]),
    outfit: "astronaut",
    paid: [],
  };
  db.users[user.id] = user;
  db.currentId = user.id;
  writeDb(db);
  return publicUser(user);
}

export async function loginLocal(name: string, password: string) {
  const db = readDb();
  const user = findByName(db, name);
  if (!user) throw new Error("本机没有这个昵称，请先注册");
  if (user.pin !== (await hashPin(password))) throw new Error("昵称或密码错误");
  db.currentId = user.id;
  writeDb(db);
  return publicUser(user);
}

export async function resetLocal(name: string, password: string) {
  const db = readDb();
  const user = findByName(db, name);
  if (!user) throw new Error("昵称不存在");
  if (password.length < 4) throw new Error("密码至少 4 位");
  user.pin = await hashPin(password);
  db.currentId = user.id;
  writeDb(db);
  return publicUser(user);
}

export function logoutLocal() {
  const db = readDb();
  db.currentId = null;
  writeDb(db);
}

export function setLocalName(name: string) {
  const db = readDb();
  const user = requireUser(db);
  const clean = normalizeName(name);
  if (clean.length < 2) throw new Error("昵称至少 2 个字");
  const other = findByName(db, clean);
  if (other && other.id !== user.id) throw new Error("本机已有这个昵称");
  user.name = clean;
  writeDb(db);
  return publicUser(user);
}

export function setLocalAvatar(dataUrl: string) {
  const db = readDb();
  const user = requireUser(db);
  if (!dataUrl.startsWith("data:image/")) throw new Error("仅支持 jpg、png、webp");
  if (dataUrl.length < 32) throw new Error("图片太小");
  if (dataUrl.length > 700_000) throw new Error("图片太大");
  user.avatarUrl = dataUrl;
  writeDb(db);
  return publicUser(user);
}

export function buyOutfitLocal(outfitId: string) {
  const db = readDb();
  const user = requireUser(db);
  const outfit = getOutfit(outfitId);
  if (isFreeOutfit(outfit.id) || user.owned.includes(outfit.id)) {
    user.outfit = outfit.id;
    writeDb(db);
    return publicUser(user);
  }
  if (user.shells < outfit.price) throw new Error("贝壳不够");
  user.shells -= outfit.price;
  user.owned = [...new Set([...normalizeOwned(user.owned), outfit.id])];
  user.outfit = outfit.id;
  writeDb(db);
  return publicUser(user);
}

export function wearOutfitLocal(outfitId: string) {
  const db = readDb();
  const user = requireUser(db);
  const outfit = getOutfit(outfitId);
  if (!isFreeOutfit(outfit.id) && !user.owned.includes(outfit.id)) {
    throw new Error("还没买");
  }
  user.outfit = outfit.id;
  writeDb(db);
  return publicUser(user);
}

export function listLocalHistory() {
  const db = readDb();
  const user = db.currentId ? db.users[db.currentId] : null;
  if (!user) return [];
  return db.history.filter((item) => item.playerIds.includes(user.id)).slice(0, 40);
}

export function syncFinishedGame(room: RoomSnapshot) {
  if (room.status !== "finished" || !room.game) return loadCurrentUser();
  const db = readDb();
  if (!db.currentId || !db.users[db.currentId]) return null;
  const user = requireUser(db);
  const mark = `${room.code}:${room.game.seq}`;
  let changed = false;
  if (!user.paid.includes(mark)) {
    user.shells += room.game.payouts?.[user.id] ?? 0;
    user.paid = [...user.paid, mark].slice(-100);
    changed = true;
  }
  const record = historyFromGame({ code: room.code, game: room.game, danmaku: room.danmaku });
  if (
    !db.history.some(
      (item) =>
        item.code === record.code &&
        item.chain.join("→") === record.chain.join("→") &&
        item.rounds === record.rounds,
    )
  ) {
    db.history = [record, ...db.history].slice(0, 40);
    changed = true;
  }
  if (changed) writeDb(db);
  return publicUser(user);
}
