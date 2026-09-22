import { withBase } from "./base-path";
import {
  buyOutfitLocal,
  listLocalHistory,
  loadCurrentUser,
  loginLocal,
  logoutLocal,
  registerLocal,
  resetLocal,
  setLocalAvatar,
  setLocalName,
  wearOutfitLocal,
} from "./local-user";
import { playerHeaders, playerPayload } from "./player";
import type { HistoryRecord } from "./history";
import type { RoomSnapshot, UserPublic } from "./types";

async function read(response: Response) {
  const data = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(data.error ?? "请求失败");
  return data;
}

function send(path: string, init: RequestInit = {}) {
  const user = loadCurrentUser();
  const headers = new Headers(init.headers);
  const identity = playerHeaders(user);
  for (const [key, value] of Object.entries(identity)) headers.set(key, value);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(withBase(path), { ...init, headers, cache: "no-store" });
}

function withPlayer<T extends Record<string, unknown>>(body: T) {
  const user = loadCurrentUser();
  return user ? { ...body, player: playerPayload(user) } : body;
}

export async function apiMe() {
  return loadCurrentUser();
}

export async function apiRegister(name: string, password: string, avatar?: string) {
  return registerLocal(name, password, avatar);
}

export async function apiLogin(name: string, password: string) {
  return loginLocal(name, password);
}

export async function apiResetPassword(name: string, password: string) {
  return resetLocal(name, password);
}

export async function apiLogout() {
  logoutLocal();
}

export async function apiUpdateName(name: string) {
  return setLocalName(name);
}

export async function apiUploadAvatar(image: string) {
  return setLocalAvatar(image);
}

export async function apiCreateRoom(options?: {
  mode?: "char" | "pinyin" | "english";
  maxRounds?: number;
  buzz?: boolean;
}) {
  const data = await read(
    await send("/api/rooms", {
      method: "POST",
      body: JSON.stringify(withPlayer(options ?? {})),
    }),
  );
  return (data as { room: RoomSnapshot }).room;
}

export async function apiRoom(code: string) {
  const data = await read(await send(`/api/rooms/${code}`));
  return data as { room: RoomSnapshot; you?: UserPublic };
}

export async function apiJoinRoom(code: string) {
  const data = await read(
    await send(`/api/rooms/${code}`, {
      method: "POST",
      body: JSON.stringify(withPlayer({ action: "join" })),
    }),
  );
  return (data as { room: RoomSnapshot }).room;
}

export async function apiConfigureRoom(
  code: string,
  patch: {
    mode?: "char" | "pinyin" | "english";
    tentacles?: number;
    opening?: "random" | "yiming" | "longfei";
    maxRounds?: number;
  },
) {
  const data = await read(
    await send(`/api/rooms/${code}`, {
      method: "POST",
      body: JSON.stringify(withPlayer({ action: "configure", ...patch })),
    }),
  );
  return (data as { room: RoomSnapshot }).room;
}

export async function apiStartRoom(code: string) {
  const data = await read(
    await send(`/api/rooms/${code}/start`, {
      method: "POST",
      body: JSON.stringify(withPlayer({})),
    }),
  );
  return (data as { room: RoomSnapshot }).room;
}

export async function apiMove(
  code: string,
  action: "submit" | "hint" | "pass" | "finish",
  word = "",
  prev?: string,
) {
  const data = await read(
    await send(`/api/rooms/${code}/move`, {
      method: "POST",
      body: JSON.stringify(withPlayer({ action, word, prev })),
    }),
  );
  return data as { room: RoomSnapshot; you?: UserPublic };
}

export async function apiDanmaku(code: string, text: string) {
  const data = await read(
    await send(`/api/rooms/${code}`, {
      method: "POST",
      body: JSON.stringify(withPlayer({ action: "danmaku", text })),
    }),
  );
  return (data as { room: RoomSnapshot }).room;
}

export async function apiShop(action: "buy" | "wear", id: string) {
  return action === "wear" ? wearOutfitLocal(id) : buyOutfitLocal(id);
}

export async function apiHistory() {
  return listLocalHistory() as HistoryRecord[];
}

export async function apiLeaveRoom(code: string) {
  await send(`/api/rooms/${code}`, {
    method: "POST",
    body: JSON.stringify(withPlayer({ action: "leave" })),
  });
}
