import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { jsonOk, jsonError, requireAdmin } from "@/lib/api-helpers";

export async function GET() {
  try {
    const rows = await query("SELECT * FROM vendors ORDER BY sort_order, name");
    return jsonOk(rows);
  } catch (e) {
    return jsonError("Failed: " + (e as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;
  try {
    const { id, name, description, sort_order, metadata } = await request.json();
    if (!id || !name) return jsonError("id and name are required");
    const row = await query(
      "INSERT INTO vendors (id, name, description, sort_order, metadata) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [id, name, description || null, sort_order ?? 0, JSON.stringify(metadata || {})]
    );
    return jsonOk(row[0], 201);
  } catch (e) {
    return jsonError("Failed: " + (e as Error).message, 500);
  }
}
