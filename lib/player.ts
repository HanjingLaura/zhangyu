import { normalizeName } from "./auth";
import { normalizeOutfitId } from "./wardrobe";
import type { RoomMember, UserPublic } from "./types";

const ID_RE = /^u[a-z0-9]{8,40}$/i;
const AVATAR_MAX = 700_000;

export function appearanceOf(user: Pick<UserPublic, "id" | "name" | "avatarUrl" | "outfit">): RoomMember {
  return {
    id: user.id,
    name: user.name,
    avatarUrl: sanitizeAvatar(user.avatarUrl),
    outfit: normalizeOutfitId(user.outfit),
  };
}

export function sanitizeAvatar(url?: string) {
  if (!url) return undefined;
  if (
    url.startsWith("data:image/jpeg;base64,") ||
    url.startsWith("data:image/jpg;base64,") ||
    url.startsWith("data:image/png;base64,") ||
    url.startsWith("data:image/webp;base64,")
  ) {
    return url.length <= AVATAR_MAX ? url : undefined;
  }
  return undefined;
}

export function parsePlayer(request: Request, body?: unknown): UserPublic | null {
  const headerRaw = request.headers.get("x-zy-player");
  let header: Partial<UserPublic> | null = null;
  if (headerRaw) {
    try {
      header = JSON.parse(headerRaw) as Partial<UserPublic>;
    } catch {
      header = null;
    }
  }
  const extra =
    body && typeof body === "object" && body !== null && "player" in body
      ? ((body as { player?: Partial<UserPublic> }).player ?? null)
      : null;
  const id = String(extra?.id ?? header?.id ?? "");
  const name = normalizeName(String(extra?.name ?? header?.name ?? ""));
  if (!ID_RE.test(id) || name.length < 2) return null;
  return {
    id,
    name,
    avatarUrl: sanitizeAvatar(extra?.avatarUrl ?? header?.avatarUrl),
    shells: 0,
    owned: [],
    outfit: normalizeOutfitId(extra?.outfit ?? header?.outfit),
  };
}

function latin1(value: string) {
  return /^[\x00-\xff]*$/.test(value) ? value : "";
}

export function playerHeaders(user: Pick<UserPublic, "id" | "name" | "outfit"> | null) {
  if (!user) return {} as Record<string, string>;
  return {
    "x-zy-player": JSON.stringify({
      id: user.id,
      name: latin1(user.name) || user.id,
      outfit: user.outfit,
    }),
  };
}

export function playerPayload(user: UserPublic) {
  return appearanceOf(user);
}
