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

  let center: React.ReactNode;
  if (result.tpl === "rank") {
    center = (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontSize: 140, lineHeight: 1 }}>{rank.emoji}</div>
        <div style={{ fontSize: 84, fontWeight: 800, color: "#a78bfa" }}>
          {rank.title}
        </div>
        <div style={{ fontSize: 40, color: "#94a3b8", marginTop: 12 }}>
          {diffLabel} · 胜率 {winRate}%
        </div>
      </div>
    );
  } else if (result.tpl === "vs_author") {
    const authorRate = result.a ?? 0;
    const beat = winRate >= authorRate;
    center = (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 60 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: 96, fontWeight: 800, color: "#34d399" }}>
              {winRate}%
            </div>
            <div style={{ fontSize: 34, color: "#94a3b8" }}>你</div>
          </div>
          <div style={{ fontSize: 60, color: "#64748b", paddingBottom: 30 }}>vs</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: 96, fontWeight: 800, color: "#f472b6" }}>
              {authorRate}%
            </div>
            <div style={{ fontSize: 34, color: "#94a3b8" }}>作者</div>
          </div>
        </div>
        <div style={{ fontSize: 44, color: "#e2e8f0", marginTop: 28 }}>
          {beat ? "超过作者 👏" : "略逊作者，再战！"}
        </div>
      </div>
    );
  } else if (result.tpl === "highlight" && result.h) {
    center = (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 80px", textAlign: "center" }}>
        <div style={{ fontSize: 120 }}>😵</div>
        <div style={{ fontSize: 52, fontWeight: 700, color: "#e2e8f0", lineHeight: 1.3 }}>
          我把 <span style={{ color: "#f472b6" }}>{result.h.shown}</span> 的作品
        </div>
        <div style={{ fontSize: 52, fontWeight: 700, color: "#e2e8f0", lineHeight: 1.3 }}>
          认成了 <span style={{ color: "#a78bfa" }}>{result.h.guessed}</span>
        </div>
        <div style={{ fontSize: 38, color: "#94a3b8", marginTop: 24 }}>
          {diffLabel} · 胜率 {winRate}%
        </div>
      </div>
    );
  } else {
    // scoreboard (default)
    center = (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontSize: 200, fontWeight: 900, color: "#a78bfa", lineHeight: 1 }}>
          {winRate}%
        </div>
        <div style={{ fontSize: 48, color: "#e2e8f0", marginTop: 8 }}>
          {result.c} / {result.t} 正确
        </div>
        <div style={{ fontSize: 36, color: "#94a3b8", marginTop: 8 }}>
          {diffLabel}难度 · {rank.emoji} {rank.title}
        </div>
      </div>
    );
  }

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
