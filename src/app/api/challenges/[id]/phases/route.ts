import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { ChallengePhase, ApiResponse } from "@/types";

async function requireAdmin(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const challengeCheck = await query(
      `SELECT id FROM challenges WHERE id = $1`,
      [id]
    );

    if (challengeCheck.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Challenge not found" },
        { status: 404 }
      );
    }

    const result = await query<ChallengePhase>(
      `SELECT * FROM challenge_phases WHERE challenge_id = $1 ORDER BY sort_order ASC`,
      [id]
    );

    return NextResponse.json<ApiResponse<ChallengePhase[]>>({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch phases";
    return NextResponse.json<ApiResponse>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const { id: challengeId } = await params;
    const body = await request.json();
    const { phase_key, phase_label, description, sort_order, is_default, metadata } = body;

    if (!phase_key || !phase_label) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "phase_key and phase_label are required" },
        { status: 400 }
      );
    }

    const challengeCheck = await query(
      `SELECT id FROM challenges WHERE id = $1`,
      [challengeId]
    );

    if (challengeCheck.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Challenge not found" },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();

    const result = await query<ChallengePhase>(
      `
      INSERT INTO challenge_phases (challenge_id, phase_key, phase_label, description, sort_order, is_default, metadata, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
      `,
      [
        challengeId,
        phase_key,
        phase_label,
        description ?? null,
        sort_order ?? 0,
        is_default ?? false,
        metadata ?? {},
        now,
        now,
      ]
    );

    return NextResponse.json<ApiResponse<ChallengePhase>>(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create phase";
    return NextResponse.json<ApiResponse>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
