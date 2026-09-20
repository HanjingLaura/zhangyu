import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { createRoom } from "@/lib/store";
import { parseRoomOptions } from "@/lib/seats";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { mode?: string; maxRounds?: number };
  return NextResponse.json({ room: createRoom(user, parseRoomOptions(body)) });
}
