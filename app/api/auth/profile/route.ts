import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { setUserName } from "@/lib/store";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  try {
    const body = (await request.json()) as { name?: string };
    return NextResponse.json({
      user: setUserName(user.id, body.name ?? ""),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "保存失败" },
      { status: 400 },
    );
  }
}
