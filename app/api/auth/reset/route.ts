import { NextResponse } from "next/server";
import { writeSession } from "@/lib/session";
import { resetPassword } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string; password?: string };
    const user = resetPassword(body.name ?? "", body.password ?? "");
    await writeSession(user.id);
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "重置失败" },
      { status: 400 },
    );
  }
}
