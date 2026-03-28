import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST(_request: NextRequest) {
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
