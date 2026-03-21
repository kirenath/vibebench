import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, signToken, getCookieOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const valid = await verifyPassword(password);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    const token = signToken();
    const isSecure = request.nextUrl.protocol === "https:";
    const opts = getCookieOptions(isSecure);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(opts.name, token, {
      httpOnly: opts.httpOnly,
      secure: opts.secure,
      sameSite: opts.sameSite,
      path: opts.path,
      maxAge: opts.maxAge,
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
