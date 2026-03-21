import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { jsonOk, jsonError, requireAdmin } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const all = searchParams.get("all") === "true";

    const rows = all
      ? await query(
          `SELECT c.*, (SELECT COUNT(*) FROM submissions s JOIN challenge_phases cp ON cp.id = s.challenge_phase_id WHERE cp.challenge_id = c.id AND s.is_published = true) as submission_count
           FROM challenges c ORDER BY c.sort_order, c.created_at DESC`
        )
      : await query(
          `SELECT c.id, c.title, c.description, c.cover_image, c.sort_order, c.published_at, c.metadata,
                  (SELECT COUNT(*) FROM submissions s JOIN challenge_phases cp ON cp.id = s.challenge_phase_id WHERE cp.challenge_id = c.id AND s.is_published = true) as submission_count
           FROM challenges c WHERE c.is_published = true ORDER BY c.sort_order, c.published_at DESC NULLS LAST`
        );
    return jsonOk(rows);
  } catch (e) {
    return jsonError("Failed to fetch challenges: " + (e as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const {
      id, title, description, rules_markdown, prompt_markdown,
      cover_image, is_published, sort_order, metadata,
    } = body;

    if (!id || !title) return jsonError("id and title are required");

    const row = await query(
      `INSERT INTO challenges (id, title, description, rules_markdown, prompt_markdown, cover_image, is_published, sort_order, metadata, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        id, title, description || null, rules_markdown || null, prompt_markdown || null,
        cover_image || null, is_published ?? false, sort_order ?? 0,
        JSON.stringify(metadata || {}),
        is_published ? new Date().toISOString() : null,
      ]
    );
    return jsonOk(row[0], 201);
  } catch (e) {
    return jsonError("Failed to create challenge: " + (e as Error).message, 500);
  }
}
