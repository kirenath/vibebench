import { query, queryOne } from "@/lib/db";
import { json, errorResponse, withAdmin } from "@/lib/api-helpers";
import { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import { UPLOAD_DIR } from "@/lib/constants";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const submission = await queryOne(
    `SELECT so.* FROM submission_overview so WHERE so.submission_id = $1::uuid`,
    [id]
  );
  if (!submission) return errorResponse("Submission not found", 404);

  // Also fetch artifacts
  const artifacts = await query(
    `SELECT * FROM submission_artifacts WHERE submission_id = $1::uuid ORDER BY type`,
    [id]
  );

  return json({ ...submission, artifacts });
}

export async function PUT(request: NextRequest, { params }: Params) {
  return withAdmin(async () => {
    const { id } = await params;
    const body = await request.json();
    const {
      is_published, manual_touched, manual_notes,
      iteration_count, run_started_at, run_finished_at,
      duration_ms, timing_method, prompt_snapshot, notes, metadata
    } = body;

    const existing = await queryOne<{ is_published: boolean; published_at: string | null }>(
      `SELECT is_published, published_at FROM submissions WHERE id = $1::uuid`, [id]
    );
    if (!existing) return errorResponse("Submission not found", 404);

    const publishedAt = is_published && !existing.published_at
      ? new Date().toISOString()
      : (is_published ? existing.published_at : null);

    const rows = await query(
      `UPDATE submissions SET
        is_published = COALESCE($1, is_published),
        manual_touched = COALESCE($2, manual_touched),
        manual_notes = $3, iteration_count = $4,
        run_started_at = $5, run_finished_at = $6,
        duration_ms = $7, timing_method = $8,
        prompt_snapshot = $9, notes = $10,
        metadata = COALESCE($11, metadata),
        published_at = $12
       WHERE id = $13::uuid RETURNING *`,
      [is_published, manual_touched, manual_notes, iteration_count,
       run_started_at, run_finished_at, duration_ms, timing_method,
       prompt_snapshot, notes, metadata ? JSON.stringify(metadata) : null,
       publishedAt, id]
    );
    return json(rows[0]);
  });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  return withAdmin(async () => {
    const { id } = await params;

    // Get file paths for cleanup
    const artifacts = await query<{ file_path: string }>(
      `SELECT file_path FROM submission_artifacts WHERE submission_id = $1::uuid`, [id]
    );

    await query(`DELETE FROM submissions WHERE id = $1::uuid`, [id]);

    // Clean up files
    for (const a of artifacts) {
      const fullPath = path.join(process.cwd(), UPLOAD_DIR, a.file_path);
      const dir = path.dirname(fullPath);
      try {
        await fs.rm(dir, { recursive: true, force: true });
      } catch { /* ignore */ }
    }

    return json({ success: true });
  });
}
