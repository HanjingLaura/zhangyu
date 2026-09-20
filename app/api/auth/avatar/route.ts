import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { setUserAvatar } from "@/lib/store";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  try {
    const body = (await request.json()) as { image?: string };
    return NextResponse.json({
      user: setUserAvatar(user.id, body.image ?? ""),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "上传失败" },
      { status: 400 },
    );
  }
}
