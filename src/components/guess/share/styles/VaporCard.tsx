"use client";

import { CARD_WIDTH, CARD_HEIGHT, type ShareStyleProps } from "../types";

/**
 * 蒸汽波 Vapor (Vaporwave) share-card style
 * 
 * Design implementation notes:
 * - Uses the "Infinite Grid" with CSS perspective transforms.
 * - Applies heavy neon box-shadows and drop-shadows (#FF00FF, #00FFFF).
 * - Layout mimics a retro-futuristic terminal window.
 * - Uses standard Tailwind `font-sans` (for geometric headings) and `font-mono` (for UI).
 * - Replaces unstable mix-blend-modes and mask-images with stable canvas-safe gradient overlays 
 *   to ensure perfect html-to-image PNG exports.
 */
export default function VaporCard({ data }: ShareStyleProps) {
  return (
    <div
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      className="relative overflow-hidden bg-[#090014] font-mono select-none flex flex-col items-center justify-center"
    >
      {/* --- LAYER 1: THE VOID (Background Effects) --- */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Floating Synthwave Sun */}
        <div 
          className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-gradient-to-b from-[#FF9900] to-[#FF00FF] opacity-40"
          style={{ filter: "blur(40px)" }}
        />

        {/* Perspective Grid Floor */}
        <div className="absolute bottom-0 left-[-50%] w-[200%] h-[140px] overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(transparent 90%, #FF00FF 90%), linear-gradient(90deg, transparent 90%, #FF00FF 90%)",
              backgroundSize: "24px 24px",
              transform: "perspective(250px) rotateX(60deg) translateY(10px)",
              transformOrigin: "bottom center",
            }}
          />
          {/* Canvas-safe gradient mask to fade the grid into the horizon */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#090014] via-[#090014]/80 to-transparent" />
        </div>
      </div>

      {/* --- LAYER 2: TERMINAL WINDOW (Content) --- */}
      <div className="relative z-10 w-full h-full p-4 flex flex-col">
        <div className="flex-1 border-2 border-[#00FFFF] bg-[#1a103c]/80 shadow-[0_0_20px_rgba(0,255,255,0.25)] flex flex-col relative overflow-hidden">
          
          {/* Window Header */}
          <div className="h-7 bg-[#00FFFF]/15 border-b-2 border-[#00FFFF] flex items-center px-3 justify-between shadow-[0_4px_10px_rgba(0,255,255,0.1)]">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#FF00FF] shadow-[0_0_6px_#FF00FF]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#00FFFF] shadow-[0_0_6px_#00FFFF]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#FF9900] shadow-[0_0_6px_#FF9900]" />
            </div>
            <div className="text-[10px] text-[#00FFFF] tracking-widest font-bold uppercase">
              VIBEBENCH 系统
            </div>
          </div>

          {/* Window Body */}
          <div className="flex-1 flex flex-col items-center justify-center p-2 text-center">
            
            <div className="text-[11px] text-[#00FFFF] mb-1 tracking-widest">
              &gt; 系统难度: <span className="text-[#E0E0E0]">{data.difficultyLabel}</span>
            </div>

            {/* Hero Stat: Sunset Gradient Text with Glow */}
            <div
              className="text-7xl font-sans font-black tracking-tighter uppercase mb-3 leading-none"
              style={{
                backgroundImage: "linear-gradient(to right, #FF9900, #FF00FF, #00FFFF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 12px rgba(255,0,255,0.6))",
              }}
            >
              {data.winRate}%
            </div>

            {/* Badges: Skewed geometric containers */}
            <div className="flex items-center gap-4 text-[11px] font-bold tracking-wider mb-4">
              <div className="transform -skew-x-12 border-2 border-[#FF00FF] bg-[#FF00FF]/10 px-4 py-1.5 shadow-[0_0_12px_rgba(255,0,255,0.3)]">
                <span className="inline-block transform skew-x-12 text-[#FF00FF]">
                  命中: {data.correct}/{data.total}
                </span>
              </div>
              <div className="transform -skew-x-12 border-2 border-[#00FFFF] bg-[#00FFFF]/10 px-4 py-1.5 shadow-[0_0_12px_rgba(0,255,255,0.3)]">
                <span className="inline-block transform skew-x-12 text-[#00FFFF]">
                  段位: {data.rankEmoji} {data.rankTitle}
                </span>
              </div>
            </div>

            {/* Target Author Sub-Terminal */}
            {data.authorRate !== undefined && (
              <div className="text-[10px] bg-black border border-[#E0E0E0]/20 px-4 py-1.5 text-[#E0E0E0] shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]">
                <span className="text-[#FF9900] mr-2">系统目标:</span>
                作者基准 {data.authorRate}% //{" "}
                {data.beatAuthor ? (
                  <span className="text-[#00FFFF]">超越成功 👏</span>
                ) : data.tieAuthor ? (
                  <span className="text-[#E0E0E0]">匹配确认 🤝</span>
                ) : (
                  <span className="text-[#FF00FF]">表现不足 ⚠️</span>
                )}
              </div>
            )}
          </div>

          {/* Window Status Bar */}
          <div className="h-7 border-t border-[#E0E0E0]/20 bg-[#090014] flex items-center px-3 justify-between text-[10px] text-[#E0E0E0]/50 tracking-widest">
            <div>&gt; 用户: <span className="text-[#E0E0E0]/80">{data.nickname}</span></div>
            <div>网络://VIBEBENCH.APP/GUESS</div>
          </div>
        </div>
      </div>

      {/* --- LAYER 3: CRT SCANLINES --- */}
      <div
        className="absolute inset-0 z-50 pointer-events-none"
        style={{
          background: "linear-gradient(transparent 50%, rgba(0,0,0,0.3) 50%)",
          backgroundSize: "100% 4px",
        }}
      />
    </div>
  );
}