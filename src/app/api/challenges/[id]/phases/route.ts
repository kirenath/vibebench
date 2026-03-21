import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { jsonOk, jsonError, requireAdmin } from "@/lib/api-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const rows = await query(
      "SELECT * FROM challenge_phases WHERE challenge_id = $1 ORDER BY sort_order",
      [id]
    );
    return jsonOk(rows);
  } catch (e) {
    return jsonError("Failed: " + (e as Error).message, 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;
  const { id } = await params;

  try {
    const body = await request.json();
    const { phase_key, phase_label, description, sort_order, is_default, metadata } = body;

    if (!phase_key || !phase_label) return jsonError("phase_key and phase_label are required");

    const row = await query(
      `INSERT INTO challenge_phases (challenge_id, phase_key, phase_label, description, sort_order, is_default, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, phase_key, phase_label, description || null, sort_order ?? 0, is_default ?? false, JSON.stringify(metadata || {})]
    );
    return jsonOk(row[0], 201);
  } catch (e) {
    return jsonError("Failed: " + (e as Error).message, 500);
  }
}
