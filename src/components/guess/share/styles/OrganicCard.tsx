"use client";

import { CARD_WIDTH, CARD_HEIGHT, type ShareStyleProps } from "../types";

// Organic / Natural — the project's house style (wabi-sabi, moss & clay,
// rice-paper warmth, Fraunces serif). This is the DEFAULT share style and
// the reference for on-brand cards. Colors are hardcoded (light palette) so
// the exported PNG stays consistent regardless of the visitor's theme.
const PAPER = "#FDFCF8";
const INK = "#2C2C24";
const MOSS = "#5D7052";
const CLAY = "#C18C5D";
const SAND = "#E6DCCD";
const BARK = "#4A4A40";
const TIMBER = "#DED8CF";
const GRASS = "#78786C";

const HEADING = "var(--font-heading), Georgia, serif";
const BODY = "var(--font-body), system-ui, sans-serif";

export default function OrganicCard({ data }: ShareStyleProps) {
  return (
    <div
      style={{
        position: "relative",
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        overflow: "hidden",
        background: PAPER,
        color: INK,
        fontFamily: BODY,
        padding: 32,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Ambient organic blobs */}
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -40,
          width: 220,
          height: 220,
          background: "rgba(93, 112, 82, 0.18)",
          borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
          filter: "blur(36px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -70,
          left: -50,
          width: 240,
          height: 200,
          background: "rgba(193, 140, 93, 0.16)",
          borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
          filter: "blur(40px)",
        }}
      />

      {/* Header */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 15,
          color: GRASS,
        }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: MOSS,
            display: "inline-block",
          }}
        />
        <span style={{ fontWeight: 800, color: INK }}>VibeBench</span>
        <span>· 看作品猜模型</span>
      </div>

      {/* Center */}
      <div
        style={{
          position: "relative",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: HEADING,
            fontSize: 92,
            fontWeight: 700,
            color: MOSS,
            lineHeight: 1,
          }}
        >
          {data.winRate}
          <span style={{ fontSize: 46 }}>%</span>
        </div>
        <div style={{ fontSize: 22, marginTop: 6 }}>
          {data.correct} / {data.total} 正确
        </div>
        <div
          style={{
            marginTop: 12,
            padding: "6px 16px",
            borderRadius: 9999,
            background: SAND,
            color: BARK,
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          {data.difficultyLabel}难度 · {data.rankEmoji} {data.rankTitle}
        </div>
        {data.authorRate !== undefined && (
          <div style={{ marginTop: 10, fontSize: 15, color: GRASS }}>
            作者基准 {data.authorRate}% ·{" "}
            <span
              style={{
                color: data.beatAuthor ? MOSS : data.tieAuthor ? CLAY : SAND,
                fontWeight: 700,
              }}
            >
              {data.beatAuthor ? "超过作者 👏" : data.tieAuthor ? "与作者持平 🤝" : "逼近作者，再战！"}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 15,
          borderTop: `1px solid ${TIMBER}`,
          paddingTop: 12,
        }}
      >
        <span style={{ color: GRASS }}>
          玩家 · <span style={{ color: INK, fontWeight: 600 }}>{data.nickname}</span>
        </span>
        <span style={{ color: CLAY, fontWeight: 700 }}>vibebench.app/guess</span>
      </div>
    </div>
  );
}
