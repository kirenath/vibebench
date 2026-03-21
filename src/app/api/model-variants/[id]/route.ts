import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { jsonOk, jsonError, requireAdmin } from "@/lib/api-helpers";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;
  const { id } = await params;
  try {
    const { family_id, name, description, sort_order, metadata } = await request.json();
    const row = await query(
      `UPDATE model_variants SET family_id=COALESCE($1,family_id), name=COALESCE($2,name), description=$3, sort_order=COALESCE($4,sort_order), metadata=COALESCE($5,metadata) WHERE id=$6 RETURNING *`,
      [family_id, name, description ?? null, sort_order, metadata ? JSON.stringify(metadata) : null, id]
    );
    if (!row.length) return jsonError("Not found", 404);
    return jsonOk(row[0]);
  } catch (e) {
    return jsonError("Failed: " + (e as Error).message, 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;
  const { id } = await params;
  try {
    const row = await query("DELETE FROM model_variants WHERE id=$1 RETURNING id", [id]);
    if (!row.length) return jsonError("Not found", 404);
    return jsonOk({ deleted: true });
  } catch (e) {
    return jsonError("Failed: " + (e as Error).message, 500);
  }
}
