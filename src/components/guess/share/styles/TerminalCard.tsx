"use client";

import { CARD_WIDTH, CARD_HEIGHT, type ShareStyleProps } from "../types";

/**
 * 终端 Terminal share-card style
 *
 * 设计理念: Cyber-Industrial, 纯命令行界面, 荧光终端绿(Phosphor Green).
 * 画布约束: 必须铺满 CARD_WIDTH × CARD_HEIGHT (600×315), 纯粹基于系统 Monospace 字体, 无外部依赖.
 */
export default function TerminalCard({ data }: ShareStyleProps) {
  // 终端风格进度条生成器: [██████░░░░]
  const BAR_LENGTH = 12;
  const filledCount = Math.round((data.correct / data.total) * BAR_LENGTH);
  const safeFilled = Math.min(Math.max(filledCount, 0), BAR_LENGTH);
  const bar = "█".repeat(safeFilled) + "░".repeat(BAR_LENGTH - safeFilled);

  return (
    <div
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: "#0a0a0a",
        color: "#33ff00",
        // CRT 文本荧光残留效果
        textShadow: "0 0 4px rgba(51, 255, 0, 0.4)",
      }}
      className="relative font-mono flex flex-col p-6 box-border uppercase overflow-hidden rounded-none"
    >
      {/* Subtle CRT Scanline Overlay (扫描线遮罩) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, #33ff00 2px, #33ff00 3px)",
          backgroundSize: "100% 4px",
        }}
      />

      {/* Top Title Bar (反色标题栏) */}
      <div
        className="bg-[#33ff00] text-[#0a0a0a] px-3 py-1 text-sm font-black flex justify-between items-center z-10"
        style={{ textShadow: "none" }} // 黑色字体不需要发光
      >
        <span>VIBEBENCH_OS v1.0</span>
        <span>[ 系统在线 ]</span>
      </div>

      <div className="flex-1 flex flex-col justify-between mt-4 relative z-10">
        {/* Terminal Prompt Line (模拟终端命令输入) */}
        <div className="text-sm flex items-center gap-2 tracking-tight">
          <span className="text-[#ffb000]">guest@sys:~$</span>
          <span>
            ./评测 --目标="vibe" --用户="
            <span className="truncate max-w-[150px] inline-block align-bottom text-white">
              {data.nickname}
            </span>
            "
          </span>
        </div>

        {/* Main Stats Pane (主数据看板 - 硬边框及角标) */}
        <div className="border border-[#1f521f] p-4 bg-[#0a0a0a] relative my-3">
          {/* Corner Decorators (经典的硬核UI角标) */}
          <div className="absolute -top-[5px] -left-[4px] text-[#1f521f] text-xs leading-none">+</div>
          <div className="absolute -top-[5px] -right-[4px] text-[#1f521f] text-xs leading-none">+</div>
          <div className="absolute -bottom-[6px] -left-[4px] text-[#1f521f] text-xs leading-none">+</div>
          <div className="absolute -bottom-[6px] -right-[4px] text-[#1f521f] text-xs leading-none">+</div>

          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-xs text-[#1f521f] mb-1 tracking-widest">
                &gt; 准确率
              </span>
              <div className="text-6xl font-black leading-none tracking-tighter">
                {data.winRate}
                <span className="text-4xl text-[#1f521f]">%</span>
              </div>
            </div>

            <div className="flex flex-col items-end text-right">
              <span className="text-xs text-[#1f521f] mb-2 tracking-widest">
                &gt; 数据流
              </span>
              <div className="text-lg tracking-widest">[{bar}]</div>
              <div className="text-sm mt-1 text-[#ffb000]">
                {data.correct} / {data.total} 成功
              </div>
            </div>
          </div>
        </div>

        {/* Meta Stats & Author Compare (元数据与作者对战数据) */}
        <div className="text-xs space-y-2 tracking-wide">
          <div className="flex justify-between">
            <span>&gt; 难度: [{data.difficultyLabel}]</span>
            <span>
              &gt; 段位: {data.rankEmoji} {data.rankTitle}
            </span>
          </div>

          {data.authorRate !== undefined && (
            <div className="flex justify-between border-t border-dashed border-[#1f521f] pt-2 mt-2">
              <span className="text-[#ffb000]">
                &gt; 作者基准: {data.authorRate}%
              </span>
              <span className="text-[#ffb000]">
                {data.beatAuthor
                  ? "[ 超越作者 👏 ]"
                  : data.tieAuthor
                  ? "[ 系统平局 🤝 ]"
                  : "[ 尝试失败: 请重试 ]"}
              </span>
            </div>
          )}
        </div>

        {/* Footer CTA & Blinking Cursor (闪烁的光标与地址) */}
        <div className="text-xs flex justify-between items-end border-t border-[#1f521f] pt-3 mt-1">
          <span className="text-[#1f521f]">处理完成</span>
          <span
            className="bg-[#33ff00] text-[#0a0a0a] px-2 py-0.5 font-bold"
            style={{ textShadow: "none" }}
          >
            vibebench.app/guess
            {/* Blinking Cursor (html-to-image 截图时会定格在方块) */}
            <span className="animate-pulse ml-1 inline-block bg-[#0a0a0a] w-[8px] h-[12px] align-middle"></span>
          </span>
        </div>
      </div>
    </div>
  );
}