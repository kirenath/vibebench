"use client";

import { CARD_WIDTH, CARD_HEIGHT, type ShareStyleProps } from "../types";

/**
 * 玻璃拟态 Glassmorphism share-card style
 * 
 * 视觉构成：
 * 1. 背景层：深色基底 + 绝对定位的超大模糊光球 (霓虹高光)
 * 2. 材质层：高斯模糊 (backdrop-blur) + 白/灰半透明渐变填充
 * 3. 边缘层：1px 半透明白色描边 + 顶部微弱内阴影 (模拟玻璃受光面)
 * 4. 信息层：高对比度纯白主干信息 + 40%-70% 透明度次级信息
 * 5. 交互层：预留了 group-hover 的微动效 (虽然导出时为静态，但为 DOM 预览提供质感)
 */
export default function GlassCard({ data }: ShareStyleProps) {
  return (
    <div
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      // 根节点：溢出隐藏，承载背景环境光
      className="relative flex items-center justify-center overflow-hidden bg-[#0a0a0f] font-sans group"
    >
      {/* --- 环境光晕 (Ambient Orbs) --- */}
      {/* 左上角冷色光晕 */}
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/30 blur-[80px]" />
      {/* 右下角暖色光晕 */}
      <div className="absolute -right-10 -bottom-20 h-72 w-72 rounded-full bg-fuchsia-600/30 blur-[90px]" />
      {/* 底部居中点缀光晕 */}
      <div className="absolute -bottom-10 left-1/2 h-40 w-60 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[60px]" />

      {/* --- 玻璃卡片主体 (Glass Panel) --- */}
      <div
        className="relative flex h-[275px] w-[552px] flex-col justify-between rounded-3xl p-6 transition-all duration-250 ease-out group-hover:scale-[0.99] group-hover:bg-white/[0.08] group-hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]"
        style={{
          // 玻璃核心材质属性
          background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          // 边框高光与阴影
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)",
        }}
      >
        {/* Header: 品牌与难度标签 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {/* 品牌 Logo 抽象点缀 */}
            <div className="h-4 w-4 rounded-full bg-gradient-to-br from-white to-white/30 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            <span className="text-sm font-semibold tracking-wide text-white/90">
              VibeBench
            </span>
          </div>
          {/* 玻璃态小胶囊标签 */}
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur-md">
            {data.difficultyLabel} 难度
          </div>
        </div>

        {/* Body: 核心数据展示 */}
        <div className="flex flex-col items-center justify-center">
          {/* 胜率大数字 (带垂直渐变和细微发光) */}
          <div className="flex items-baseline gap-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-7xl font-black tracking-tighter text-transparent">
              {data.winRate}
            </span>
            <span className="text-3xl font-bold text-white/60">%</span>
          </div>

          {/* 答题数与段位 */}
          <div className="mt-1 flex items-center gap-3 text-sm">
            <span className="font-medium text-white/80">
              {data.correct} <span className="text-white/40">/</span> {data.total} 正确
            </span>
            <span className="h-1 w-1 rounded-full bg-white/30" />
            <span className="font-medium text-white/90">
              {data.rankEmoji} {data.rankTitle}
            </span>
          </div>

          {/* 作者基准对比 (如果存在) */}
          {data.authorRate !== undefined && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/5 bg-black/20 px-4 py-1.5 text-xs text-white/70">
              <span className="opacity-60">作者基准 {data.authorRate}%</span>
              <span className="h-3 w-px bg-white/10" />
              <span className={
                data.beatAuthor ? "text-emerald-300 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]" : 
                data.tieAuthor ? "text-cyan-300" : 
                "text-amber-300"
              }>
                {data.beatAuthor ? "超越作者 👏" : data.tieAuthor ? "与作者持平 🤝" : "逼近作者，再战！"}
              </span>
            </div>
          )}
        </div>

        {/* Footer: 玩家信息与 URL */}
        <div className="flex items-end justify-between text-xs tracking-wide text-white/40">
          <div className="flex items-center gap-2">
            <span className="tracking-widest text-white/30">玩家</span>
            <span className="font-medium text-white/70">{data.nickname}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400/80 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <span className="font-mono">vibebench.app/guess</span>
          </div>
        </div>
      </div>
    </div>
  );
}