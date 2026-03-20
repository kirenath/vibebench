import { NextRequest } from "next/server";
import db from "@/lib/db";
import { success, validationError, notFound, unauthorized, internalError } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/api-utils";
import { removeArtifactDir } from "@/lib/upload";
import { UPLOAD_DIR } from "@/lib/constants";
import { dirname } from "path";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { rows } = await db.query(`SELECT * FROM submission_overview WHERE submission_id = $1`, [id]);
    if (rows.length === 0) return notFound("Submission not found");

    const artifacts = await db.query(
      `SELECT * FROM submission_artifacts WHERE submission_id = $1 ORDER BY type`,
      [id]
    );
    return success({ ...rows[0], artifacts: artifacts.rows });
  } catch {
    return internalError();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return unauthorized();
    const { id } = await params;
    const body = await request.json();

    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    const updatable = [
      "is_published", "manual_touched", "manual_notes", "iteration_count",
      "run_started_at", "run_finished_at", "duration_ms", "timing_method",
      "prompt_snapshot", "notes", "metadata",
    ];

    for (const key of updatable) {
      if (key in body) {
        fields.push(`${key} = $${idx}`);
        values.push(key === "metadata" ? JSON.stringify(body[key]) : body[key]);
        idx++;
      }
    }

    if (body.is_published === true) {
      fields.push(`published_at = COALESCE(published_at, now())`);
    }
    if (body.is_published === false) {
      fields.push(`published_at = NULL`);
    }

    if (fields.length === 0) return validationError("No fields to update");
    values.push(id);
    const { rows } = await db.query(
      `UPDATE submissions SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (rows.length === 0) return notFound("Submission not found");
    return success(rows[0]);
  } catch {
    return internalError();
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return unauthorized();
    const { id } = await params;

    const artifacts = await db.query(
      `SELECT file_path FROM submission_artifacts WHERE submission_id = $1`,
      [id]
    );
    for (const a of artifacts.rows) {
      await removeArtifactDir(dirname(a.file_path));
    }

    const { rowCount } = await db.query(`DELETE FROM submissions WHERE id = $1`, [id]);
    if (rowCount === 0) return notFound("Submission not found");
    return success({ deleted: true });
  } catch {
    return internalError();
  }
}
