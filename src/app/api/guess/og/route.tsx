import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import {
  verifyResult,
  rankTitle,
  winRateOf,
  DIFFICULTY_LABELS,
} from "@/lib/guessShare";

export const dynamic = "force-dynamic";

const WIDTH = 1200;
const HEIGHT = 630;

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("r") || "";
  const result = verifyResult(token);

  const fallback = (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b1020",
        color: "#e2e8f0",
        fontSize: 56,
      }}
    >
      VibeBench · 看作品猜模型
    </div>
  );

  if (!result) {
    return new ImageResponse(fallback, { width: WIDTH, height: HEIGHT });
  }

  const winRate = winRateOf(result.c, result.t);
  const rank = rankTitle(winRate, result.d);
  const diffLabel = DIFFICULTY_LABELS[result.d] ?? result.d;
  const nickname = result.n || "匿名玩家";
  const beatAuthor = result.a !== undefined && winRate > result.a;
  const tieAuthor = result.a !== undefined && winRate === result.a;

  const center = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontSize: 180, fontWeight: 900, color: "#a78bfa", lineHeight: 1 }}>
        {winRate}%
      </div>
      <div style={{ fontSize: 48, color: "#e2e8f0", marginTop: 8 }}>
        {result.c} / {result.t} 正确
      </div>
      <div style={{ fontSize: 36, color: "#94a3b8", marginTop: 8 }}>
        {diffLabel}难度 · {rank.emoji} {rank.title}
      </div>
      {result.a !== undefined && (
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 20, fontSize: 34 }}>
          <span style={{ color: "#94a3b8" }}>作者基准 {result.a}%</span>
          <span style={{ color: beatAuthor ? "#34d399" : tieAuthor ? "#a78bfa" : "#cbd5e1", fontWeight: beatAuthor || tieAuthor ? 700 : 400 }}>
            {beatAuthor ? "超过作者 👏" : tieAuthor ? "与作者持平 🤝" : "逼近作者，再战！"}
          </span>
        </div>
      )}
    </div>
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, #1e1b4b 0%, #0b1020 70%)",
          color: "#e2e8f0",
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 36, color: "#94a3b8" }}>
          <span style={{ fontWeight: 800, color: "#e2e8f0" }}>VibeBench</span>
          <span style={{ margin: "0 14px" }}>·</span>
          <span>看作品猜模型</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          {center}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 34 }}>
          <span style={{ color: "#cbd5e1" }}>玩家：{nickname}</span>
          <span style={{ color: "#a78bfa" }}>你也来试试 →</span>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT }
  );
}
