import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { Challenge, ChallengePhase, ApiResponse } from "@/types";

async function requireAdmin(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

interface ChallengeDetail extends Challenge {
  phases: ChallengePhase[];
  submission_count: number;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isAdmin = await requireAdmin();

    const challengeResult = await query<Challenge>(
      `SELECT * FROM challenges WHERE id = $1`,
      [id]
    );

    if (challengeResult.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Challenge not found" },
        { status: 404 }
      );
    }

    const challenge = challengeResult.rows[0];

    if (!challenge.is_published && !isAdmin) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Challenge not found" },
        { status: 404 }
      );
    }

    const phasesResult = await query<ChallengePhase>(
      `SELECT * FROM challenge_phases WHERE challenge_id = $1 ORDER BY sort_order ASC`,
      [id]
    );

    const submissionCountResult = await query<{ count: string }>(
      `
      SELECT COUNT(*) as count
      FROM submissions s
      JOIN challenge_phases cp ON s.challenge_phase_id = cp.id
      WHERE cp.challenge_id = $1
      `,
      [id]
    );

    const detail: ChallengeDetail = {
      ...challenge,
      phases: phasesResult.rows,
      submission_count: parseInt(submissionCountResult.rows[0].count, 10),
    };

    return NextResponse.json<ApiResponse<ChallengeDetail>>({
      success: true,
      data: detail,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch challenge";
    return NextResponse.json<ApiResponse>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await query<Challenge>(
      `SELECT * FROM challenges WHERE id = $1`,
      [id]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Challenge not found" },
        { status: 404 }
      );
    }

    const current = existing.rows[0];
    const now = new Date().toISOString();

    const title = body.title !== undefined ? body.title : current.title;
    const description = body.description !== undefined ? body.description : current.description;
    const rules_markdown = body.rules_markdown !== undefined ? body.rules_markdown : current.rules_markdown;
    const prompt_markdown = body.prompt_markdown !== undefined ? body.prompt_markdown : current.prompt_markdown;
    const cover_image = body.cover_image !== undefined ? body.cover_image : current.cover_image;
    const sort_order = body.sort_order !== undefined ? body.sort_order : current.sort_order;
    const metadata = body.metadata !== undefined ? body.metadata : current.metadata;

    let is_published = current.is_published;
    let published_at = current.published_at;

    if (body.is_published !== undefined) {
      is_published = body.is_published;
      if (is_published && !current.is_published) {
        published_at = now;
      } else if (!is_published) {
        published_at = null;
      }
    }

    const result = await query<Challenge>(
      `
      UPDATE challenges
      SET title = $1, description = $2, rules_markdown = $3, prompt_markdown = $4,
          cover_image = $5, is_published = $6, sort_order = $7, metadata = $8,
          published_at = $9, updated_at = $10
      WHERE id = $11
      RETURNING *
      `,
      [
        title,
        description,
        rules_markdown,
        prompt_markdown,
        cover_image,
        is_published,
        sort_order,
        metadata,
        published_at,
        now,
        id,
      ]
    );

    return NextResponse.json<ApiResponse<Challenge>>({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update challenge";
    return NextResponse.json<ApiResponse>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existing = await query<Challenge>(
      `SELECT * FROM challenges WHERE id = $1`,
      [id]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Challenge not found" },
        { status: 404 }
      );
    }

    await query(`DELETE FROM challenges WHERE id = $1`, [id]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { deleted: id },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete challenge";
    return NextResponse.json<ApiResponse>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
