import { NextRequest } from "next/server";
import { query, queryOne } from "@/lib/db";
import { jsonOk, jsonError, requireAdmin } from "@/lib/api-helpers";
import { saveFile, getObjectKeyPrefix, validateExtension, validateFileSize } from "@/lib/upload";
import { ARTIFACT_TYPES } from "@/lib/constants";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;
  const { id } = await params;

  try {
    const submission = await queryOne(
      `SELECT s.id, cp.challenge_id, cp.phase_key, s.model_variant_id, s.channel_id
       FROM submissions s
       JOIN challenge_phases cp ON cp.id = s.challenge_phase_id
       WHERE s.id = $1`,
      [id]
    );
    if (!submission) return jsonError("Submission not found", 404);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    if (!file || !type) return jsonError("file and type are required");
    if (!ARTIFACT_TYPES.includes(type as typeof ARTIFACT_TYPES[number])) {
      return jsonError("Invalid type. Must be: " + ARTIFACT_TYPES.join(", "));
    }
    if (!validateExtension(file.name, type)) {
      return jsonError("Invalid file extension for type: " + type);
    }
    if (!validateFileSize(file.size)) {
      return jsonError("File too large");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const keyPrefix = getObjectKeyPrefix(
      (submission as Record<string, string>).challenge_id,
      (submission as Record<string, string>).model_variant_id,
      (submission as Record<string, string>).channel_id,
      (submission as Record<string, string>).phase_key,
      type
    );
    const { objectKey, checksum, fileSize } = await saveFile(buffer, keyPrefix, file.name, file.type);

    const row = await query(
      `INSERT INTO submission_artifacts (submission_id, type, file_path, file_name, mime_type, checksum, file_size)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (submission_id, type)
       DO UPDATE SET file_path=EXCLUDED.file_path, file_name=EXCLUDED.file_name, mime_type=EXCLUDED.mime_type, checksum=EXCLUDED.checksum, file_size=EXCLUDED.file_size
       RETURNING *`,
      [id, type, objectKey, file.name, file.type, checksum, fileSize]
    );
    return jsonOk(row[0], 201);
  } catch (e) {
    return jsonError("Failed: " + (e as Error).message, 500);
  }
}
