import { NextResponse } from "next/server";
import { parsePlayer } from "@/lib/player";
import { startRoom } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const body = await request.json().catch(() => ({}));
  const user = parsePlayer(request, body);
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  try {
    const { code } = await params;
    return NextResponse.json({ room: await startRoom(code, user.id) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "开始失败" },
      { status: 400 },
    );
  }
}
