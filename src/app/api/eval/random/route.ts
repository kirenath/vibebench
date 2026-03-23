import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { jsonOk, jsonError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const challengeId = searchParams.get("challenge");
  const phaseKey = searchParams.get("phase");

  let voterToken = request.cookies.get("voter_token")?.value;
  const needsNewCookie = !voterToken;
  if (!voterToken) {
    voterToken = crypto.randomUUID();
  }

  try {
    const params: any[] = [voterToken];
    let phaseFilter = "";

    if (challengeId) {
      params.push(challengeId);
      phaseFilter += ` AND challenge_id = $${params.length}`;
    }
    if (phaseKey) {
      params.push(phaseKey);
      phaseFilter += ` AND phase_key = $${params.length}`;
    }

    const sql = `
      WITH EligiblePhases AS (
        SELECT challenge_phase_id
        FROM public.submission_overview
        WHERE has_html = true AND submission_is_published = true AND challenge_is_published = true
        ${phaseFilter}
        GROUP BY challenge_phase_id
        HAVING COUNT(DISTINCT model_variant_id) >= 2
      ),
      UnvotedPhases AS (
        SELECT challenge_phase_id
        FROM EligiblePhases ep
        WHERE NOT EXISTS (
          SELECT 1 FROM public.eval_votes v
          WHERE v.voter_token = $1
            AND v.challenge_phase_id = ep.challenge_phase_id
        )
      ),
      SelectedPhase AS (
        SELECT challenge_phase_id
        FROM UnvotedPhases
        ORDER BY random()
        LIMIT 1
      ),
      PhaseSubmissions AS (
        SELECT *
        FROM public.submission_overview
        WHERE challenge_phase_id = (SELECT challenge_phase_id FROM SelectedPhase)
          AND has_html = true AND submission_is_published = true AND challenge_is_published = true
      ),
      LeftSub AS (
        SELECT * FROM PhaseSubmissions ORDER BY random() LIMIT 1
      ),
      RightSub AS (
        SELECT * FROM PhaseSubmissions 
        WHERE model_variant_id != (SELECT model_variant_id FROM LeftSub)
        ORDER BY (vendor_id != (SELECT vendor_id FROM LeftSub)) DESC, random()
        LIMIT 1
      )
      SELECT * FROM LeftSub
      UNION ALL
      SELECT * FROM RightSub;
    `;

    const rows = await query(sql, params);

    if (rows.length < 2) {
      return jsonError("No valid submissions found for evaluation.", 404);
    }

    // Randomize left and right for the client to prevent bias
    const isLeftFirst = Math.random() > 0.5;
    const leftSub = isLeftFirst ? rows[0] : rows[1];
    const rightSub = isLeftFirst ? rows[1] : rows[0];

    // Build the response without revealing model identities
    const responseData = {
      challenge_phase_id: leftSub.challenge_phase_id,
      challenge_title: leftSub.challenge_title,
      phase_label: leftSub.phase_label,
      left: {
        submission_id: leftSub.submission_id,
      },
      right: {
        submission_id: rightSub.submission_id,
      }
    };

    const response = NextResponse.json({
      success: true,
      data: responseData,
      error: null
    });

    if (needsNewCookie) {
      // Set the voter_token as an HttpOnly cookie
      response.cookies.set({
        name: "voter_token",
        value: voterToken,
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: "strict",
      });
    }

    return response;
  } catch (err: any) {
    return jsonError(err.message, 500);
  }
}
