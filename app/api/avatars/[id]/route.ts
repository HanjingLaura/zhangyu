import { NextResponse } from "next/server";
import { readAvatar } from "@/lib/avatar";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^u[a-z0-9]+$/i.test(id)) {
    return new NextResponse(null, { status: 404 });
  }
  const file = readAvatar(id);
  if (!file) return new NextResponse(null, { status: 404 });
  return new NextResponse(file, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
