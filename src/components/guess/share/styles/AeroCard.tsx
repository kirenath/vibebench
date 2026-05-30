"use client";

import { CARD_WIDTH, CARD_HEIGHT, type ShareStyleProps } from "../types";

/**
 * 玻璃 Aero (Frutiger Aero) share-card style
 *
 * 设计理念:
 * 还原 Vista/Y2K 时期的清透玻璃质感与立体水滴元素，背景采用柔和的青蓝天空渐变，
 * 主面板使用大面积半透明并附加明显的顶部强高光切分（经典光泽遮罩），
 * 文字通过 drop-shadow 白色发光来确保在复杂光影下清晰可读且晶莹剔透。
 */
export default function AeroCard({ data }: ShareStyleProps) {
  return (
    <div
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      className="relative overflow-hidden bg-gradient-to-br from-cyan-100 via-sky-300 to-blue-500 font-sans"
    >
      {/* 1. 背景柔和光斑 (模拟天空环境光与镜头眩光) */}
      <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[90%] bg-white/70 rounded-full blur-[80px]" />
      <div className="absolute bottom-[-30%] right-[-10%] w-[60%] h-[80%] bg-cyan-300/50 rounded-full blur-[70px]" />

      {/* 2. 背景层气泡 (位于玻璃卡片下方，增加景深) */}
      {/* 后置大号气泡 (左下) */}
      <div className="absolute bottom-4 left-6 w-32 h-32 rounded-full bg-gradient-to-br from-white/40 to-blue-300/20 border border-white/60 shadow-[inset_0_-8px_16px_rgba(0,100,255,0.15),inset_0_8px_16px_rgba(255,255,255,0.9),0_8px_20px_rgba(0,50,150,0.15)] backdrop-blur-[4px]">
        {/* 高光 */}
        <div className="absolute top-3 left-5 w-14 h-5 bg-white/90 rounded-[100%] rotate-[-40deg] blur-[1px]"></div>
        {/* 反光 */}
        <div className="absolute bottom-3 right-5 w-10 h-3 bg-cyan-100/60 rounded-[100%] rotate-[-40deg] blur-[2px]"></div>
      </div>
      {/* 后置小号气泡 (左上偏中心) */}
      <div className="absolute top-6 left-32 w-8 h-8 rounded-full bg-gradient-to-br from-white/50 to-transparent border border-white/70 shadow-[inset_0_2px_4px_rgba(255,255,255,1),0_4px_8px_rgba(0,50,150,0.1)] backdrop-blur-[2px]">
        <div className="absolute top-1 left-1.5 w-3 h-1 bg-white/90 rounded-[100%] rotate-[-40deg] blur-[0.5px]"></div>
      </div>

      {/* 3. 主体悬浮玻璃卡片 (带有强烈的折射和高光带) */}
      <div className="absolute inset-x-12 inset-y-7 flex flex-col p-6 rounded-[2rem] bg-gradient-to-b from-white/40 to-white/10 border-[1.5px] border-white/70 shadow-[0_16px_40px_rgba(0,80,180,0.2),inset_0_2px_20px_rgba(255,255,255,0.9),inset_0_-2px_10px_rgba(255,255,255,0.3)] backdrop-blur-md overflow-hidden z-10">
        
        {/* 经典 Aero 水平切分反光遮罩层 */}
        <div className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/60 to-transparent pointer-events-none rounded-t-[2rem]"></div>
        
        {/* 玻璃卡片内部内容层 */}
        <div className="relative z-20 flex flex-col justify-between h-full">
          
          {/* Header 区域 */}
          <div className="flex items-center justify-between text-blue-900/90 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
            <div className="flex items-center gap-2 font-bold text-[13px] tracking-wide">
              {/* 品牌 Logo (小水滴样式) */}
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-300 to-cyan-500 shadow-[inset_0_2px_3px_rgba(255,255,255,1)] border border-white/60 relative overflow-hidden">
                <div className="absolute top-0.5 left-0.5 w-1.5 h-1 bg-white/90 rounded-[100%] rotate-[-40deg] blur-[0.5px]"></div>
              </div>
              VibeBench
            </div>
            <div className="px-3 py-1 bg-white/50 rounded-full border border-white/70 shadow-[inset_0_1px_4px_rgba(255,255,255,1)] text-[11px] font-bold tracking-wide text-blue-800">
              看作品猜模型
            </div>
          </div>

          {/* Body 战绩主视觉 */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* 巨大且充满光泽的胜率数字 */}
            <div className="text-[76px] font-black leading-none bg-clip-text text-transparent bg-gradient-to-b from-[#01579B] to-[#0288D1] drop-shadow-[0_2px_6px_rgba(255,255,255,1)]">
              {data.winRate}<span className="text-4xl font-extrabold">%</span>
            </div>
            
            {/* 数据指标药丸按钮 */}
            <div className="mt-2.5 flex items-center gap-2.5 text-blue-900 text-[13px] font-bold bg-white/60 px-5 py-2 rounded-full border border-white/80 shadow-[inset_0_2px_6px_rgba(255,255,255,1),0_2px_6px_rgba(0,100,200,0.08)]">
              <span className="text-[#0277BD]">{data.correct} / {data.total} 正确</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-inner"></span>
              <span className="text-blue-800">{data.difficultyLabel}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-inner"></span>
              <span className="flex items-center gap-1.5">
                <span className="drop-shadow-sm">{data.rankEmoji}</span> 
                <span className="text-blue-800">{data.rankTitle}</span>
              </span>
            </div>

            {/* 可选：作者比对药丸（果冻质感） */}
            {data.authorRate !== undefined && (
              <div className={`mt-3 px-5 py-1.5 rounded-full border border-white/90 shadow-[inset_0_2px_8px_rgba(255,255,255,1),0_2px_6px_rgba(0,0,0,0.06)] text-xs font-bold flex items-center gap-2 ${
                data.beatAuthor 
                  ? 'bg-gradient-to-r from-emerald-50/80 to-emerald-200/80 text-emerald-800' 
                  : data.tieAuthor
                  ? 'bg-gradient-to-r from-blue-50/80 to-blue-200/80 text-blue-800'
                  : 'bg-gradient-to-r from-amber-50/80 to-amber-200/80 text-amber-900'
              }`}>
                <span>作者基准 {data.authorRate}%</span>
                <span className="w-1 h-1 rounded-full bg-current opacity-40"></span>
                <span>{data.beatAuthor ? "超过作者 👏" : data.tieAuthor ? "与作者持平 🤝" : "逼近作者，再战！"}</span>
              </div>
            )}
          </div>

          {/* Footer 区域 */}
          <div className="flex justify-between items-end text-[13px] font-bold text-blue-900/90 drop-shadow-[0_1px_1px_rgba(255,255,255,1)]">
            <div className="flex items-center gap-2.5 mb-0.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-b from-white to-blue-100 border border-white/90 shadow-[0_2px_4px_rgba(0,100,200,0.1),inset_0_2px_4px_rgba(255,255,255,1)] flex items-center justify-center text-sm">
                👤
              </div>
              <span>玩家 · {data.nickname}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/50 px-4 py-1.5 rounded-full border border-white/80 shadow-[inset_0_1px_4px_rgba(255,255,255,1),0_2px_4px_rgba(0,100,200,0.1)]">
              <span className="text-blue-900">vibebench.app/guess</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
