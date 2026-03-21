import { query, queryOne } from "@/lib/db";
import { json, errorResponse, withAdmin } from "@/lib/api-helpers";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  return withAdmin(async () => {
    const { id } = await params;
    const body = await request.json();
    const { phase_label, description, sort_order, is_default, metadata } = body;

    const existing = await queryOne(`SELECT id FROM challenge_phases WHERE id = $1`, [id]);
    if (!existing) return errorResponse("Phase not found", 404);

    const rows = await query(
      `UPDATE challenge_phases SET phase_label = COALESCE($1, phase_label),
       description = $2, sort_order = COALESCE($3, sort_order),
       is_default = COALESCE($4, is_default), metadata = COALESCE($5, metadata)
       WHERE id = $6 RETURNING *`,
      [phase_label, description, sort_order, is_default, metadata ? JSON.stringify(metadata) : null, id]
    );
    return json(rows[0]);
  });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  return withAdmin(async () => {
    const { id } = await params;
    await query(`DELETE FROM challenge_phases WHERE id = $1`, [id]);
    return json({ success: true });
  });
}
