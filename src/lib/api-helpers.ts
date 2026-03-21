import { NextResponse } from "next/server";
import { getAdminFromCookie } from "./auth";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function withAdmin<T>(
  handler: () => Promise<T>
): Promise<T | NextResponse> {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return errorResponse("Unauthorized", 401);
  }
  return handler();
}
