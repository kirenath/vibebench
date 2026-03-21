import { query, queryOne } from "@/lib/db";
import { json, errorResponse, withAdmin } from "@/lib/api-helpers";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  return withAdmin(async () => {
    const { id } = await params;
    const body = await request.json();
    const { vendor_id, name, description, sort_order, metadata } = body;
    const existing = await queryOne(`SELECT id FROM model_families WHERE id = $1`, [id]);
    if (!existing) return errorResponse("Model family not found", 404);

    const rows = await query(
      `UPDATE model_families SET vendor_id = COALESCE($1, vendor_id), name = COALESCE($2, name),
       description = $3, sort_order = COALESCE($4, sort_order), metadata = COALESCE($5, metadata)
       WHERE id = $6 RETURNING *`,
      [vendor_id, name, description, sort_order, metadata ? JSON.stringify(metadata) : null, id]
    );
    return json(rows[0]);
  });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  return withAdmin(async () => {
    const { id } = await params;
    try {
      await query(`DELETE FROM model_families WHERE id = $1`, [id]);
      return json({ success: true });
    } catch {
      return errorResponse("Cannot delete model family with existing variants", 409);
    }
  });
}
