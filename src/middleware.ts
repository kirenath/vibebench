import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { COOKIE_NAME } from "@/lib/constants";

const ADMIN_ROUTES = ["/admin/challenges", "/admin/models", "/admin/submissions"];
const ADMIN_API_PREFIXES = [
  "/api/challenges",
  "/api/challenge-phases",
  "/api/vendors",
  "/api/model-families",
  "/api/model-variants",
  "/api/channels",
  "/api/submissions",
];

// Routes that allow POST without auth (public APIs)
const PUBLIC_POST_ROUTES = ["/api/auth/login", "/api/auth/logout"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public GET requests to API
  if (pathname.startsWith("/api/") && request.method === "GET") {
    return NextResponse.next();
  }

  // Allow public POST to login/logout
  if (PUBLIC_POST_ROUTES.some((route) => pathname === route)) {
    return NextResponse.next();
  }

  // Allow sandbox file serving
  if (pathname.startsWith("/s/")) {
    return NextResponse.next();
  }

  // Check admin page routes
  const isAdminPage = ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const isAdminRoot = pathname === "/admin";

  // Check admin API routes (non-GET methods)
  const isAdminApi =
    pathname.startsWith("/api/") &&
    request.method !== "GET" &&
    !PUBLIC_POST_ROUTES.some((route) => pathname === route);

  if (isAdminPage || isAdminRoot || isAdminApi) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      if (isAdminPage || isAdminRoot) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const session = await verifySession(token);
    if (!session) {
      if (isAdminPage || isAdminRoot) {
        const response = NextResponse.redirect(
          new URL("/admin/login", request.url)
        );
        response.cookies.delete(COOKIE_NAME);
        return response;
      }
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*",
    "/s/:path*",
  ],
};
