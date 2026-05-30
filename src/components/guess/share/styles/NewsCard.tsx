"use client";

import { CARD_WIDTH, CARD_HEIGHT, type ShareStyleProps } from "../types";

/**
 * 报刊 News (Editorial / Newspaper) share-card style
 *
 * 核心特征:
 * - 绝对的极简与硬朗: 0px 圆角, 高对比度黑白 + 极少量的 Editorial Red (#CC0000)
 * - 粗细交替的边框刻画报纸的分栏结构 (Collapsed grids)
 * - 安全字体栈 (Playfair/Times New Roman), 确保 html-to-image 离线/无跨域渲染正常
 * - 内联 SVG 噪点纹理, 模拟报纸触感
 */
export default function NewsCard({ data }: ShareStyleProps) {
  // 安全降级字体栈，确保 html-to-image 即使没有外部字体也能保持报纸气质
  const fontFamily = {
    serif: "'Playfair Display', 'Times New Roman', Times, Georgia, serif",
    sans: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    mono: "'JetBrains Mono', 'Courier New', Courier, monospace",
  };

  // 极微弱的报纸点阵纹理 (内联 SVG 数据)
  const dotGridPattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23111111' fill-opacity='0.04' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E")`;

  return (
    <div
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundImage: dotGridPattern,
        backgroundColor: "#F9F9F7", // 报纸暖白
      }}
      className="relative flex flex-col text-[#111111] box-border border-[4px] border-[#111111] overflow-hidden rounded-none"
    >
      {/* 1. 报头区 (Masthead) */}
      <div className="flex-none h-12 border-b-[3px] border-[#111111] flex items-center justify-between px-5 bg-[#F9F9F7]">
        <div 
          className="font-black text-2xl uppercase tracking-widest"
          style={{ fontFamily: fontFamily.serif }}
        >
          The VibeBench Times
        </div>
        <div 
          className="text-[10px] uppercase tracking-widest font-bold"
          style={{ fontFamily: fontFamily.mono }}
        >
          第 1 期 | 最新版
        </div>
      </div>

      {/* 2. 主体分栏区 (Editorial Grid) */}
      <div className="flex flex-1 w-full">
        
        {/* 左栏: 核心成绩 (主新闻) */}
        <div className="w-[60%] border-r-[2px] border-[#111111] p-5 flex flex-col justify-center relative">
          {/* Breaking News 红色角标 */}
          <div className="absolute top-4 left-5 bg-[#CC0000] text-[#F9F9F7] text-[10px] px-2 py-0.5 uppercase tracking-widest font-bold" style={{ fontFamily: fontFamily.mono }}>
            官方成绩
          </div>
          
          <div className="mt-4 flex items-baseline">
            <span 
              className="text-[110px] leading-[0.85] font-black tracking-tighter"
              style={{ fontFamily: fontFamily.serif }}
            >
              {data.winRate}
            </span>
            <span 
              className="text-[50px] font-bold ml-1"
              style={{ fontFamily: fontFamily.serif }}
            >
              %
            </span>
          </div>
          
          <div 
            className="text-xl mt-3 font-bold uppercase italic tracking-wide"
            style={{ fontFamily: fontFamily.serif }}
          >
            {data.rankEmoji} {data.rankTitle}
          </div>
        </div>

        {/* 右栏: 数据分析 (副栏) */}
        <div className="w-[40%] flex flex-col">
          {/* Accuracy块 */}
          <div className="flex-1 border-b-[1.5px] border-[#111111] p-4 flex flex-col justify-center">
            <div className="text-[9px] uppercase tracking-[0.2em] text-neutral-600 mb-1" style={{ fontFamily: fontFamily.mono }}>
              准确率
            </div>
            <div className="text-xl font-black" style={{ fontFamily: fontFamily.sans }}>
              {data.correct} <span className="text-sm font-medium text-neutral-600">/ {data.total}</span>
            </div>
          </div>
          
          {/* Difficulty块 */}
          <div className="flex-1 border-b-[1.5px] border-[#111111] p-4 flex flex-col justify-center">
            <div className="text-[9px] uppercase tracking-[0.2em] text-neutral-600 mb-1" style={{ fontFamily: fontFamily.mono }}>
              试卷难度
            </div>
            <div className="text-lg font-black uppercase tracking-wide" style={{ fontFamily: fontFamily.sans }}>
              {data.difficultyLabel}
            </div>
          </div>
          
          {/* Author Benchmark 块 (带深色底纹区分) */}
          <div className="flex-1 p-4 flex flex-col justify-center bg-black/5">
            {data.authorRate !== undefined ? (
              <>
                <div className="text-[9px] uppercase tracking-[0.2em] text-neutral-600 mb-1" style={{ fontFamily: fontFamily.mono }}>
                  对比作者基准 ({data.authorRate}%)
                </div>
                <div 
                  className={`text-sm font-bold uppercase tracking-wide ${data.beatAuthor ? 'text-[#CC0000]' : data.tieAuthor ? 'text-[#1040C0]' : 'text-[#111111]'}`} 
                  style={{ fontFamily: fontFamily.sans }}
                >
                  {data.beatAuthor ? '★ 超过作者' : data.tieAuthor ? '与作者持平' : '未达标准'}
                </div>
              </>
            ) : (
              <>
                <div className="text-[9px] uppercase tracking-[0.2em] text-neutral-600 mb-1" style={{ fontFamily: fontFamily.mono }}>
                  评定
                </div>
                <div className="text-sm font-bold uppercase tracking-wide text-[#111111]" style={{ fontFamily: fontFamily.sans }}>
                  已认证盖章
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. 底部版权及信息 (Footer Footer) */}
      <div className="flex-none h-8 border-t-[3px] border-[#111111] bg-[#111111] text-[#F9F9F7] flex items-center justify-between px-5">
        <div className="text-[10px] uppercase tracking-widest" style={{ fontFamily: fontFamily.mono }}>
          玩家：{data.nickname}
        </div>
        <div className="text-[10px] uppercase tracking-widest text-neutral-400" style={{ fontFamily: fontFamily.mono }}>
          vibebench.app/guess
        </div>
      </div>
    </div>
  );
}