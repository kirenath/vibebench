import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getUploadDir } from "@/lib/upload";
import { promises as fs } from "fs";
import path from "path";

async function requireAdmin(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await query(
    `SELECT * FROM submission_overview WHERE submission_id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return NextResponse.json(
      { success: false, error: "Submission not found" },
      { status: 404 }
    );
  }

  const submission = result.rows[0];

  const isAdmin = await requireAdmin();
  if (!submission.submission_is_published && !isAdmin) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: submission });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  // Verify submission exists
  const existing = await query(
    `SELECT is_published FROM submissions WHERE id = $1`,
    [id]
  );
  if (existing.rows.length === 0) {
    return NextResponse.json(
      { success: false, error: "Submission not found" },
      { status: 404 }
    );
  }

  const allowedFields = [
    "is_published",
    "manual_touched",
    "manual_notes",
    "iteration_count",
    "duration_ms",
    "timing_method",
    "notes",
    "metadata",
  ];

  const setClauses: string[] = ["updated_at = now()"];
  const values: unknown[] = [];
  let paramIndex = 1;

  for (const field of allowedFields) {
    if (field in body) {
      setClauses.push(`${field} = $${paramIndex++}`);
      values.push(body[field]);
    }
  }

  // When is_published changes to true, set published_at = now()
  if (body.is_published === true && !existing.rows[0].is_published) {
    setClauses.push(`published_at = now()`);
  }

  if (setClauses.length === 1) {
    return NextResponse.json(
      { success: false, error: "No valid fields to update" },
      { status: 400 }
    );
  }

  values.push(id);
  const updateResult = await query(
    `UPDATE submissions SET ${setClauses.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return NextResponse.json({ success: true, data: updateResult.rows[0] });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Get all artifact file paths for this submission
  const artifacts = await query(
    `SELECT sa.file_path, sa.type FROM submission_artifacts sa WHERE sa.submission_id = $1`,
    [id]
  );

  // Delete artifact files from disk
  const uploadDir = getUploadDir();
  for (const artifact of artifacts.rows) {
    const row = artifact as Record<string, string>;
    const fullPath = path.join(uploadDir, row.file_path);
    try {
      await fs.unlink(fullPath);
    } catch {
      // File may already be deleted, ignore errors
    }
  }

  // Delete artifacts from DB (cascade should handle this, but be explicit)
  await query(`DELETE FROM submission_artifacts WHERE submission_id = $1`, [id]);

  // Delete the submission
  const deleteResult = await query(
    `DELETE FROM submissions WHERE id = $1 RETURNING id`,
    [id]
  );

  if (deleteResult.rows.length === 0) {
    return NextResponse.json(
      { success: false, error: "Submission not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: { deleted: id } });
}
