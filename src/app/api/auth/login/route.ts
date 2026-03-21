import { NextRequest } from "next/server";
import { verifyPassword, signAdminToken, setAuthCookie } from "@/lib/auth";
import { json, errorResponse } from "@/lib/api-helpers";

// Simple in-memory rate limiter
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now - entry.lastAttempt > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
  entry.count++;
  entry.lastAttempt = now;
  return true;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) {
    return errorResponse("Too many login attempts. Try again later.", 429);
  }

  try {
    const { password } = await request.json();
    if (!password || typeof password !== "string") {
      return errorResponse("Password is required");
    }

    const valid = await verifyPassword(password);
    if (!valid) {
      return errorResponse("Invalid password", 401);
    }

    const token = signAdminToken();
    await setAuthCookie(token);
    return json({ success: true });
  } catch {
    return errorResponse("Login failed", 500);
  }
}
