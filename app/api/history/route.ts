import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { listHistory } from "@/lib/store";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  return NextResponse.json({ records: listHistory(user.id) });
}
