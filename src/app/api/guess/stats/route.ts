import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { jsonError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

interface LeaderRow {
  rank_id: number;
  display_name: string;
  is_author: boolean;
  difficulty: string;
  total: number;
  correct: number;
  win_rate: number | null;
}

interface AuthorRow {
  difficulty: string;
  total: number;
  correct: number;
  win_rate: number | null;
}

interface ModelRow {
  model_variant_name: string;
  model_family_name: string;
  vendor_name: string;
  times_shown: number;
  times_identified: number;
  identify_rate: number | null;
}

const PER_DIFFICULTY_LIMIT = 20;

export async function GET() {
  try {
    // 不暴露原始 player_token（指纹），改用稳定的排名序号作为前端 key。
    const leaderboard = await query<LeaderRow>(
      `select row_number() over (order by difficulty, win_rate desc nulls last, total desc)::int as rank_id,
              display_name, is_author, difficulty,
              total::int as total, correct::int as correct, win_rate::float as win_rate
       from public.guess_leaderboard
       order by difficulty, win_rate desc nulls last, total desc`
    );

    const author = await query<AuthorRow>(
      `select a.difficulty,
              count(*)::int as total,
              count(*) filter (where a.is_correct)::int as correct,
              round(100.0 * count(*) filter (where a.is_correct) / nullif(count(*), 0), 1)::float as win_rate
       from public.guess_attempts a
       join public.guess_players p on p.player_token = a.player_token
       where p.is_author
       group by a.difficulty`
    );

    const models = await query<ModelRow>(
      `select mv.name as model_variant_name,
              mf.name as model_family_name,
              v.name as vendor_name,
              count(*)::int as times_shown,
              count(*) filter (where a.is_correct)::int as times_identified,
              round(100.0 * count(*) filter (where a.is_correct) / nullif(count(*), 0), 1)::float as identify_rate
       from public.guess_attempts a
       join public.model_variants mv on mv.id = a.correct_variant_id
       join public.model_families mf on mf.id = mv.family_id
       join public.vendors v on v.id = mf.vendor_id
       group by mv.name, mf.name, v.name
       having count(*) >= 5
       order by identify_rate asc nulls last`
    );

    const grouped: Record<string, LeaderRow[]> = {
      easy: [],
      medium: [],
      hard: [],
    };
    for (const row of leaderboard) {
      const bucket = grouped[row.difficulty];
      if (bucket && bucket.length < PER_DIFFICULTY_LIMIT) bucket.push(row);
    }

    const authorByDifficulty: Record<string, AuthorRow> = {};
    for (const row of author) authorByDifficulty[row.difficulty] = row;

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: grouped,
        author: authorByDifficulty,
        models,
      },
    });
  } catch (err: unknown) {
    return jsonError(err instanceof Error ? err.message : "Unknown error", 500);
  }
}
