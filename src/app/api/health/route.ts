import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";

export async function GET() {
  try {
    // Simple query to ensure the database connectivity is active
    await queryOne("SELECT 1 AS health_check");
    return NextResponse.json({ status: "operational" }, { status: 200 });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json({ status: "degraded", error: String(error) }, { status: 503 });
  }
}
