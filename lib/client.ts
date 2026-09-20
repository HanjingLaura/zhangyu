import type { RoomSnapshot, UserPublic } from "./types";

async function read(response: Response) {
  const data = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(data.error ?? "请求失败");
  return data;
}

export async function apiMe() {
  const data = await read(await fetch("/api/auth/me", { cache: "no-store" }));
  return (data as { user: UserPublic | null }).user;
}

export async function apiRegister(name: string, password: string) {
  const data = await read(
    await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    }),
  );
  return (data as { user: UserPublic }).user;
}

export async function apiLogin(name: string, password: string) {
  const data = await read(
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    }),
  );
  return (data as { user: UserPublic }).user;
}

export async function apiResetPassword(name: string, password: string) {
  const data = await read(
    await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    }),
  );
  return (data as { user: UserPublic }).user;
}

export async function apiLogout() {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function apiUpdateName(name: string) {
  const data = await read(
    await fetch("/api/auth/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }),
  );
  return (data as { user: UserPublic }).user;
}

export async function apiUploadAvatar(image: string) {
  const data = await read(
    await fetch("/api/auth/avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image }),
    }),
  );
  return (data as { user: UserPublic }).user;
}

export async function apiCreateRoom(options?: { mode?: "char" | "pinyin"; maxRounds?: number }) {
  const data = await read(
    await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options ?? {}),
    }),
  );
  return (data as { room: RoomSnapshot }).room;
}

export async function apiRoom(code: string) {
  const data = await read(await fetch(`/api/rooms/${code}`, { cache: "no-store" }));
  return data as { room: RoomSnapshot; you: UserPublic };
}

export async function apiJoinRoom(code: string) {
  const data = await read(
    await fetch(`/api/rooms/${code}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join" }),
    }),
  );
  return (data as { room: RoomSnapshot }).room;
}

export async function apiConfigureRoom(
  code: string,
  patch: {
    mode?: "char" | "pinyin";
    tentacles?: number;
    opening?: "random" | "yiming" | "longfei";
    maxRounds?: number;
  },
) {
  const data = await read(
    await fetch(`/api/rooms/${code}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "configure", ...patch }),
    }),
  );
  return (data as { room: RoomSnapshot }).room;
}

export async function apiStartRoom(code: string) {
  const data = await read(await fetch(`/api/rooms/${code}/start`, { method: "POST" }));
  return (data as { room: RoomSnapshot }).room;
}

export async function apiMove(
  code: string,
  action: "submit" | "hint" | "pass" | "finish",
  word = "",
) {
  const data = await read(
    await fetch(`/api/rooms/${code}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, word }),
    }),
  );
  return data as { room: RoomSnapshot; you?: UserPublic };
}

export async function apiDanmaku(code: string, text: string) {
  const data = await read(
    await fetch(`/api/rooms/${code}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "danmaku", text }),
    }),
  );
  return (data as { room: RoomSnapshot }).room;
}

export async function apiShop(action: "buy" | "wear", id: string) {
  const data = await read(
    await fetch("/api/shop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id }),
    }),
  );
  return (data as { user: UserPublic }).user;
}

export async function apiLeaveRoom(code: string) {
  await fetch(`/api/rooms/${code}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "leave" }),
  });
}
