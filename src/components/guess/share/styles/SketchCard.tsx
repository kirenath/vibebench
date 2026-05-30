"use client";

import { CARD_WIDTH, CARD_HEIGHT, type ShareStyleProps } from "../types";

// --- Design Tokens (Hardcoded for export safety) ---
const COLORS = {
  paper: "#fdfbf7",
  pencil: "#2d2d2d",
  muted: "#e5e0d8",
  redMarker: "#ff4d4d",
  bluePen: "#2d5da1",
  postIt: "#fff9c4",
};

// Wobbly border radii for organic, hand-drawn shapes
const RADII = {
  wobblyMd: "255px 15px 225px 15px / 15px 225px 15px 255px",
  wobblySm: "15px 225px 15px 255px / 255px 15px 225px 15px",
  wobblyCircle: "60% 40% 50% 50% / 40% 50% 60% 40%",
  wobblyCircleAlt: "45% 55% 40% 60% / 55% 45% 60% 40%",
};

// Font stacks (Ensures doodle vibe even if web fonts fail during html-to-image)
const FONTS = {
  heading: '"Kalam", "Comic Sans MS", "Chalkboard SE", cursive',
  body: '"Patrick Hand", "Comic Sans MS", "Chalkboard SE", cursive',
};

/**
 * 手绘 Sketch (Hand-drawn / Doodle) share-card style
 */
export default function SketchCard({ data }: ShareStyleProps) {
  return (
    <div
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: COLORS.paper,
        // Dot grid pattern simulating notebook paper
        backgroundImage: `radial-gradient(${COLORS.muted} 1.5px, transparent 1.5px)`,
        backgroundSize: "24px 24px",
        fontFamily: FONTS.body,
        color: COLORS.pencil,
      }}
      className="relative flex flex-col justify-between p-6 box-border overflow-hidden"
    >
      {/* --- HEADER --- */}
      <div className="flex justify-between items-start z-10">
        <div className="flex flex-col relative">
          <div
            style={{ fontFamily: FONTS.heading }}
            className="text-3xl font-black tracking-tight"
          >
            VibeBench
            {/* Hand-drawn squiggly underline */}
            <svg
              className="absolute -bottom-1.5 left-0 w-[110%] h-2 text-neutral-800"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
            >
              <path
                d="M0,5 Q10,10 20,5 T40,5 T60,5 T80,5 T100,5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-sm font-bold mt-1 ml-1 text-neutral-600">
            看作品猜模型
          </span>
        </div>

        <div
          className="px-3 py-1 bg-white border-[3px] rotate-2"
          style={{
            borderColor: COLORS.pencil,
            borderRadius: RADII.wobblySm,
            boxShadow: `3px 3px 0px 0px ${COLORS.pencil}`,
          }}
        >
          <span className="text-sm font-bold tracking-wide">
            vibebench.app/guess
          </span>
        </div>
      </div>

      {/* --- MAIN CONTENT (2-Column Collage) --- */}
      <div className="flex flex-1 items-center justify-between px-2 w-full mt-2 z-10">
        {/* Left: The "Grade" (Win Rate) */}
        <div className="relative w-1/2 flex flex-col items-center justify-center -rotate-2">
          {/* Sketchy Circle Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-36 h-36 border-4 border-dashed opacity-30 animate-spin-slow"
              style={{
                borderColor: COLORS.redMarker,
                borderRadius: RADII.wobblyCircle,
                animationDuration: "8s",
              }}
            />
            <div
              className="absolute w-32 h-32 border-[3px] opacity-20"
              style={{
                borderColor: COLORS.redMarker,
                borderRadius: RADII.wobblyCircleAlt,
              }}
            />
          </div>

          <div
            style={{ fontFamily: FONTS.heading, color: COLORS.redMarker }}
            className="text-7xl font-black drop-shadow-sm"
          >
            {data.winRate}%
          </div>

          <div
            className="mt-2 px-4 py-1 bg-neutral-800 text-white font-bold text-lg -rotate-1"
            style={{
              borderRadius: RADII.wobblySm,
              boxShadow: `3px 3px 0px 0px ${COLORS.muted}`,
            }}
          >
            {data.correct} / {data.total} 正确
          </div>
        </div>

        {/* Right: Post-it Note (Stats) */}
        <div className="relative w-1/2 flex justify-end pr-4">
          <div
            className="w-64 border-[3px] p-4 flex flex-col gap-2 relative rotate-2"
            style={{
              backgroundColor: COLORS.postIt,
              borderColor: COLORS.pencil,
              borderRadius: RADII.wobblyMd,
              boxShadow: `6px 6px 0px 0px ${COLORS.pencil}`,
            }}
          >
            {/* Red Thumbtack (Tack Decoration) */}
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 z-20"
              style={{
                backgroundColor: COLORS.redMarker,
                borderColor: COLORS.pencil,
                boxShadow: `2px 2px 0px 0px ${COLORS.pencil}`,
              }}
            />
            {/* Thumbtack pin shadow */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-3 bg-black/20 rounded-full -z-10" />

            {/* Content */}
            <div
              className="text-2xl font-black flex items-center gap-2"
              style={{ fontFamily: FONTS.heading }}
            >
              <span className="text-3xl">{data.rankEmoji}</span>
              {data.rankTitle}
            </div>

            <div
              className="text-base font-bold"
              style={{ color: COLORS.bluePen }}
            >
              难度评级: {data.difficultyLabel}
            </div>

            {data.authorRate !== undefined && (
              <>
                {/* Hand-drawn dashed divider */}
                <div
                  className="w-full border-t-[3px] border-dashed my-1"
                  style={{ borderColor: `${COLORS.pencil}40` }}
                />
                <div className="text-sm font-bold flex flex-col gap-0.5">
                  <span className="text-neutral-600">
                    作者基准: {data.authorRate}%
                  </span>
                  <span
                    style={{
                      color: data.beatAuthor
                        ? COLORS.redMarker
                        : data.tieAuthor
                        ? COLORS.pencil
                        : COLORS.bluePen,
                    }}
                  >
                    {data.beatAuthor
                      ? "超过作者 👏"
                      : data.tieAuthor
                      ? "与作者持平 🤝"
                      : "逼近作者，再战！"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <div className="flex items-end justify-between w-full mt-2 z-10">
        <div className="flex items-center gap-2">
          {/* Hand-drawn avatar placeholder or icon */}
          <div
            className="w-8 h-8 flex items-center justify-center border-2 bg-white -rotate-3"
            style={{
              borderColor: COLORS.pencil,
              borderRadius: RADII.wobblySm,
            }}
          >
            <span className="text-sm">👤</span>
          </div>
          <div
            className="text-lg font-bold max-w-[200px] truncate"
            style={{ color: COLORS.bluePen }}
          >
            {data.nickname}
          </div>
        </div>
      </div>
    </div>
  );
}