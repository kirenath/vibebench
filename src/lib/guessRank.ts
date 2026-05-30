import type { GuessDifficulty } from "./guessToken";

export type ShareTemplate = "scoreboard" | "rank" | "vs_author" | "highlight";

export interface ShareHighlight {
  shown: string;
  guessed: string;
}

export const DIFFICULTY_LABELS: Record<GuessDifficulty, string> = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
};

export interface RankTitle {
  title: string;
  emoji: string;
}

/**
 * Map a win rate (and difficulty) to a rank title. Harder difficulties get a
 * small bonus at the same win rate. Pure / browser-safe (no node deps).
 */
export function rankTitle(
  winRate: number,
  difficulty: GuessDifficulty
): RankTitle {
  const bump = difficulty === "hard" ? 10 : difficulty === "medium" ? 5 : 0;
  const score = Math.min(100, winRate + bump);
  if (score >= 100) return { title: "模型之眼", emoji: "👁" };
  if (score >= 80) return { title: "鉴模大师", emoji: "🏆" };
  if (score >= 60) return { title: "资深鉴模师", emoji: "🥇" };
  if (score >= 40) return { title: "入门鉴模师", emoji: "🔍" };
  return { title: "凡人肉眼", emoji: "👀" };
}

export function winRateOf(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 1000) / 10;
}
