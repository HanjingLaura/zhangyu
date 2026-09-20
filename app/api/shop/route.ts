import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { buyOutfit, wearOutfit } from "@/lib/store";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const body = (await request.json()) as { action?: "buy" | "wear"; id?: string };
  try {
    const next =
      body.action === "wear"
        ? wearOutfit(user.id, body.id ?? "plain")
        : buyOutfit(user.id, body.id ?? "plain");
    return NextResponse.json({ user: next });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "换装失败" },
      { status: 400 },
    );
  }
}
