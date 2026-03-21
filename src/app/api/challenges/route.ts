import { query } from "@/lib/db";
import { json, errorResponse, withAdmin } from "@/lib/api-helpers";
import { NextRequest } from "next/server";
import { getAdminFromCookie } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const admin = await getAdminFromCookie();
  const showAll = admin && request.nextUrl.searchParams.get("all") === "true";

  const rows = await query(
    showAll
      ? `SELECT * FROM challenges ORDER BY sort_order, created_at DESC`
      : `SELECT * FROM challenges WHERE is_published = true ORDER BY sort_order, published_at DESC NULLS LAST`
  );
  return json(rows);
}

export async function POST(request: NextRequest) {
  return withAdmin(async () => {
    const body = await request.json();
    const { id, title, description, rules_markdown, prompt_markdown, cover_image, is_published, sort_order, metadata } = body;

    if (!id || !title) return errorResponse("id and title are required");

    const rows = await query(
      `INSERT INTO challenges (id, title, description, rules_markdown, prompt_markdown, cover_image, is_published, sort_order, metadata, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        id, title, description || null, rules_markdown || null, prompt_markdown || null,
        cover_image || null, is_published || false, sort_order || 0,
        JSON.stringify(metadata || {}),
        is_published ? new Date().toISOString() : null,
      ]
    );
    return json(rows[0], 201);
  });
}
