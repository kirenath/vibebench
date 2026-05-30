import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { jsonError } from "@/lib/api-helpers";
import { verifyQuestion } from "@/lib/guessToken";

export const dynamic = "force-dynamic";

interface RevealRow {
  submission_id: string;
  challenge_phase_id: string;
  model_variant_id: string;
  model_variant_name: string;
  model_family_id: string;
  model_family_name: string;
  vendor_name: string;
  channel_name: string;
  manual_touched: boolean;
}

function pgCode(err: unknown): string | undefined {
  if (err && typeof err === "object" && "code" in err) {
    return (err as { code?: string }).code;
  }
  return undefined;
}

export async function POST(request: NextRequest) {
  const playerToken = request.headers.get("x-player-token") || "";
  if (!playerToken) {
    return jsonError("Missing player token. Please refresh the page.", 403);
  }

  let body: {
    token?: string;
    session_id?: string;
    guessed_value?: string;
    duration_ms?: number;
  };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const { token, session_id, guessed_value, duration_ms } = body;
  if (!token || !session_id || !guessed_value) {
    return jsonError("Missing required fields", 400);
  }

  const payload = verifyQuestion(token);
  if (!payload) {
    return jsonError("Invalid or expired question token", 400);
  }

  // Guess must be one of the four options presented for this question.
  if (!payload.options.some((o) => o.value === guessed_value)) {
    return jsonError("Invalid option", 400);
  }

  try {
    const reveal = await queryOne<RevealRow>(
      `select submission_id, challenge_phase_id, model_variant_id,
              model_variant_name, model_family_id, model_family_name,
              vendor_name, channel_name, manual_touched
       from public.submission_overview
       where submission_id = $1`,
      [payload.submission_id]
    );
    if (!reveal) {
      return jsonError("Submission no longer available", 410);
    }

    // Recompute the correct answer server-side from the real submission —
    // never trust a value supplied by (or readable to) the client.
    const correctValue =
      payload.difficulty === "easy"
        ? reveal.model_family_id
        : reveal.model_variant_id;
    const isCorrect = guessed_value === correctValue;

    // Ensure the player row exists (FK + lazy profile creation).
    await query(
      `insert into public.guess_players (player_token)
       values ($1)
       on conflict (player_token) do nothing`,
      [playerToken]
    );

    try {
      await query(
        `insert into public.guess_attempts (
           player_token, session_id, difficulty, submission_id,
           challenge_phase_id, correct_variant_id, guessed_value, is_correct,
           options, duration_ms, question_token_id
         ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11)`,
        [
          playerToken,
          session_id,
          payload.difficulty,
          payload.submission_id,
          reveal.challenge_phase_id,
          reveal.model_variant_id,
          guessed_value,
          isCorrect,
          JSON.stringify(payload.options),
          typeof duration_ms === "number" ? duration_ms : null,
          payload.jti,
        ]
      );
    } catch (err) {
      // Same question token submitted twice — reject to prevent double scoring.
      if (pgCode(err) === "23505") {
        return jsonError("该题已作答", 409);
      }
      throw err;
    }

    return NextResponse.json({
      success: true,
      data: {
        is_correct: isCorrect,
        correct_value: correctValue,
        reveal: {
          model_variant_name: reveal.model_variant_name,
          model_family_name: reveal.model_family_name,
          vendor_name: reveal.vendor_name,
          channel_name: reveal.channel_name,
          manual_touched: reveal.manual_touched,
        },
      },
    });
  } catch (err: unknown) {
    return jsonError(err instanceof Error ? err.message : "Unknown error", 500);
  }
}
