import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { jsonOk, jsonError } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { challenge_phase_id, left_submission_id, right_submission_id, winner, duration_ms } = body;

    if (!challenge_phase_id || !left_submission_id || !right_submission_id || !winner) {
      return jsonError("Missing required fields", 400);
    }

    const voterToken = request.cookies.get("voter_token")?.value;
    if (!voterToken) {
      return jsonError("Missing voter token. Please refresh the page.", 403);
    }

    // Record the vote in the database
    const insertSql = `
      INSERT INTO public.eval_votes (
        challenge_phase_id, left_submission_id, right_submission_id, winner, voter_token, duration_ms
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    const insertParams = [
      challenge_phase_id,
      left_submission_id,
      right_submission_id,
      winner,
      voterToken,
      duration_ms || null
    ];

    const voteRows = await query(insertSql, insertParams);

    // Fetch the actual model information to reveal to the user
    // We only need info for these two specific submissions
    const detailsSql = `
      SELECT submission_id, model_variant_name, vendor_name, channel_name, manual_touched
      FROM public.submission_overview
      WHERE submission_id = ANY($1::uuid[])
    `;
    const rows = await query(detailsSql, [[left_submission_id, right_submission_id]]);

    const leftData = rows.find((r: any) => String(r.submission_id) === String(left_submission_id));
    const rightData = rows.find((r: any) => String(r.submission_id) === String(right_submission_id));

    if (!leftData || !rightData) {
      return jsonError("Invalid submission ids", 400);
    }

    return jsonOk({
      left: leftData,
      right: rightData,
      vote_id: voteRows[0].id
    });
  } catch (err: any) {
    // If unique constraint violation
    if (err.code === '23505') {
       return jsonError("You have already voted on this pair of submissions. Please skip to the next one.", 409);
    }
    return jsonError(err.message, 500);
  }
}
