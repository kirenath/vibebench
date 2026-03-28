import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  validateFile,
  computeChecksum,
  ensureDir,
  buildArtifactFilePath,
  getUploadDir,
} from "@/lib/upload";
import { ARTIFACT_TYPES } from "@/lib/constants";
import type { ArtifactType, SubmissionArtifact } from "@/types";
import { promises as fs } from "fs";
import path from "path";

async function requireAdmin(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const isAdmin = await requireAdmin();

  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (!isAdmin) {
    conditions.push(`so.submission_is_published = true`);
  } else {
    const all = searchParams.get("all");
    if (all !== "true") {
      conditions.push(`so.submission_is_published = true`);
    }
  }

  const challengeId = searchParams.get("challenge_id");
  if (challengeId) {
    conditions.push(`so.challenge_id = $${paramIndex++}`);
    params.push(challengeId);
  }

  const phaseId = searchParams.get("phase_id");
  if (phaseId) {
    conditions.push(`so.challenge_phase_id = $${paramIndex++}`);
    params.push(phaseId);
  }

  const modelVariantId = searchParams.get("model_variant_id");
  if (modelVariantId) {
    conditions.push(`so.model_variant_id = $${paramIndex++}`);
    params.push(modelVariantId);
  }

  const channelId = searchParams.get("channel_id");
  if (channelId) {
    conditions.push(`so.channel_id = $${paramIndex++}`);
    params.push(channelId);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await query(
    `SELECT * FROM submission_overview so ${whereClause} ORDER BY so.created_at DESC`,
    params
  );

  return NextResponse.json({ success: true, data: result.rows });
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();

  const challengePhaseId = formData.get("challenge_phase_id") as string | null;
  const modelVariantId = formData.get("model_variant_id") as string | null;
  const channelId = formData.get("channel_id") as string | null;

  if (!challengePhaseId || !modelVariantId || !channelId) {
    return NextResponse.json(
      { success: false, error: "challenge_phase_id, model_variant_id, and channel_id are required" },
      { status: 400 }
    );
  }

  const isPublished = formData.get("is_published") === "true";
  const manualTouched = formData.get("manual_touched") === "true";
  const manualNotes = formData.get("manual_notes") as string | null;
  const iterationCount = formData.get("iteration_count")
    ? parseInt(formData.get("iteration_count") as string, 10)
    : null;
  const runStartedAt = (formData.get("run_started_at") as string) || null;
  const runFinishedAt = (formData.get("run_finished_at") as string) || null;
  const durationMs = formData.get("duration_ms")
    ? parseInt(formData.get("duration_ms") as string, 10)
    : null;
  const timingMethod = (formData.get("timing_method") as string) || null;
  const promptSnapshot = (formData.get("prompt_snapshot") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const metadataStr = formData.get("metadata") as string | null;
  const metadata = metadataStr ? JSON.parse(metadataStr) : {};

  const publishedAt = isPublished ? new Date().toISOString() : null;

  // Look up challenge_phase to get challenge_id and phase_key for file paths
  const phaseResult = await query(
    `SELECT challenge_id, phase_key FROM challenge_phases WHERE id = $1`,
    [challengePhaseId]
  );
  if (phaseResult.rows.length === 0) {
    return NextResponse.json(
      { success: false, error: "Challenge phase not found" },
      { status: 404 }
    );
  }
  const phaseRow = phaseResult.rows[0] as Record<string, string>;
  const challengeId = phaseRow.challenge_id;
  const phaseKey = phaseRow.phase_key;

  // Upsert submission using unique constraint (challenge_phase_id, model_variant_id, channel_id)
  const upsertResult = await query(
    `INSERT INTO submissions (
      challenge_phase_id, model_variant_id, channel_id,
      is_published, manual_touched, manual_notes,
      iteration_count, run_started_at, run_finished_at,
      duration_ms, timing_method, prompt_snapshot,
      notes, metadata, published_at
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
      published_at = EXCLUDED.published_at,
      updated_at = now()
    RETURNING id`,
    [
      challengePhaseId, modelVariantId, channelId,
      isPublished, manualTouched, manualNotes,
      iterationCount, runStartedAt, runFinishedAt,
      durationMs, timingMethod, promptSnapshot,
      notes, metadata, publishedAt,
    ]
  );

  const submissionId = upsertResult.rows[0].id;

  // Handle file uploads for artifacts
  const savedArtifacts: SubmissionArtifact[] = [];

  for (const type of ARTIFACT_TYPES) {
    const file = formData.get(type) as File | null;
    if (!file || !(file instanceof File) || file.size === 0) continue;

    const validation = validateFile(file, type as ArtifactType);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const checksum = computeChecksum(buffer);
    const filePath = buildArtifactFilePath(
      { challengeId, modelVariantId, channelId, phaseKey },
      type as ArtifactType,
      file.name
    );

    const dir = path.dirname(filePath);
    await ensureDir(dir);
    await fs.writeFile(filePath, buffer);

    const relativePath = path.relative(getUploadDir(), filePath);

    const artifactResult = await query(
      `INSERT INTO submission_artifacts (submission_id, type, file_path, file_name, mime_type, checksum, file_size, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (submission_id, type)
       DO UPDATE SET
         file_path = EXCLUDED.file_path,
         file_name = EXCLUDED.file_name,
         mime_type = EXCLUDED.mime_type,
         checksum = EXCLUDED.checksum,
         file_size = EXCLUDED.file_size,
         metadata = EXCLUDED.metadata,
         updated_at = now()
       RETURNING *`,
      [
        submissionId,
        type,
        relativePath,
        file.name,
        file.type || null,
        checksum,
        file.size,
        {},
      ]
    );

    savedArtifacts.push(artifactResult.rows[0] as unknown as SubmissionArtifact);
  }

  return NextResponse.json(
    { success: true, data: { submissionId, artifacts: savedArtifacts } },
    { status: 201 }
  );
}
