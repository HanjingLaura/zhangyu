import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { configureRoom, getRoom, joinRoom, leaveRoom, postDanmaku, snapshot } from "@/lib/store";

type Params = { params: Promise<{ code: string }> };

export async function GET(_: Request, { params }: Params) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const { code } = await params;
  const room = getRoom(code);
  if (!room) return NextResponse.json({ error: "房间不存在" }, { status: 404 });
  if (!room.members.some((member) => member.id === user.id)) {
    return NextResponse.json({ error: "你不在这个房间" }, { status: 403 });
  }
  return NextResponse.json({ room: snapshot(room), you: user });
}

export async function POST(request: Request, { params }: Params) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const { code } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    mode?: "char" | "pinyin";
    tentacles?: number;
    opening?: "random" | "yiming" | "longfei";
    maxRounds?: number;
    text?: string;
  };
  try {
    if (body.action === "leave") {
      return NextResponse.json({ room: leaveRoom(code, user.id) });
    }
    if (body.action === "join") {
      return NextResponse.json({ room: joinRoom(code, user), you: user });
    }
    if (body.action === "danmaku") {
      return NextResponse.json({
        room: postDanmaku(code, user, body.text ?? ""),
        you: user,
      });
    }
    if (body.action === "configure") {
      return NextResponse.json({
        room: configureRoom(code, user.id, body),
        you: user,
      });
    }
    throw new Error("不认识这个动作");
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "失败" },
      { status: 400 },
    );
  }
}
