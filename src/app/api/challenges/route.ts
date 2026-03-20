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

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true" && admin;

    let query: string;
    if (all) {
      query = `SELECT * FROM challenges ORDER BY sort_order, title`;
    } else {
      query = `SELECT * FROM challenges WHERE is_published = true ORDER BY sort_order, title`;
    }

    const { rows } = await db.query(query);
    return success(rows);
  } catch {
    return internalError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return unauthorized();

    const body = await request.json();
    if (!body.id || !body.title) {
      return validationError("id and title are required");
    }

    const { rows } = await db.query(
      `INSERT INTO challenges (id, title, description, rules_markdown, prompt_markdown, cover_image, is_published, sort_order, metadata, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        body.id,
        body.title,
        body.description || null,
        body.rules_markdown || null,
        body.prompt_markdown || null,
        body.cover_image || null,
        body.is_published || false,
        body.sort_order || 0,
        JSON.stringify(body.metadata || {}),
        body.is_published ? new Date().toISOString() : null,
      ]
    );
    return success(rows[0], 201);
  } catch (e: any) {
    if (e.code === "23505") return validationError("Challenge ID already exists");
    return internalError();
  }
}
