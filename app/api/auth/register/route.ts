import { NextResponse } from "next/server";
import { writeSession } from "@/lib/session";
import { registerUser } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string; password?: string };
    const user = registerUser(body.name ?? "", body.password ?? "");
    await writeSession(user.id);
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "注册失败" },
      { status: 400 },
    );
  }
}
