import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { jsonOk, jsonError, requireAdmin } from "@/lib/api-helpers";

export async function GET() {
  try {
    const rows = await query(
      `SELECT mv.*, mf.name as family_name, v.id as vendor_id, v.name as vendor_name
       FROM model_variants mv
       JOIN model_families mf ON mf.id = mv.family_id
       JOIN vendors v ON v.id = mf.vendor_id
       ORDER BY v.sort_order, mf.sort_order, mv.sort_order, mv.name`
    );
    return jsonOk(rows);
  } catch (e) {
    return jsonError("Failed: " + (e as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;
  try {
    const { id, family_id, name, description, sort_order, metadata } = await request.json();
    if (!id || !family_id || !name) return jsonError("id, family_id, and name are required");
    const row = await query(
      "INSERT INTO model_variants (id, family_id, name, description, sort_order, metadata) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [id, family_id, name, description || null, sort_order ?? 0, JSON.stringify(metadata || {})]
    );
    return jsonOk(row[0], 201);
  } catch (e) {
    return jsonError("Failed: " + (e as Error).message, 500);
  }
}
