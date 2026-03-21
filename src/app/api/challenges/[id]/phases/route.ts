import { query } from "@/lib/db";
import { json, errorResponse, withAdmin } from "@/lib/api-helpers";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const rows = await query(
    `SELECT * FROM challenge_phases WHERE challenge_id = $1 ORDER BY sort_order, phase_label`,
    [id]
  );
  return json(rows);
}

export async function POST(request: NextRequest, { params }: Params) {
  return withAdmin(async () => {
    const { id } = await params;
    const body = await request.json();
    const { phase_key, phase_label, description, sort_order, is_default, metadata } = body;

    if (!phase_key || !phase_label) return errorResponse("phase_key and phase_label are required");

    const rows = await query(
      `INSERT INTO challenge_phases (challenge_id, phase_key, phase_label, description, sort_order, is_default, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, phase_key, phase_label, description || null, sort_order || 0, is_default || false, JSON.stringify(metadata || {})]
    );
    return json(rows[0], 201);
  });
}
