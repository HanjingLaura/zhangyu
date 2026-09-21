import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { buyOutfit, grantWardrobe, wearOutfit } from "@/lib/store";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const body = (await request.json()) as { action?: "buy" | "wear" | "grant"; id?: string };
  try {
    const next =
      body.action === "grant" && process.env.NODE_ENV !== "production"
        ? grantWardrobe(user.id)
        : body.action === "wear"
          ? wearOutfit(user.id, body.id ?? "astronaut")
          : buyOutfit(user.id, body.id ?? "astronaut");
    return NextResponse.json({ user: next });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "换装失败" },
      { status: 400 },
    );
  }
}
