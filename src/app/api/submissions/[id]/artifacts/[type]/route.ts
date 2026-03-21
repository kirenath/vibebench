import { query, queryOne } from "@/lib/db";
import { json, errorResponse, withAdmin } from "@/lib/api-helpers";
import { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import { UPLOAD_DIR } from "@/lib/constants";

type Params = { params: Promise<{ id: string; type: string }> };

export async function DELETE(_request: NextRequest, { params }: Params) {
  return withAdmin(async () => {
    const { id, type } = await params;

    const artifact = await queryOne<{ file_path: string }>(
      `SELECT file_path FROM submission_artifacts WHERE submission_id = $1::uuid AND type = $2`,
      [id, type]
    );
    if (!artifact) return errorResponse("Artifact not found", 404);

    await query(
      `DELETE FROM submission_artifacts WHERE submission_id = $1::uuid AND type = $2`,
      [id, type]
    );

    // Clean up file
    const absPath = path.join(process.cwd(), UPLOAD_DIR, artifact.file_path);
    const dir = path.dirname(absPath);
    try {
      await fs.rm(dir, { recursive: true, force: true });
    } catch { /* ignore */ }

    return json({ success: true });
  });
}
