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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; type: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id: submissionId, type } = await params;

  // Validate artifact type
  if (!ARTIFACT_TYPES.includes(type as ArtifactType)) {
    return NextResponse.json(
      { success: false, error: `Invalid artifact type "${type}". Must be one of: ${ARTIFACT_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  const artifactType = type as ArtifactType;

  // Verify submission exists and get phase info for file path
  const submissionResult = await query(
    `SELECT s.challenge_phase_id, cp.challenge_id, cp.phase_key, s.model_variant_id, s.channel_id
     FROM submissions s
     JOIN challenge_phases cp ON cp.id = s.challenge_phase_id
     WHERE s.id = $1`,
    [submissionId]
  );

  if (submissionResult.rows.length === 0) {
    return NextResponse.json(
      { success: false, error: "Submission not found" },
      { status: 404 }
    );
  }

  const row = submissionResult.rows[0] as Record<string, string>;
  const challengeId = row.challenge_id;
  const phaseKey = row.phase_key;
  const modelVariantId = row.model_variant_id;
  const channelId = row.channel_id;

  // Parse the file from form data
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { success: false, error: "No file provided. Use field name 'file'." },
      { status: 400 }
    );
  }

  const validation = validateFile(file, artifactType);
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
    artifactType,
    file.name
  );

  const dir = path.dirname(filePath);
  await ensureDir(dir);

  // Remove existing artifact file if it exists (before writing new one)
  const existingArtifact = await query(
    `SELECT file_path FROM submission_artifacts WHERE submission_id = $1 AND type = $2`,
    [submissionId, artifactType]
  );

  if (existingArtifact.rows.length > 0) {
    const uploadDir = getUploadDir();
    const oldRow = existingArtifact.rows[0] as Record<string, string>;
    const oldPath = path.join(uploadDir, oldRow.file_path);
    try {
      await fs.unlink(oldPath);
    } catch {
      // Old file may not exist, ignore
    }
  }

  // Write the new file
  await fs.writeFile(filePath, buffer);

  const relativePath = path.relative(getUploadDir(), filePath);

  // Upsert the artifact record
  const artifactResult = await query<SubmissionArtifact>(
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
      artifactType,
      relativePath,
      file.name,
      file.type || null,
      checksum,
      file.size,
      {},
    ]
  );

  return NextResponse.json({ success: true, data: artifactResult.rows[0] }, { status: 201 });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; type: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id: submissionId, type } = await params;

  // Validate artifact type
  if (!ARTIFACT_TYPES.includes(type as ArtifactType)) {
    return NextResponse.json(
      { success: false, error: `Invalid artifact type "${type}". Must be one of: ${ARTIFACT_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  const artifactType = type as ArtifactType;

  // Find the artifact
  const artifactResult = await query<SubmissionArtifact>(
    `SELECT * FROM submission_artifacts WHERE submission_id = $1 AND type = $2`,
    [submissionId, artifactType]
  );

  if (artifactResult.rows.length === 0) {
    return NextResponse.json(
      { success: false, error: "Artifact not found" },
      { status: 404 }
    );
  }

  const artifact = artifactResult.rows[0];

  // Remove file from disk
  const uploadDir = getUploadDir();
  const fullPath = path.join(uploadDir, artifact.file_path);
  try {
    await fs.unlink(fullPath);
  } catch {
    // File may already be deleted, ignore
  }

  // Delete the DB row
  await query(
    `DELETE FROM submission_artifacts WHERE submission_id = $1 AND type = $2`,
    [submissionId, artifactType]
  );

  return NextResponse.json({ success: true, data: { deleted: artifact.id } });
}
