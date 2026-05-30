import { rankTitle, winRateOf, DIFFICULTY_LABELS } from "@/lib/guessRank";
import type { GuessDifficulty } from "@/lib/guessToken";

// The fixed canvas every style component must fill. Exported as PNG via
// html-to-image at 2x. Keep this ratio (1.91:1, matches OG) so a style can
// double as a link-preview image later.
export const CARD_WIDTH = 600;
export const CARD_HEIGHT = 315;

// Raw inputs supplied by the caller (modal / share page).
export interface ShareCardInput {
  nickname: string;
  difficulty: GuessDifficulty;
  correct: number;
  total: number;
  authorRate?: number; // author baseline win-rate (%), if available
  shareUrl?: string; // canonical share link (for an optional QR / footer)
}

// Fully derived data handed to a style component. A style should ONLY read
// from this object and never recompute scores itself.
export interface ShareCardData {
  nickname: string;
  difficulty: GuessDifficulty;
  difficultyLabel: string; // "简单" / "中等" / "困难"
  correct: number;
  total: number;
  winRate: number; // 0–100, one decimal
  rankTitle: string; // e.g. "鉴模大师"
  rankEmoji: string; // e.g. "🏆"
  authorRate?: number; // 0–100, undefined when no baseline
  beatAuthor: boolean; // winRate > authorRate (false when no baseline)
  tieAuthor: boolean; // winRate === authorRate (false when no baseline)
  shareUrl?: string;
}

// The single contract every visual style component implements.
export interface ShareStyleProps {
  data: ShareCardData;
}

export function buildShareCardData(input: ShareCardInput): ShareCardData {
  const winRate = winRateOf(input.correct, input.total);
  const rank = rankTitle(winRate, input.difficulty);
  return {
    nickname: input.nickname,
    difficulty: input.difficulty,
    difficultyLabel: DIFFICULTY_LABELS[input.difficulty] ?? input.difficulty,
    correct: input.correct,
    total: input.total,
    winRate,
    rankTitle: rank.title,
    rankEmoji: rank.emoji,
    authorRate: input.authorRate,
    beatAuthor: input.authorRate !== undefined && winRate > input.authorRate,
    tieAuthor: input.authorRate !== undefined && winRate === input.authorRate,
    shareUrl: input.shareUrl,
  };
}
