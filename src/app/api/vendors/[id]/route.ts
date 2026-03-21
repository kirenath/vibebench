import { query, queryOne } from "@/lib/db";
import { json, errorResponse, withAdmin } from "@/lib/api-helpers";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  return withAdmin(async () => {
    const { id } = await params;
    const body = await request.json();
    const { name, description, sort_order, metadata } = body;
    const existing = await queryOne(`SELECT id FROM vendors WHERE id = $1`, [id]);
    if (!existing) return errorResponse("Vendor not found", 404);

    const rows = await query(
      `UPDATE vendors SET name = COALESCE($1, name), description = $2,
       sort_order = COALESCE($3, sort_order), metadata = COALESCE($4, metadata) WHERE id = $5 RETURNING *`,
      [name, description, sort_order, metadata ? JSON.stringify(metadata) : null, id]
    );
    return json(rows[0]);
  });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  return withAdmin(async () => {
    const { id } = await params;
    try {
      await query(`DELETE FROM vendors WHERE id = $1`, [id]);
      return json({ success: true });
    } catch {
      return errorResponse("Cannot delete vendor with existing model families", 409);
    }
  });
}
