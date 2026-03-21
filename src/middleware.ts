import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "vibebench_admin_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip login page itself
  if (pathname === "/admin/login") {
    // If already authenticated, redirect to challenges
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      return NextResponse.redirect(new URL("/admin/challenges", request.url));
    }
    return NextResponse.next();
  }

  // All other /admin/* routes require auth cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
