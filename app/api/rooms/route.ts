import { NextResponse } from "next/server";
import { parsePlayer } from "@/lib/player";
import { createRoom } from "@/lib/store";
import { parseRoomOptions } from "@/lib/seats";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    mode?: string;
    maxRounds?: number;
    buzz?: boolean;
    player?: unknown;
  };
  const user = parsePlayer(request, body);
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  try {
    return NextResponse.json({ room: await createRoom(user, parseRoomOptions(body)) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "创建失败" },
      { status: 400 },
    );
  }
}
