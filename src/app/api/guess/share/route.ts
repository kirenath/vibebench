import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { jsonError } from "@/lib/api-helpers";
import { APP_URL } from "@/lib/constants";
import {
  signResult,
  winRateOf,
  type ShareTemplate,
  type ShareHighlight,
} from "@/lib/guessShare";
import type { GuessDifficulty, GuessOption } from "@/lib/guessToken";

export const dynamic = "force-dynamic";

const TEMPLATES: ShareTemplate[] = [
  "scoreboard",
  "rank",
  "vs_author",
  "highlight",
];

interface SessionRow {
  difficulty: GuessDifficulty;
  total: number;
  correct: number;
}

interface HighlightRow {
  difficulty: GuessDifficulty;
  options: GuessOption[];
  guessed_value: string;
  variant_name: string;
  family_name: string;
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-player-token") || "";
  if (!token) return jsonError("Missing player token", 403);

  let body: { session_id?: string; tpl?: ShareTemplate };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const sessionId = body.session_id;
  const tpl: ShareTemplate =
    body.tpl && TEMPLATES.includes(body.tpl) ? body.tpl : "scoreboard";
  if (!sessionId) return jsonError("Missing session_id", 400);

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

    let highlight: ShareHighlight | undefined;
    const hl = await queryOne<HighlightRow>(
      `select a.difficulty, a.options, a.guessed_value,
              mv.name as variant_name, mf.name as family_name
       from public.guess_attempts a
       join public.model_variants mv on mv.id = a.correct_variant_id
       join public.model_families mf on mf.id = mv.family_id
       where a.player_token = $1 and a.session_id = $2 and not a.is_correct
       order by random()
       limit 1`,
      [token, sessionId]
    );
    if (hl) {
      const guessedLabel =
        hl.options.find((o) => o.value === hl.guessed_value)?.label ??
        hl.guessed_value;
      highlight = {
        shown: hl.difficulty === "easy" ? hl.family_name : hl.variant_name,
        guessed: guessedLabel,
      };
    }

    const shareToken = signResult({
      n: player?.display_name ?? "匿名玩家",
      d: session.difficulty,
      c: session.correct,
      t: session.total,
      a: authorRow?.win_rate ?? undefined,
      tpl,
      h: highlight,
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
