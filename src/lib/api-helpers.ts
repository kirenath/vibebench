import { NextResponse } from "next/server";
import { verifyAdmin } from "./auth";

export function jsonOk(data: unknown, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function jsonError(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function requireAdmin() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return jsonError("Unauthorized", 401);
  }
  return null;
}
