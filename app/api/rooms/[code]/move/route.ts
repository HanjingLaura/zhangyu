import { NextResponse } from "next/server";
import { parsePlayer } from "@/lib/player";
import { playRoom } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const body = (await request.json().catch(() => ({}))) as {
    action?: "submit" | "hint" | "pass" | "finish";
    word?: string;
    prev?: string;
    player?: unknown;
  };
  const user = parsePlayer(request, body);
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  try {
    const { code } = await params;
    return NextResponse.json({
      room: await playRoom(code, user.id, body.action ?? "submit", body.word ?? "", body.prev),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "操作失败" },
      { status: 400 },
    );
  }
}
