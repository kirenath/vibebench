import { query, queryOne } from "@/lib/db";
import { json, errorResponse, withAdmin } from "@/lib/api-helpers";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const challenge = await queryOne(`SELECT * FROM challenges WHERE id = $1`, [id]);
  if (!challenge) return errorResponse("Challenge not found", 404);
  return json(challenge);
}

export async function PUT(request: NextRequest, { params }: Params) {
  return withAdmin(async () => {
    const { id } = await params;
    const body = await request.json();
    const { title, description, rules_markdown, prompt_markdown, cover_image, is_published, sort_order, metadata } = body;

    const existing = await queryOne<{ is_published: boolean; published_at: string | null }>(
      `SELECT is_published, published_at FROM challenges WHERE id = $1`, [id]
    );
    if (!existing) return errorResponse("Challenge not found", 404);

    // Set published_at on first publish
    const publishedAt = is_published && !existing.published_at
      ? new Date().toISOString()
      : (is_published ? existing.published_at : null);

    const rows = await query(
      `UPDATE challenges SET title = COALESCE($1, title), description = $2, rules_markdown = $3,
       prompt_markdown = $4, cover_image = $5, is_published = COALESCE($6, is_published),
       sort_order = COALESCE($7, sort_order), metadata = COALESCE($8, metadata), published_at = $9
       WHERE id = $10 RETURNING *`,
      [title, description, rules_markdown, prompt_markdown, cover_image, is_published, sort_order, metadata ? JSON.stringify(metadata) : null, publishedAt, id]
    );
    return json(rows[0]);
  });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  return withAdmin(async () => {
    const { id } = await params;
    await query(`DELETE FROM challenges WHERE id = $1`, [id]);
    return json({ success: true });
  });
}
