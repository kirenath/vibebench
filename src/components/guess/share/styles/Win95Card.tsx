"use client";

import { CARD_WIDTH, CARD_HEIGHT, type ShareStyleProps } from "../types";

/**
 * 核心设计系统：复古 3D 边框样式
 * 通过高光（白色/浅灰）与阴影（黑色/深灰）的对比，模拟 90 年代 GUI 的物理凸起与凹陷质感
 */
const outsetBorder = {
  backgroundColor: "#c0c0c0",
  borderTop: "1px solid #ffffff",
  borderLeft: "1px solid #ffffff",
  borderBottom: "1px solid #000000",
  borderRight: "1px solid #000000",
  boxShadow: "inset 1px 1px #dfdfdf, inset -1px -1px #808080",
};

const insetBorderWhite = {
  backgroundColor: "#ffffff",
  borderTop: "1px solid #808080",
  borderLeft: "1px solid #808080",
  borderBottom: "1px solid #ffffff",
  borderRight: "1px solid #ffffff",
  boxShadow: "inset 1px 1px #000000, inset -1px -1px #dfdfdf",
};

const insetBorderGrey = {
  backgroundColor: "#c0c0c0",
  borderTop: "1px solid #808080",
  borderLeft: "1px solid #808080",
  borderBottom: "1px solid #ffffff",
  borderRight: "1px solid #ffffff",
  boxShadow: "inset 1px 1px #000000, inset -1px -1px #dfdfdf",
};

export default function Win95Card({ data }: ShareStyleProps) {
  return (
    <div
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        fontFamily: "'MS Sans Serif', 'Microsoft Sans Serif', Tahoma, Arial, sans-serif",
      }}
      className="relative bg-[#008080] text-black select-none overflow-hidden"
    >
      {/* 桌面快捷方式图标 (纯 SVG 绘制，确保无跨域问题) */}
      <div className="absolute top-4 left-4 flex flex-col items-center w-16">
        <svg width="32" height="32" viewBox="0 0 32 32" shapeRendering="crispEdges">
          <rect x="2" y="4" width="28" height="20" fill="#c0c0c0" stroke="#000" strokeWidth="2" />
          <rect x="6" y="8" width="20" height="12" fill="#000080" />
          <rect x="12" y="24" width="8" height="4" fill="#c0c0c0" stroke="#000" strokeWidth="2" />
          <rect x="8" y="28" width="16" height="2" fill="#000" />
        </svg>
        <span className="text-white mt-1 text-[11px] leading-tight text-center drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">
          VibeBench
        </span>
      </div>

      {/* 主运行窗口 */}
      <div
        className="absolute top-2 left-24 w-[420px] flex flex-col"
        style={outsetBorder}
      >
        {/* 标题栏 */}
        <div className="h-5 bg-[#000080] text-white flex justify-between items-center px-1 m-[2px]">
          <span className="font-bold text-[11px] tracking-wide ml-1">
            VibeBench_Results.exe
          </span>
          <div
            style={outsetBorder}
            className="h-[14px] w-[14px] flex items-center justify-center text-black font-bold text-[9px] leading-none cursor-default"
          >
            X
          </div>
        </div>

        {/* 窗口内容区 */}
        <div className="px-3 py-2 text-xs flex flex-col gap-1.5">
          <div className="flex items-start gap-4">
            {/* 像素风性能图表图标 */}
            <div className="w-8 h-8 shrink-0 mt-1">
              <svg width="32" height="32" viewBox="0 0 32 32" shapeRendering="crispEdges">
                <rect x="0" y="0" width="32" height="32" fill="#fff" stroke="#000" strokeWidth="2" />
                <rect x="0" y="0" width="32" height="6" fill="#000080" />
                <rect x="4" y="20" width="6" height="8" fill="#ff0000" stroke="#000" />
                <rect x="13" y="14" width="6" height="14" fill="#ffff00" stroke="#000" />
                <rect x="22" y="8" width="6" height="20" fill="#00ff00" stroke="#000" />
                <rect x="2" y="28" width="28" height="2" fill="#000" />
              </svg>
            </div>

            <div className="flex flex-col w-full gap-1.5">
              <div>
                用户 <span className="font-bold">{data.nickname}</span> 任务完成
              </div>

              {/* 怀旧分段式进度条 */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px]">
                  <span>胜率</span>
                  <span>{data.winRate}%</span>
                </div>
                <div style={insetBorderWhite} className="h-4 w-full p-[2px]">
                  <div
                    className="h-full bg-[#000080]"
                    style={{
                      width: `${data.winRate}%`,
                      // 90年代经典的分段式进度条效果
                      backgroundImage: "linear-gradient(to right, #000080 0%, #000080 85%, transparent 85%, transparent 100%)",
                      backgroundSize: "8px 100%",
                    }}
                  />
                </div>
              </div>

              {/* 数据详情面板 */}
              <div style={insetBorderWhite} className="p-2 grid grid-cols-2 gap-y-1 mt-1">
                <div><span className="font-bold text-[#808080]">正确:</span> {data.correct}/{data.total}</div>
                <div><span className="font-bold text-[#808080]">难度:</span> {data.difficultyLabel}</div>
                <div className="col-span-2">
                  <span className="font-bold text-[#808080]">段位:</span> {data.rankEmoji} {data.rankTitle}
                </div>
              </div>
            </div>
          </div>

          {/* 作者成绩比对区域（类似系统提示栏） */}
          {data.authorRate !== undefined && (
            <div style={insetBorderWhite} className="p-2 bg-[#ffffcc] mt-1 border-l-4 border-l-[#000080]">
              <div className="text-[11px] text-[#404040]">目标 (作者基准): {data.authorRate}%</div>
              <div className="font-bold mt-1 text-[#000080]">
                {data.beatAuthor
                  ? ">> 成功: 目标已击败 👏"
                  : data.tieAuthor
                  ? ">> 平局: 参数匹配 🤝"
                  : ">> 失败: 未达到目标"}
              </div>
            </div>
          )}

          {/* 操作按钮区 */}
          <div className="flex justify-end gap-2 mt-1">
            <div style={outsetBorder} className="px-6 py-1 font-bold">确定</div>
          </div>
        </div>
      </div>

      {/* 底部任务栏 */}
      <div className="absolute bottom-0 w-full h-[28px] bg-[#c0c0c0] flex items-center justify-between px-1 border-t border-[#ffffff] shadow-[0_-1px_0_#dfdfdf]">
        <div className="flex gap-2 h-full items-center">
          {/* Start 按钮 */}
          <div style={outsetBorder} className="flex items-center gap-1 px-2 h-[22px] font-bold text-[11px]">
            <div className="grid grid-cols-2 gap-[1px] w-[14px] h-[14px] p-[1px]">
              <div className="bg-[#ff0000]"></div><div className="bg-[#00ff00]"></div>
              <div className="bg-[#0000ff]"></div><div className="bg-[#ffff00]"></div>
            </div>
            Start
          </div>

          {/* 凹陷状态的活动窗口按钮 */}
          <div style={insetBorderGrey} className="h-[22px] w-[120px] flex items-center px-2 text-[11px] font-bold text-gray-800">
            VibeBench_Re...
          </div>
        </div>

        {/* 右侧系统托盘区 */}
        <div style={insetBorderGrey} className="h-[22px] flex items-center px-3 text-[11px] text-[#404040]">
          vibebench.app/guess
        </div>
      </div>
    </div>
  );
}