import { NextResponse } from "next/server";
import { parsePlayer } from "@/lib/player";
import { configureRoom, getRoom, joinRoom, leaveRoom, postDanmaku, snapshot } from "@/lib/store";

type Params = { params: Promise<{ code: string }> };

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: Params) {
  const user = parsePlayer(request);
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const { code } = await params;
  const room = await getRoom(code);
  if (!room) return NextResponse.json({ error: "房间不存在" }, { status: 404 });
  if (!room.members.some((member) => member.id === user.id)) {
    return NextResponse.json({ error: "你不在这个房间" }, { status: 403 });
  }
  return NextResponse.json({ room: snapshot(room) });
}

export async function POST(request: Request, { params }: Params) {
  const { code } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    mode?: "char" | "pinyin";
    tentacles?: number;
    opening?: "random" | "yiming" | "longfei";
    maxRounds?: number;
    text?: string;
    player?: unknown;
  };
  const user = parsePlayer(request, body);
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  try {
    if (body.action === "leave") {
      return NextResponse.json({ room: await leaveRoom(code, user.id) });
    }
    if (body.action === "join") {
      return NextResponse.json({ room: await joinRoom(code, user) });
    }
    if (body.action === "danmaku") {
      return NextResponse.json({ room: await postDanmaku(code, user, body.text ?? "") });
    }
    if (body.action === "configure") {
      return NextResponse.json({ room: await configureRoom(code, user.id, body) });
    }
    throw new Error("不认识这个动作");
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "失败" },
      { status: 400 },
    );
  }
}
