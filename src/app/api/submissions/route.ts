import { query } from "@/lib/db";
import { json, errorResponse, withAdmin } from "@/lib/api-helpers";
import { NextRequest } from "next/server";
import { getAdminFromCookie } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const admin = await getAdminFromCookie();
  const sp = request.nextUrl.searchParams;
  const challengeId = sp.get("challenge");
  const phaseId = sp.get("phase");
  const modelVariantId = sp.get("model_variant");
  const channelId = sp.get("channel");

  let sql = `SELECT so.* FROM submission_overview so WHERE 1=1`;
  const params: unknown[] = [];
  let idx = 1;

  if (!admin) {
    sql += ` AND so.submission_is_published = true AND so.challenge_is_published = true`;
  }
  if (challengeId) { sql += ` AND so.challenge_id = $${idx++}`; params.push(challengeId); }
  if (phaseId) { sql += ` AND so.challenge_phase_id = $${idx++}`; params.push(phaseId); }
  if (modelVariantId) { sql += ` AND so.model_variant_id = $${idx++}`; params.push(modelVariantId); }
  if (channelId) { sql += ` AND so.channel_id = $${idx++}`; params.push(channelId); }

  sql += ` ORDER BY so.phase_sort_order, so.vendor_name, so.model_variant_name, so.created_at DESC`;

  const rows = await query(sql, params);
  return json(rows);
}

export async function POST(request: NextRequest) {
  return withAdmin(async () => {
    const body = await request.json();
    const {
      challenge_phase_id, model_variant_id, channel_id,
      is_published, manual_touched, manual_notes,
      iteration_count, run_started_at, run_finished_at,
      duration_ms, timing_method, prompt_snapshot, notes, metadata
    } = body;

    if (!challenge_phase_id || !model_variant_id || !channel_id) {
      return errorResponse("challenge_phase_id, model_variant_id, and channel_id are required");
    }

    const rows = await query(
      `INSERT INTO submissions (
        challenge_phase_id, model_variant_id, channel_id,
        is_published, manual_touched, manual_notes,
        iteration_count, run_started_at, run_finished_at,
        duration_ms, timing_method, prompt_snapshot, notes, metadata,
        published_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      ON CONFLICT (challenge_phase_id, model_variant_id, channel_id) DO UPDATE SET
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
        is_published || false, manual_touched || false, manual_notes || null,
        iteration_count || null, run_started_at || null, run_finished_at || null,
        duration_ms || null, timing_method || null, prompt_snapshot || null,
        notes || null, JSON.stringify(metadata || {}),
        is_published ? new Date().toISOString() : null,
      ]
    );
    return json(rows[0], 201);
  });
}
