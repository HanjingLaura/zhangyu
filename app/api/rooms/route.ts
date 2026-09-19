import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { createRoom } from "@/lib/store";

export async function POST() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  return NextResponse.json({ room: createRoom(user) });
}
