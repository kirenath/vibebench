import { NextRequest } from "next/server";
import db from "@/lib/db";
import { success, validationError, unauthorized, internalError } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/api-utils";
import { buildArtifactDir, saveArtifactFile, getMimeType } from "@/lib/upload";
import { ARTIFACT_TYPES } from "@/lib/constants";
import type { ArtifactType } from "@/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return unauthorized();
    const { id: submissionId } = await params;

    const subRow = await db.query(
      `SELECT s.id, cp.phase_key, cp.challenge_id, s.model_variant_id, s.channel_id
       FROM submissions s
       JOIN challenge_phases cp ON cp.id = s.challenge_phase_id
       WHERE s.id = $1`,
      [submissionId]
    );
    if (subRow.rows.length === 0) return validationError("Submission not found");
    const { phase_key, challenge_id, model_variant_id, channel_id } = subRow.rows[0];

    const formData = await request.formData();
    const artifactType = formData.get("type") as string;
    if (!artifactType || !ARTIFACT_TYPES.includes(artifactType as any)) {
      return validationError(`Invalid type. Must be one of: ${ARTIFACT_TYPES.join(", ")}`);
    }

    const file = formData.get("file") as File | null;
    if (!file) return validationError("file is required");

    const buffer = Buffer.from(await file.arrayBuffer());
    const dir = buildArtifactDir(challenge_id, model_variant_id, channel_id, phase_key, artifactType as ArtifactType);
    const { filePath, checksum, fileSize } = await saveArtifactFile(dir, file.name, buffer);

    const { rows } = await db.query(
      `INSERT INTO submission_artifacts (submission_id, type, file_path, file_name, mime_type, checksum, file_size)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (submission_id, type)
       DO UPDATE SET file_path = EXCLUDED.file_path, file_name = EXCLUDED.file_name,
                     mime_type = EXCLUDED.mime_type, checksum = EXCLUDED.checksum, file_size = EXCLUDED.file_size
       RETURNING *`,
      [submissionId, artifactType, filePath, file.name, getMimeType(file.name), checksum, fileSize]
    );
    return success(rows[0], 201);
  } catch {
    return internalError();
  }
}
