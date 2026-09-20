import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { playRoom } from "@/lib/store";

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const body = (await request.json()) as {
    action?: "submit" | "hint" | "pass" | "finish";
    word?: string;
  };
  try {
    const { code } = await params;
    return NextResponse.json({
      room: playRoom(code, user.id, body.action ?? "submit", body.word ?? ""),
      you: user,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "操作失败" },
      { status: 400 },
    );
  }
}
