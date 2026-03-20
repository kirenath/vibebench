import { NextRequest } from "next/server";
import db from "@/lib/db";
import { success, validationError, unauthorized, internalError } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/api-utils";
import { buildArtifactDir, saveArtifactFile, getMimeType } from "@/lib/upload";
import { ARTIFACT_TYPES, TIMING_METHODS } from "@/lib/constants";
import type { ArtifactType } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const sp = new URL(request.url).searchParams;
    const challengeId = sp.get("challenge");
    const phaseKey = sp.get("phase");
    const modelVariantId = sp.get("model_variant");
    const channelId = sp.get("channel");

    let query = `SELECT * FROM submission_overview WHERE 1=1`;
    const params: unknown[] = [];
    let idx = 1;

    if (!admin) {
      query += ` AND submission_is_published = true AND challenge_is_published = true`;
    }
    if (challengeId) {
      query += ` AND challenge_id = $${idx++}`;
      params.push(challengeId);
    }
    if (phaseKey) {
      query += ` AND phase_key = $${idx++}`;
      params.push(phaseKey);
    }
    if (modelVariantId) {
      query += ` AND model_variant_id = $${idx++}`;
      params.push(modelVariantId);
    }
    if (channelId) {
      query += ` AND channel_id = $${idx++}`;
      params.push(channelId);
    }

    query += ` ORDER BY phase_sort_order, model_variant_name, channel_name`;
    const { rows } = await db.query(query, params);
    return success(rows);
  } catch {
    return internalError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return unauthorized();

    const formData = await request.formData();
    const challengePhaseId = formData.get("challenge_phase_id") as string;
    const modelVariantId = formData.get("model_variant_id") as string;
    const channelId = formData.get("channel_id") as string;

    if (!challengePhaseId || !modelVariantId || !channelId) {
      return validationError("challenge_phase_id, model_variant_id, and channel_id are required");
    }

    const timingMethod = formData.get("timing_method") as string | null;
    if (timingMethod && !TIMING_METHODS.includes(timingMethod as any)) {
      return validationError(`Invalid timing_method. Must be one of: ${TIMING_METHODS.join(", ")}`);
    }

    const phaseRow = await db.query(
      `SELECT cp.id, cp.phase_key, cp.challenge_id FROM challenge_phases cp WHERE cp.id = $1`,
      [challengePhaseId]
    );
    if (phaseRow.rows.length === 0) return validationError("Challenge phase not found");
    const { phase_key, challenge_id } = phaseRow.rows[0];

    const { rows } = await db.query(
      `INSERT INTO submissions
       (challenge_phase_id, model_variant_id, channel_id, is_published, manual_touched, manual_notes,
        iteration_count, run_started_at, run_finished_at, duration_ms, timing_method, prompt_snapshot, notes, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       ON CONFLICT (challenge_phase_id, model_variant_id, channel_id)
       DO UPDATE SET
         manual_touched = EXCLUDED.manual_touched,
         manual_notes = EXCLUDED.manual_notes,
         iteration_count = EXCLUDED.iteration_count,
         run_started_at = EXCLUDED.run_started_at,
         run_finished_at = EXCLUDED.run_finished_at,
         duration_ms = EXCLUDED.duration_ms,
         timing_method = EXCLUDED.timing_method,
         prompt_snapshot = EXCLUDED.prompt_snapshot,
         notes = EXCLUDED.notes,
         metadata = EXCLUDED.metadata
       RETURNING *`,
      [
        challengePhaseId,
        modelVariantId,
        channelId,
        formData.get("is_published") === "true",
        formData.get("manual_touched") === "true",
        formData.get("manual_notes") || null,
        formData.get("iteration_count") ? parseInt(formData.get("iteration_count") as string) : null,
        formData.get("run_started_at") || null,
        formData.get("run_finished_at") || null,
        formData.get("duration_ms") ? parseInt(formData.get("duration_ms") as string) : null,
        timingMethod || null,
        formData.get("prompt_snapshot") || null,
        formData.get("notes") || null,
        JSON.stringify(JSON.parse(formData.get("metadata") as string || "{}")),
      ]
    );

    const submission = rows[0];

    for (const artifactType of ARTIFACT_TYPES) {
      const file = formData.get(`file_${artifactType}`) as File | null;
      if (!file) continue;

      const buffer = Buffer.from(await file.arrayBuffer());
      const dir = buildArtifactDir(challenge_id, modelVariantId, channelId, phase_key, artifactType as ArtifactType);
      const { filePath, checksum, fileSize } = await saveArtifactFile(dir, file.name, buffer);

      await db.query(
        `INSERT INTO submission_artifacts (submission_id, type, file_path, file_name, mime_type, checksum, file_size)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (submission_id, type)
         DO UPDATE SET file_path = EXCLUDED.file_path, file_name = EXCLUDED.file_name,
                       mime_type = EXCLUDED.mime_type, checksum = EXCLUDED.checksum, file_size = EXCLUDED.file_size`,
        [submission.id, artifactType, filePath, file.name, getMimeType(file.name), checksum, fileSize]
      );
    }

    return success(submission, 201);
  } catch (e: any) {
    if (e.code === "23503") return validationError("Referenced entity not found");
    return internalError();
  }
}
