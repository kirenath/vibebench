import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { jsonOk, jsonError, requireAdmin } from "@/lib/api-helpers";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; phaseId: string }> }
) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;
  const { phaseId } = await params;

  try {
    const body = await request.json();
    const { phase_key, phase_label, sort_order, is_default } = body;

    const row = await query(
      `UPDATE challenge_phases SET
        phase_key = COALESCE($1, phase_key),
        phase_label = COALESCE($2, phase_label),
        sort_order = COALESCE($3, sort_order),
        is_default = COALESCE($4, is_default)
      WHERE id = $5 RETURNING *`,
      [phase_key ?? null, phase_label ?? null, sort_order ?? null, is_default ?? null, phaseId]
    );
    if (!row.length) return jsonError("Not found", 404);
    return jsonOk(row[0]);
  } catch (e) {
    return jsonError("Failed: " + (e as Error).message, 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; phaseId: string }> }
) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;
  const { phaseId } = await params;

  try {
    const row = await query(
      "DELETE FROM challenge_phases WHERE id = $1 RETURNING id",
      [phaseId]
    );
    if (!row.length) return jsonError("Not found", 404);
    return jsonOk({ deleted: true });
  } catch (e) {
    return jsonError("Failed: " + (e as Error).message, 500);
  }
}
