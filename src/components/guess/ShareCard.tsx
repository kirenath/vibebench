"use client";

import {
  rankTitle,
  winRateOf,
  DIFFICULTY_LABELS,
  type ShareTemplate,
  type ShareHighlight,
} from "@/lib/guessRank";
import type { GuessDifficulty } from "@/lib/guessToken";

export interface ShareCardProps {
  nickname: string;
  difficulty: GuessDifficulty;
  correct: number;
  total: number;
  authorRate?: number;
  template: ShareTemplate;
  highlight?: ShareHighlight;
}

export default function ShareCard({
  nickname,
  difficulty,
  correct,
  total,
  authorRate,
  template,
  highlight,
}: ShareCardProps) {
  const winRate = winRateOf(correct, total);
  const rank = rankTitle(winRate, difficulty);
  const diffLabel = DIFFICULTY_LABELS[difficulty] ?? difficulty;

  let center: React.ReactNode;
  if (template === "rank") {
    center = (
      <div className="flex flex-col items-center">
        <div className="text-[72px] leading-none">{rank.emoji}</div>
        <div className="text-[42px] font-extrabold text-violet-300">
          {rank.title}
        </div>
        <div className="text-lg text-slate-400 mt-1">
          {diffLabel} · 胜率 {winRate}%
        </div>
      </div>
    );
  } else if (template === "vs_author") {
    const a = authorRate ?? 0;
    const beat = winRate >= a;
    center = (
      <div className="flex flex-col items-center">
        <div className="flex items-end gap-8">
          <div className="flex flex-col items-center">
            <div className="text-[52px] font-extrabold text-emerald-400">
              {winRate}%
            </div>
            <div className="text-base text-slate-400">你</div>
          </div>
          <div className="text-3xl text-slate-500 pb-3">vs</div>
          <div className="flex flex-col items-center">
            <div className="text-[52px] font-extrabold text-pink-400">{a}%</div>
            <div className="text-base text-slate-400">作者</div>
          </div>
        </div>
        <div className="text-xl text-slate-200 mt-3">
          {beat ? "超过作者 👏" : "略逊作者，再战！"}
        </div>
      </div>
    );
  } else if (template === "highlight" && highlight) {
    center = (
      <div className="flex flex-col items-center text-center px-8">
        <div className="text-[64px] leading-none">😵</div>
        <div className="text-2xl font-bold text-slate-100 leading-snug mt-2">
          我把 <span className="text-pink-400">{highlight.shown}</span> 的作品
        </div>
        <div className="text-2xl font-bold text-slate-100 leading-snug">
          认成了 <span className="text-violet-300">{highlight.guessed}</span>
        </div>
        <div className="text-base text-slate-400 mt-2">
          {diffLabel} · 胜率 {winRate}%
        </div>
      </div>
    );
  } else {
    center = (
      <div className="flex flex-col items-center">
        <div className="text-[96px] font-black text-violet-300 leading-none">
          {winRate}%
        </div>
        <div className="text-2xl text-slate-100 mt-1">
          {correct} / {total} 正确
        </div>
        <div className="text-base text-slate-400 mt-1">
          {diffLabel}难度 · {rank.emoji} {rank.title}
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-[600px] h-[315px] flex flex-col justify-between p-8 text-slate-200"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 0%, #1e1b4b 0%, #0b1020 70%)",
        fontFamily: "var(--font-sans, sans-serif)",
      }}
    >
      <div className="flex items-center text-base text-slate-400">
        <span className="font-extrabold text-slate-100">VibeBench</span>
        <span className="mx-2">·</span>
        <span>看作品猜模型</span>
      </div>

      <div className="flex items-center justify-center flex-1">{center}</div>

      <div className="flex items-center justify-between text-base">
        <span className="text-slate-300">玩家：{nickname}</span>
        <span className="text-violet-300">你也来试试 →</span>
      </div>
    </div>
  );
}
