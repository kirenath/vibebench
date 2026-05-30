"use client";

import { CARD_WIDTH, CARD_HEIGHT, type ShareStyleProps } from "../types";

/**
 * 包豪斯 Bauhaus share-card style
 * 
 * 设计提示词: prd/share/bauhaus.md
 * 画布约束: 根节点铺满 600×315。无跨域资源，纯粹依靠 CSS 几何图形和标准字体渲染。
 */
export default function BauhausCard({ data }: ShareStyleProps) {
  return (
    <div
      style={{ 
        width: CARD_WIDTH, 
        height: CARD_HEIGHT,
        // 包豪斯灵魂字体：Outfit（备用系统无衬线字体以防跨域加载失败）
        fontFamily: "'Outfit', 'Arial Black', system-ui, sans-serif" 
      }}
      className="relative bg-[#F0F0F0] overflow-hidden border-4 border-[#121212] box-border text-[#121212]"
    >
      {/* 1. 背景纹理：建构主义网格点 (Opacity 处理以防止过于抢眼) */}
      <div 
        className="absolute inset-0 opacity-15 z-0"
        style={{ 
          backgroundImage: 'radial-gradient(#121212 2px, transparent 2px)', 
          backgroundSize: '20px 20px' 
        }}
      />

      {/* 2. 背景几何构图：绝对纯粹的圆形和旋转正方形 (Primary Colors) */}
      {/* 左上角巨大黄色圆形 */}
      <div className="absolute w-72 h-72 rounded-full bg-[#F0C020] border-4 border-[#121212] -left-16 -top-16 z-0" />
      {/* 右下角蓝色旋转正方形 */}
      <div className="absolute w-44 h-44 bg-[#1040C0] border-4 border-[#121212] rotate-45 -bottom-20 right-28 z-0" />

      {/* 3. 顶部品牌标签：纯黑白极简 */}
      <div className="absolute top-0 right-0 bg-[#121212] text-white px-4 py-1.5 font-bold text-xs tracking-widest uppercase z-20 border-b-4 border-l-4 border-[#121212]">
        VibeBench
      </div>

      {/* 4. 左侧核心面板：准确率 (The Hero) */}
      <div className="absolute top-10 left-8 bg-white border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] p-5 z-20 w-[240px]">
        <div className="text-xs font-bold uppercase tracking-widest border-b-4 border-[#121212] pb-1 mb-2">
          准确率
        </div>
        <div className="text-[4.5rem] leading-[0.8] font-black tracking-tighter">
          {data.winRate}%
        </div>
        <div className="mt-4 bg-[#121212] text-white text-sm font-bold uppercase inline-block px-3 py-1 tracking-wider">
          {data.correct} / {data.total} 正确
        </div>

        {/* 作者挑战徽章：破坏网格的红色旋转小色块 (Asymmetric Balance) */}
        {data.authorRate !== undefined && (
          <div className="absolute -right-8 -bottom-6 bg-[#D02020] border-4 border-[#121212] shadow-[4px_4px_0px_0px_#121212] px-3 py-2 z-30 -rotate-3">
            <div className="text-[10px] font-black uppercase text-[#F0C020] leading-tight tracking-widest">
              作者基准 {data.authorRate}%
            </div>
            <div className="text-sm font-black uppercase text-white leading-tight mt-0.5 whitespace-nowrap">
              {data.beatAuthor ? "超过作者 👏" : data.tieAuthor ? "与作者持平 🤝" : "再接再厉！"}
            </div>
          </div>
        )}
      </div>

      {/* 5. 右侧面板：难度与段位排版 */}
      <div className="absolute top-14 right-8 z-20 w-[190px]">
        {/* 红蓝拼接的机能感 Header */}
        <div className="bg-[#D02020] border-4 border-[#121212] border-b-0 px-3 py-1.5">
          <div className="text-[10px] font-bold text-white uppercase tracking-widest">
            {data.difficultyLabel} 模式
          </div>
        </div>
        <div className="bg-white border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] p-4 flex flex-col items-end text-right">
          <div className="text-4xl mb-1">{data.rankEmoji}</div>
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest w-full border-b-2 border-[#121212] pb-1 mb-1">
            段位
          </span>
          <span className="text-xl font-black uppercase leading-tight mt-1">
            {data.rankTitle}
          </span>
        </div>
      </div>

      {/* 6. 底部功能带 (Color Blocking): 黄色与蓝色碰撞 */}
      <div className="absolute bottom-0 left-0 right-0 h-12 flex border-t-4 border-[#121212] z-40">
        <div className="flex-1 border-r-4 border-[#121212] bg-[#F0C020] flex items-center px-4">
          <span className="font-bold text-sm uppercase tracking-widest text-[#121212]">
            玩家 · {data.nickname}
          </span>
        </div>
        <div className="px-5 flex items-center bg-[#1040C0]">
          <span className="font-bold text-sm tracking-widest uppercase text-white">
            vibebench.app/guess
          </span>
        </div>
      </div>
    </div>
  );
}