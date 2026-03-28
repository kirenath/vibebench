import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  entry.count += 1;
  return entry.count > 5;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { password } = body;

  if (!password || typeof password !== "string") {
    return NextResponse.json(
      { success: false, error: "Password is required." },
      { status: 400 }
    );
  }

  try {
    const valid = await verifyPassword(password);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Invalid password." },
        { status: 401 }
      );
    }

    const token = await createSession();
    await setSessionCookie(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Authentication failed.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
