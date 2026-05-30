import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { jsonError } from "@/lib/api-helpers";
import { randomNickname } from "@/lib/guessNames";

export const dynamic = "force-dynamic";

interface PlayerRow {
  display_name: string | null;
  is_author: boolean;
}

interface StatRow {
  difficulty: string;
  total: number;
  correct: number;
  win_rate: number | null;
}

function pgCode(err: unknown): string | undefined {
  if (err && typeof err === "object" && "code" in err) {
    return (err as { code?: string }).code;
  }
  return undefined;
}

async function ensurePlayer(token: string): Promise<PlayerRow> {
  const existing = await queryOne<PlayerRow>(
    "select display_name, is_author from public.guess_players where player_token = $1",
    [token]
  );
  if (existing) return existing;

  for (let i = 0; i < 6; i++) {
    try {
      const row = await queryOne<PlayerRow>(
        `insert into public.guess_players (player_token, display_name)
         values ($1, $2)
         on conflict (player_token) do nothing
         returning display_name, is_author`,
        [token, randomNickname()]
      );
      if (row) return row;
      // player_token already existed (race) — fetch it.
      const again = await queryOne<PlayerRow>(
        "select display_name, is_author from public.guess_players where player_token = $1",
        [token]
      );
      if (again) return again;
    } catch (err) {
      if (pgCode(err) === "23505") continue; // nickname collision, retry
      throw err;
    }
  }

  // Fallback: create without a name rather than fail outright.
  const row = await queryOne<PlayerRow>(
    `insert into public.guess_players (player_token)
     values ($1)
     on conflict (player_token) do nothing
     returning display_name, is_author`,
    [token]
  );
  return (
    row ??
    (await queryOne<PlayerRow>(
      "select display_name, is_author from public.guess_players where player_token = $1",
      [token]
    )) ?? { display_name: null, is_author: false }
  );
}

async function playerStats(token: string): Promise<StatRow[]> {
  return query<StatRow>(
    `select difficulty,
            count(*)::int as total,
            count(*) filter (where is_correct)::int as correct,
            round(100.0 * count(*) filter (where is_correct) / nullif(count(*), 0), 1)::float as win_rate
     from public.guess_attempts
     where player_token = $1
     group by difficulty`,
    [token]
  );
}

export async function GET(request: NextRequest) {
  const token = request.headers.get("x-player-token") || "";
  if (!token) return jsonError("Missing player token", 403);

  try {
    const player = await ensurePlayer(token);
    const stats = await playerStats(token);
    return NextResponse.json({
      success: true,
      data: {
        display_name: player.display_name,
        is_author: player.is_author,
        stats,
      },
    });
  } catch (err: unknown) {
    return jsonError(err instanceof Error ? err.message : "Unknown error", 500);
  }
}

export async function PUT(request: NextRequest) {
  const token = request.headers.get("x-player-token") || "";
  if (!token) return jsonError("Missing player token", 403);

  let body: { display_name?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const name = (body.display_name || "").trim();
  if (name.length < 1 || name.length > 40) {
    return jsonError("昵称长度需在 1–40 之间", 400);
  }

  try {
    await ensurePlayer(token);
    await query(
      "update public.guess_players set display_name = $2 where player_token = $1",
      [token, name]
    );
    return NextResponse.json({
      success: true,
      data: { display_name: name },
    });
  } catch (err: unknown) {
    if (pgCode(err) === "23505") {
      return jsonError("名称已被占用", 409);
    }
    return jsonError(err instanceof Error ? err.message : "Unknown error", 500);
  }
}
