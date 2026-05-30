import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { jsonError } from "@/lib/api-helpers";
import { APP_URL } from "@/lib/constants";
import { signResult, winRateOf } from "@/lib/guessShare";
import { normalizeShareStyle } from "@/lib/shareStyles";
import type { GuessDifficulty } from "@/lib/guessToken";

export const dynamic = "force-dynamic";

interface SessionRow {
  difficulty: GuessDifficulty;
  total: number;
  correct: number;
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-player-token") || "";
  if (!token) return jsonError("Missing player token", 403);

  let body: { session_id?: string; style?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const sessionId = body.session_id;
  if (!sessionId) return jsonError("Missing session_id", 400);
  const style = normalizeShareStyle(body.style);

  try {
    const session = await queryOne<SessionRow>(
      `select difficulty,
              count(*)::int as total,
              count(*) filter (where is_correct)::int as correct
       from public.guess_attempts
       where player_token = $1 and session_id = $2
       group by difficulty
       order by count(*) desc
       limit 1`,
      [token, sessionId]
    );
    if (!session || session.total === 0) {
      return jsonError("No attempts found for this session", 404);
    }

    const player = await queryOne<{ display_name: string | null }>(
      "select display_name from public.guess_players where player_token = $1",
      [token]
    );

    const authorRow = await queryOne<{ win_rate: number | null }>(
      `select round(100.0 * count(*) filter (where a.is_correct) / nullif(count(*), 0), 1)::float as win_rate
       from public.guess_attempts a
       join public.guess_players p on p.player_token = a.player_token
       where p.is_author and a.difficulty = $1`,
      [session.difficulty]
    );

    const shareToken = signResult({
      n: player?.display_name ?? "匿名玩家",
      d: session.difficulty,
      c: session.correct,
      t: session.total,
      a: authorRow?.win_rate ?? undefined,
      s: style,
    });

    return NextResponse.json({
      success: true,
      data: {
        token: shareToken,
        win_rate: winRateOf(session.correct, session.total),
        share_url: `${APP_URL}/guess/share?r=${encodeURIComponent(shareToken)}`,
      },
    });
  } catch (err: unknown) {
    return jsonError(err instanceof Error ? err.message : "Unknown error", 500);
  }
}
