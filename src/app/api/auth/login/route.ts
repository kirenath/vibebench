import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, signToken, adminCookieOptions } from "@/lib/auth";
import { success, validationError, unauthorized, internalError } from "@/lib/api-utils";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (isRateLimited(`login:${ip}`, 10, 5 * 60 * 1000)) {
      return NextResponse.json(
        { error: { code: "RATE_LIMITED", message: "Too many login attempts" } },
        { status: 429 }
      );
    }

    const body = await request.json();
    if (!body.password || typeof body.password !== "string") {
      return validationError("Password is required");
    }

    const valid = await verifyPassword(body.password);
    if (!valid) return unauthorized("Invalid password");

    const token = signToken();
    const opts = adminCookieOptions();

    const res = success({ message: "Logged in" });
    res.cookies.set(opts.name, token, {
      httpOnly: opts.httpOnly,
      secure: opts.secure,
      sameSite: opts.sameSite,
      path: opts.path,
      maxAge: opts.maxAge,
    });
    return res;
  } catch {
    return internalError();
  }
}
