import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { Challenge, ApiResponse } from "@/types";

async function requireAdmin(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

export async function GET() {
  try {
    const isAdmin = await requireAdmin();

    let sql: string;
    if (isAdmin) {
      sql = `
        SELECT * FROM challenges
        ORDER BY sort_order ASC, created_at DESC
      `;
    } else {
      sql = `
        SELECT * FROM challenges
        WHERE is_published = true
        ORDER BY sort_order ASC, created_at DESC
      `;
    }

    const result = await query<Challenge>(sql);
    return NextResponse.json<ApiResponse<Challenge[]>>({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch challenges";
    return NextResponse.json<ApiResponse>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      id,
      title,
      description,
      rules_markdown,
      prompt_markdown,
      cover_image,
      is_published,
      sort_order,
      metadata,
    } = body;

    if (!id || !title) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "id and title are required" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const published = is_published ?? false;
    const published_at = published ? now : null;

    const result = await query<Challenge>(
      `
      INSERT INTO challenges (id, title, description, rules_markdown, prompt_markdown, cover_image, is_published, sort_order, metadata, published_at, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
      `,
      [
        id,
        title,
        description ?? null,
        rules_markdown ?? null,
        prompt_markdown ?? null,
        cover_image ?? null,
        published,
        sort_order ?? 0,
        metadata ?? {},
        published_at,
        now,
        now,
      ]
    );

    return NextResponse.json<ApiResponse<Challenge>>(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create challenge";
    return NextResponse.json<ApiResponse>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
