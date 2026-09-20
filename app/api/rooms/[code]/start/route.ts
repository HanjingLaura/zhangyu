import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { startRoom } from "@/lib/store";

export async function POST(_: Request, { params }: { params: Promise<{ code: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  try {
    const { code } = await params;
    return NextResponse.json({ room: startRoom(code, user.id), you: user });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "开始失败" },
      { status: 400 },
    );
  }
}
