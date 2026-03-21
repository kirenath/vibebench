import { NextRequest } from "next/server";
import { query, queryOne } from "@/lib/db";
import { jsonOk, jsonError, requireAdmin } from "@/lib/api-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const row = await queryOne("SELECT * FROM challenges WHERE id = $1", [id]);
    if (!row) return jsonError("Challenge not found", 404);
    return jsonOk(row);
  } catch (e) {
    return jsonError("Failed: " + (e as Error).message, 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;
  const { id } = await params;

  try {
    const body = await request.json();
    const {
      title, description, rules_markdown, prompt_markdown,
      cover_image, is_published, sort_order, metadata,
    } = body;

    const row = await query(
      `UPDATE challenges SET
        title = COALESCE($1, title),
        description = $2,
        rules_markdown = $3,
        prompt_markdown = $4,
        cover_image = $5,
        is_published = COALESCE($6, is_published),
        sort_order = COALESCE($7, sort_order),
        metadata = COALESCE($8, metadata),
        published_at = CASE WHEN $6 = true AND published_at IS NULL THEN now() WHEN $6 = false THEN NULL ELSE published_at END
       WHERE id = $9 RETURNING *`,
      [
        title, description ?? null, rules_markdown ?? null, prompt_markdown ?? null,
        cover_image ?? null, is_published, sort_order, metadata ? JSON.stringify(metadata) : null, id,
      ]
    );
    if (!row.length) return jsonError("Challenge not found", 404);
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
    const row = await query("DELETE FROM challenges WHERE id = $1 RETURNING id", [id]);
    if (!row.length) return jsonError("Challenge not found", 404);
    return jsonOk({ deleted: true });
  } catch (e) {
    return jsonError("Failed: " + (e as Error).message, 500);
  }
}
