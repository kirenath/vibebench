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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return unauthorized();

    const { id } = await params;
    const body = await request.json();

    if (body.is_default) {
      const phaseRow = await db.query(
        `SELECT challenge_id FROM challenge_phases WHERE id = $1`,
        [id]
      );
      if (phaseRow.rows.length === 0) return notFound("Phase not found");
      await db.query(
        `UPDATE challenge_phases SET is_default = false WHERE challenge_id = $1`,
        [phaseRow.rows[0].challenge_id]
      );
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    const updatable = ["phase_key", "phase_label", "description", "sort_order", "is_default", "metadata"];

    for (const key of updatable) {
      if (key in body) {
        fields.push(`${key} = $${idx}`);
        values.push(key === "metadata" ? JSON.stringify(body[key]) : body[key]);
        idx++;
      }
    }

    if (fields.length === 0) return validationError("No fields to update");

    values.push(id);
    const { rows } = await db.query(
      `UPDATE challenge_phases SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (rows.length === 0) return notFound("Phase not found");
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
    const { rowCount } = await db.query(`DELETE FROM challenge_phases WHERE id = $1`, [id]);
    if (rowCount === 0) return notFound("Phase not found");
    return success({ deleted: true });
  } catch {
    return internalError();
  }
}
