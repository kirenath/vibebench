import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { ChallengePhase, ApiResponse } from "@/types";

async function requireAdmin(): Promise<boolean> {
  const session = await getSession();
  return !!session;
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

    const existing = await query<ChallengePhase>(
      `SELECT * FROM challenge_phases WHERE id = $1`,
      [id]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Phase not found" },
        { status: 404 }
      );
    }

    const current = existing.rows[0];
    const now = new Date().toISOString();

    const phase_key = body.phase_key !== undefined ? body.phase_key : current.phase_key;
    const phase_label = body.phase_label !== undefined ? body.phase_label : current.phase_label;
    const description = body.description !== undefined ? body.description : current.description;
    const sort_order = body.sort_order !== undefined ? body.sort_order : current.sort_order;
    const is_default = body.is_default !== undefined ? body.is_default : current.is_default;
    const metadata = body.metadata !== undefined ? body.metadata : current.metadata;

    const result = await query<ChallengePhase>(
      `
      UPDATE challenge_phases
      SET phase_key = $1, phase_label = $2, description = $3,
          sort_order = $4, is_default = $5, metadata = $6, updated_at = $7
      WHERE id = $8
      RETURNING *
      `,
      [phase_key, phase_label, description, sort_order, is_default, metadata, now, id]
    );

    return NextResponse.json<ApiResponse<ChallengePhase>>({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update phase";
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

    const existing = await query<ChallengePhase>(
      `SELECT * FROM challenge_phases WHERE id = $1`,
      [id]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Phase not found" },
        { status: 404 }
      );
    }

    await query(`DELETE FROM challenge_phases WHERE id = $1`, [id]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { deleted: id },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete phase";
    return NextResponse.json<ApiResponse>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
