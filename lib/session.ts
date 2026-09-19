import { cookies } from "next/headers";
import { readSession, signSession } from "./auth";
import { findUserById, publicUser } from "./store";

export const SESSION_COOKIE = "zy_session";

export async function currentUser() {
  const jar = await cookies();
  const userId = readSession(jar.get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  const user = findUserById(userId);
  return user ? publicUser(user) : null;
}

export async function writeSession(userId: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, signSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
