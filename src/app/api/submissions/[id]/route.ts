import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { jsonOk, jsonError, requireAdmin } from "@/lib/api-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const rows = await query(
      "SELECT * FROM submission_overview WHERE submission_id = $1",
      [id]
    );
    if (!rows.length) return jsonError("Not found", 404);
    return jsonOk(rows[0]);
  } catch (e) {
    return jsonError("Failed: " + (e as Error).message, 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;
  const { id } = await params;

  try {
    const body = await request.json();
    const {
      is_published, manual_touched, manual_notes,
      iteration_count, run_started_at, run_finished_at,
      duration_ms, timing_method, prompt_snapshot, notes, metadata,
    } = body;

    const row = await query(
      `UPDATE submissions SET
        is_published = COALESCE($1, is_published),
        manual_touched = COALESCE($2, manual_touched),
        manual_notes = COALESCE($3, manual_notes),
        iteration_count = COALESCE($4, iteration_count),
        run_started_at = COALESCE($5, run_started_at),
        run_finished_at = COALESCE($6, run_finished_at),
        duration_ms = COALESCE($7, duration_ms),
        timing_method = COALESCE($8, timing_method),
        prompt_snapshot = COALESCE($9, prompt_snapshot),
        notes = COALESCE($10, notes),
        metadata = COALESCE($11, metadata),
        published_at = CASE WHEN $1 = true AND published_at IS NULL THEN now() WHEN $1 = false THEN NULL ELSE published_at END
      WHERE id = $12 RETURNING *`,
      [
        is_published, manual_touched, manual_notes ?? null,
        iteration_count ?? null, run_started_at || null, run_finished_at || null,
        duration_ms ?? null, timing_method || null, prompt_snapshot || null,
        notes || null, metadata ? JSON.stringify(metadata) : null, id,
      ]
    );
    if (!row.length) return jsonError("Not found", 404);
    return jsonOk(row[0]);
  } catch (e) {
    return jsonError("Failed: " + (e as Error).message, 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;
  const { id } = await params;

  try {
    const row = await query("DELETE FROM submissions WHERE id=$1 RETURNING id", [id]);
    if (!row.length) return jsonError("Not found", 404);
    return jsonOk({ deleted: true });
  } catch (e) {
    return jsonError("Failed: " + (e as Error).message, 500);
  }
}
