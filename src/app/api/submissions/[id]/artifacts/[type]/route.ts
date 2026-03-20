import { NextRequest } from "next/server";
import db from "@/lib/db";
import { success, notFound, unauthorized, internalError } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/api-utils";
import { removeArtifactDir } from "@/lib/upload";
import { dirname } from "path";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; type: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return unauthorized();
    const { id: submissionId, type } = await params;

    const artifact = await db.query(
      `SELECT file_path FROM submission_artifacts WHERE submission_id = $1 AND type = $2`,
      [submissionId, type]
    );
    if (artifact.rows.length > 0) {
      await removeArtifactDir(dirname(artifact.rows[0].file_path));
    }

    const { rowCount } = await db.query(
      `DELETE FROM submission_artifacts WHERE submission_id = $1 AND type = $2`,
      [submissionId, type]
    );
    if (rowCount === 0) return notFound("Artifact not found");
    return success({ deleted: true });
  } catch {
    return internalError();
  }
}
