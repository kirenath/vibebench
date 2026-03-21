import { query } from "@/lib/db";
import { json, errorResponse, withAdmin } from "@/lib/api-helpers";
import { NextRequest } from "next/server";

export async function GET() {
  const rows = await query(
    `SELECT mf.*, v.name as vendor_name FROM model_families mf
     JOIN vendors v ON v.id = mf.vendor_id ORDER BY v.sort_order, mf.sort_order, mf.name`
  );
  return json(rows);
}

export async function POST(request: NextRequest) {
  return withAdmin(async () => {
    const body = await request.json();
    const { id, vendor_id, name, description, sort_order, metadata } = body;
    if (!id || !vendor_id || !name) return errorResponse("id, vendor_id and name are required");

    const rows = await query(
      `INSERT INTO model_families (id, vendor_id, name, description, sort_order, metadata) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, vendor_id, name, description || null, sort_order || 0, JSON.stringify(metadata || {})]
    );
    return json(rows[0], 201);
  });
}
