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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { rows } = await db.query(
      `SELECT * FROM challenge_phases WHERE challenge_id = $1 ORDER BY sort_order, phase_label`,
      [id]
    );
    return success(rows);
  } catch {
    return internalError();
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return unauthorized();

    const { id: challengeId } = await params;
    const body = await request.json();

    if (!body.phase_key || !body.phase_label) {
      return validationError("phase_key and phase_label are required");
    }

    const challengeCheck = await db.query(
      `SELECT id FROM challenges WHERE id = $1`,
      [challengeId]
    );
    if (challengeCheck.rows.length === 0) return notFound("Challenge not found");

    if (body.is_default) {
      await db.query(
        `UPDATE challenge_phases SET is_default = false WHERE challenge_id = $1`,
        [challengeId]
      );
    }

    const { rows } = await db.query(
      `INSERT INTO challenge_phases (challenge_id, phase_key, phase_label, description, sort_order, is_default, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        challengeId,
        body.phase_key,
        body.phase_label,
        body.description || null,
        body.sort_order || 0,
        body.is_default || false,
        JSON.stringify(body.metadata || {}),
      ]
    );
    return success(rows[0], 201);
  } catch (e: any) {
    if (e.code === "23505") return validationError("Phase key already exists for this challenge");
    return internalError();
  }
}
