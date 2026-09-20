import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const AVATAR_DIR = join(process.cwd(), "data", "avatars");
const MAX_BYTES = 450_000;

export function avatarFile(id: string) {
  return join(AVATAR_DIR, `${id}.jpg`);
}

export function hasAvatar(id: string) {
  return existsSync(avatarFile(id));
}

export function readAvatar(id: string) {
  if (!hasAvatar(id)) return null;
  return readFileSync(avatarFile(id));
}

export function avatarUrl(id: string, rev = 0) {
  return hasAvatar(id) ? `/api/avatars/${id}?v=${rev}` : undefined;
}

export function saveAvatarDataUrl(id: string, dataUrl: string) {
  const match = dataUrl.match(/^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error("仅支持 jpg、png、webp");
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length < 32) throw new Error("图片太小");
  if (buffer.length > MAX_BYTES) throw new Error("图片太大");
  mkdirSync(dirname(avatarFile(id)), { recursive: true });
  writeFileSync(avatarFile(id), buffer);
}
