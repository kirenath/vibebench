import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { jsonOk, jsonError, requireAdmin } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const challengePhaseId = searchParams.get("challenge_phase_id");
    const isPublished = searchParams.get("is_published");

    let sql = "SELECT * FROM submission_overview WHERE 1=1";
    const params: unknown[] = [];
    let idx = 1;

    if (challengePhaseId) {
      sql += ` AND challenge_phase_id = $${idx++}`;
      params.push(challengePhaseId);
    }
    if (isPublished === "true") {
      sql += ` AND submission_is_published = true AND challenge_is_published = true`;
    }

    sql += " ORDER BY vendor_name, model_variant_name, channel_name";

    const rows = await query(sql, params);
    return jsonOk(rows);
  } catch (e) {
    return jsonError("Failed: " + (e as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const {
      challenge_phase_id, model_variant_id, channel_id,
      is_published, manual_touched, manual_notes,
      iteration_count, run_started_at, run_finished_at,
      duration_ms, timing_method, prompt_snapshot, notes, metadata,
    } = body;

    if (!challenge_phase_id || !model_variant_id || !channel_id) {
      return jsonError("challenge_phase_id, model_variant_id, and channel_id are required");
    }

    const row = await query(
      `INSERT INTO submissions (
        challenge_phase_id, model_variant_id, channel_id,
        is_published, manual_touched, manual_notes,
        iteration_count, run_started_at, run_finished_at,
        duration_ms, timing_method, prompt_snapshot, notes, metadata,
        published_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      ON CONFLICT (challenge_phase_id, model_variant_id, channel_id)
      DO UPDATE SET
        is_published = EXCLUDED.is_published,
        manual_touched = EXCLUDED.manual_touched,
        manual_notes = EXCLUDED.manual_notes,
        iteration_count = EXCLUDED.iteration_count,
        run_started_at = EXCLUDED.run_started_at,
        run_finished_at = EXCLUDED.run_finished_at,
        duration_ms = EXCLUDED.duration_ms,
        timing_method = EXCLUDED.timing_method,
        prompt_snapshot = EXCLUDED.prompt_snapshot,
        notes = EXCLUDED.notes,
        metadata = EXCLUDED.metadata,
        published_at = EXCLUDED.published_at
      RETURNING *`,
      [
        challenge_phase_id, model_variant_id, channel_id,
        is_published ?? false, manual_touched ?? false, manual_notes || null,
        iteration_count ?? null, run_started_at || null, run_finished_at || null,
        duration_ms ?? null, timing_method || null, prompt_snapshot || null,
        notes || null, JSON.stringify(metadata || {}),
        is_published ? new Date().toISOString() : null,
      ]
    );
    return jsonOk(row[0], 201);
  } catch (e) {
    return jsonError("Failed: " + (e as Error).message, 500);
  }
}
