"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Brain, RefreshCw, Crown, Ghost } from "lucide-react";
import { DIFFICULTY_LABELS } from "@/lib/guessRank";
import type { GuessDifficulty } from "@/lib/guessToken";

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

interface StatsData {
  leaderboard: Record<string, LeaderRow[]>;
  author: Record<string, AuthorRow>;
  models: ModelRow[];
}

const DIFFS: GuessDifficulty[] = ["easy", "medium", "hard"];

export default function LeaderboardPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<GuessDifficulty>("medium");

  useEffect(() => {
    fetch("/api/guess/stats")
      .then((r) => r.json())
      .then((j) => {
        if (!j.success) throw new Error(j.error || "加载失败");
        setData(j.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const rows = data?.leaderboard?.[tab] ?? [];
  const author = data?.author?.[tab];

  return (
    <div className="relative section pt-24 pb-24">
      <div
        className="absolute inset-0 -top-24 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 30%, var(--hero-primary-soft) 0%, transparent 70%)",
        }}
      />
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-7 w-7 text-primary" />
            猜模型排行榜
          </h1>
          <Link href="/guess" className="btn-secondary btn-sm inline-flex items-center gap-1">
            <Brain className="h-4 w-4" /> 去挑战
          </Link>
        </div>

        {loading ? (
          <div className="h-60 flex items-center justify-center text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" /> 加载中…
          </div>
        ) : error ? (
          <div className="text-destructive text-center py-12">{error}</div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* Difficulty tabs */}
            <div className="flex gap-2">
              {DIFFS.map((d) => (
                <button
                  key={d}
                  onClick={() => setTab(d)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    tab === d
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/40 hover:bg-muted/60"
                  }`}
                >
                  {DIFFICULTY_LABELS[d]}
                </button>
              ))}
            </div>

            {/* Author baseline */}
            {author && (
              <div className="card border border-primary/30 bg-primary/5 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  <span className="font-semibold">作者基准</span>
                </div>
                <div className="text-sm">
                  <span className="font-bold text-primary text-lg">
                    {author.win_rate ?? 0}%
                  </span>
                  <span className="text-muted-foreground ml-2">
                    {author.correct}/{author.total}
                  </span>
                </div>
              </div>
            )}

            {/* Player leaderboard */}
            <div className="card border border-border/50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border/50 bg-muted/20 font-semibold text-sm">
                玩家榜（答题数 ≥ 5）
              </div>
              {rows.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  暂无上榜玩家
                </div>
              ) : (
                <ul>
                  {rows.map((row, i) => (
                    <li
                      key={row.rank_id}
                      className="flex items-center gap-3 px-4 py-3 border-b border-border/30 last:border-0"
                    >
                      <span className="w-6 text-center font-bold text-muted-foreground">
                        {i + 1}
                      </span>
                      <span className="flex-1 truncate flex items-center gap-1.5">
                        {row.display_name}
                        {row.is_author && (
                          <Crown className="h-3.5 w-3.5 text-primary" />
                        )}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {row.correct}/{row.total}
                      </span>
                      <span className="font-bold text-primary w-16 text-right">
                        {row.win_rate ?? 0}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Model identifiability */}
            <div className="card border border-border/50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border/50 bg-muted/20 font-semibold text-sm flex items-center gap-2">
                <Ghost className="h-4 w-4 text-secondary" />
                模型"拟人度"排行（识别率越低越难被认出）
              </div>
              {!data?.models?.length ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  数据不足（每个模型需被展示 ≥ 5 次）
                </div>
              ) : (
                <ul>
                  {data.models.map((m, i) => (
                    <li
                      key={`${m.model_variant_name}-${i}`}
                      className="flex items-center gap-3 px-4 py-3 border-b border-border/30 last:border-0"
                    >
                      <span className="w-6 text-center font-bold text-muted-foreground">
                        {i + 1}
                      </span>
                      <span className="flex-1 truncate">
                        {m.model_variant_name}
                        <span className="text-xs text-muted-foreground ml-2">
                          {m.vendor_name}
                        </span>
                      </span>
                      <span className="text-sm text-muted-foreground">
                        被展示 {m.times_shown}
                      </span>
                      <span className="font-bold w-16 text-right text-secondary">
                        {m.identify_rate ?? 0}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
