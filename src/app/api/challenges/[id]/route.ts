import { NextRequest } from "next/server";
import db from "@/lib/db";
import {
  success,
  validationError,
  notFound,
  unauthorized,
  internalError,
} from "@/lib/api-utils";
import { requireAdmin } from "@/lib/api-utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { rows } = await db.query(`SELECT * FROM challenges WHERE id = $1`, [id]);
    if (rows.length === 0) return notFound("Challenge not found");
    return success(rows[0]);
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
      "title", "description", "rules_markdown", "prompt_markdown",
      "cover_image", "is_published", "sort_order", "metadata",
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
      `UPDATE challenges SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (rows.length === 0) return notFound("Challenge not found");
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
    const { rowCount } = await db.query(`DELETE FROM challenges WHERE id = $1`, [id]);
    if (rowCount === 0) return notFound("Challenge not found");
    return success({ deleted: true });
  } catch {
    return internalError();
  }
}
