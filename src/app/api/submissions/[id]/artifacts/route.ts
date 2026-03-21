import { query, queryOne } from "@/lib/db";
import { json, errorResponse, withAdmin } from "@/lib/api-helpers";
import { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { UPLOAD_DIR, UPLOAD_MAX_FILE_SIZE, ARTIFACT_TYPES, ArtifactType } from "@/lib/constants";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  return withAdmin(async () => {
    const { id } = await params;

    // Verify submission exists and get context for file path
    const submission = await queryOne<{
      challenge_id: string; phase_key: string;
      model_variant_id: string; channel_id: string;
    }>(
      `SELECT c.id as challenge_id, cp.phase_key, s.model_variant_id, s.channel_id
       FROM submissions s
       JOIN challenge_phases cp ON cp.id = s.challenge_phase_id
       JOIN challenges c ON c.id = cp.challenge_id
       WHERE s.id = $1::uuid`,
      [id]
    );
    if (!submission) return errorResponse("Submission not found", 404);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    if (!file || !type) return errorResponse("file and type are required");
    if (!ARTIFACT_TYPES.includes(type as ArtifactType)) {
      return errorResponse(`Invalid artifact type. Must be one of: ${ARTIFACT_TYPES.join(", ")}`);
    }
    if (file.size > UPLOAD_MAX_FILE_SIZE) {
      return errorResponse(`File too large. Max size: ${UPLOAD_MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Build file path: {challenge}/{model_variant}/{channel}/{phase}/{type}/
    const relativeDirPath = path.join(
      submission.challenge_id,
      submission.model_variant_id,
      submission.channel_id,
      submission.phase_key,
      type
    );
    const absDir = path.join(process.cwd(), UPLOAD_DIR, relativeDirPath);
    await fs.mkdir(absDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const checksum = crypto.createHash("sha256").update(buffer).digest("hex");
    const fileName = file.name;
    const filePath = path.join(relativeDirPath, fileName);
    const absPath = path.join(absDir, fileName);

    await fs.writeFile(absPath, buffer);

    // Upsert artifact record
    const rows = await query(
      `INSERT INTO submission_artifacts (submission_id, type, file_path, file_name, mime_type, checksum, file_size)
       VALUES ($1::uuid, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (submission_id, type) DO UPDATE SET
         file_path = EXCLUDED.file_path, file_name = EXCLUDED.file_name,
         mime_type = EXCLUDED.mime_type, checksum = EXCLUDED.checksum,
         file_size = EXCLUDED.file_size
       RETURNING *`,
      [id, type, filePath, fileName, file.type || null, checksum, file.size]
    );

    return json(rows[0], 201);
  });
}
