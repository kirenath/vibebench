import { NextRequest } from "next/server";
import db from "@/lib/db";
import { success, validationError, notFound, unauthorized, internalError } from "@/lib/api-utils";
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
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    for (const key of ["family_id", "name", "description", "sort_order", "metadata"]) {
      if (key in body) {
        fields.push(`${key} = $${idx}`);
        values.push(key === "metadata" ? JSON.stringify(body[key]) : body[key]);
        idx++;
      }
    }
    if (fields.length === 0) return validationError("No fields to update");
    values.push(id);
    const { rows } = await db.query(
      `UPDATE model_variants SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (rows.length === 0) return notFound("Model variant not found");
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
    const { rowCount } = await db.query(`DELETE FROM model_variants WHERE id = $1`, [id]);
    if (rowCount === 0) return notFound("Model variant not found");
    return success({ deleted: true });
  } catch (e: any) {
    if (e.code === "23503") return validationError("Cannot delete variant with existing submissions");
    return internalError();
  }
}
