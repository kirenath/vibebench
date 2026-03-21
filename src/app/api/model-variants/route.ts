import { query } from "@/lib/db";
import { json, errorResponse, withAdmin } from "@/lib/api-helpers";
import { NextRequest } from "next/server";

export async function GET() {
  const rows = await query(
    `SELECT mv.*, mf.name as family_name, v.name as vendor_name, v.id as vendor_id
     FROM model_variants mv
     JOIN model_families mf ON mf.id = mv.family_id
     JOIN vendors v ON v.id = mf.vendor_id
     ORDER BY v.sort_order, mf.sort_order, mv.sort_order, mv.name`
  );
  return json(rows);
}

export async function POST(request: NextRequest) {
  return withAdmin(async () => {
    const body = await request.json();
    const { id, family_id, name, description, sort_order, metadata } = body;
    if (!id || !family_id || !name) return errorResponse("id, family_id and name are required");

    const rows = await query(
      `INSERT INTO model_variants (id, family_id, name, description, sort_order, metadata) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, family_id, name, description || null, sort_order || 0, JSON.stringify(metadata || {})]
    );
    return json(rows[0], 201);
  });
}
