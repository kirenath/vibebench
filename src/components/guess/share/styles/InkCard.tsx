"use client";

import { CARD_WIDTH, CARD_HEIGHT, type ShareStyleProps } from "../types";

/**
 * 水墨 Ink-wash (国风) share-card style
 * 
 * 设计理念：气韵生动，意在笔先。
 * 布局：大量留白，不对称构图，左侧竖排古典排版，右侧狂草主视觉。
 * 视觉：宣纸白底（#F8F5F0），CSS 渐变模拟焦淡清墨的晕染效果，搭配朱红印章。
 */
export default function InkCard({ data }: ShareStyleProps) {
  // 提取昵称首字母/首字作为印章文字
  const sealText = data.nickname ? data.nickname.substring(0, 1).toUpperCase() : "印";

  // 根据胜负状态生成古风文案
  const getAuthorComparisonText = () => {
    if (data.beatAuthor) return "青出于蓝";
    if (data.tieAuthor) return "平分秋色";
    return "尚需精进";
  };

  return (
    <div
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: "#F8F5F0", // 宣纸白
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* 视觉元素：水墨晕染背景 (虚实相生) */}
      {/* 右上角：淡墨/清墨晕染（远山/云雾感） */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: "350px",
          height: "350px",
          background: "radial-gradient(circle, #999999 0%, transparent 60%)",
          filter: "blur(40px)",
          opacity: 0.15,
        }}
      />
      {/* 左下角：浓墨/淡墨沉淀 */}
      <div
        style={{
          position: "absolute",
          bottom: "-30%",
          left: "10%",
          width: "400px",
          height: "300px",
          background: "radial-gradient(ellipse, #666666 0%, transparent 70%)",
          filter: "blur(50px)",
          opacity: 0.1,
        }}
      />
      {/* 宣纸微肌理叠加 (使用线性渐变产生微弱的明暗变化) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(120deg, rgba(255,255,255,0.4) 0%, rgba(250,240,230,0) 100%)",
          mixBlendMode: "overlay",
        }}
      />

      {/* ========== 左侧：横排排版区 (古典意境，左起书写) ========== */}
      <div
        style={{
          position: "absolute",
          left: "8%",
          top: "14%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "0.75rem",
        }}
      >
        {/* 段位称号 (行草：飘逸韵律) */}
        <div
          style={{
            fontFamily: "'Zhi Mang Xing', cursive",
            fontSize: "2.75rem",
            lineHeight: 1,
            color: "#333333", // 浓墨
            letterSpacing: "0.15em",
            textShadow: "2px 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          {data.rankTitle}
        </div>

        {/* 难度标识 (楷书：工整清秀) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontFamily: "'ZCOOL XiaoWei', serif",
            fontSize: "1.125rem",
            color: "#666666", // 淡墨
            letterSpacing: "0.1em",
          }}
        >
          <span>{data.rankEmoji}</span>
          <span>{data.difficultyLabel}之境</span>
        </div>

        {/* 原作者对比 (楷书，干笔虚线分隔) */}
        {data.authorRate !== undefined && (
          <div
            style={{
              fontFamily: "'ZCOOL XiaoWei', serif",
              fontSize: "0.875rem",
              color: "#999999", // 清墨
              marginTop: "0.5rem",
              borderLeft: "1px dashed rgba(102, 102, 102, 0.3)", // 干笔效果
              paddingLeft: "0.625rem",
              lineHeight: "1.6",
            }}
          >
            原标 {data.authorRate}%<br />
            {getAuthorComparisonText()}
          </div>
        )}
      </div>

      {/* ========== 左下角：落款与印章 (身份标识) ========== */}
      <div
        style={{
          position: "absolute",
          left: "8%",
          bottom: "10%",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        {/* 玩家昵称落款 (行书：流畅端正) */}
        <span
          style={{
            fontFamily: "'Ma Shan Zheng', cursive",
            fontSize: "1.25rem",
            color: "#333333", // 浓墨
          }}
        >
          {data.nickname} 题
        </span>
        {/* 朱红方形印章 (篆刻/方正体) */}
        <div
          style={{
            width: "22px",
            height: "22px",
            backgroundColor: "#C41E3A", // 朱红印章色
            color: "#FFFFF0", // 象牙白
            fontFamily: "'ZCOOL KuaiLe', cursive",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "2px", // 模拟微弱的印章磨损边缘
            border: "1px solid rgba(196, 30, 58, 0.8)",
            boxShadow: "1px 1px 2px rgba(196, 30, 58, 0.2)",
            opacity: 0.95,
          }}
        >
          {sealText}
        </div>
      </div>

      {/* ========== 右侧：主视觉数据区 (视觉震撼) ========== */}
      <div
        style={{
          position: "absolute",
          right: "10%",
          top: "22%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
        }}
      >
        {/* 胜率大字 (草书：奔放潇洒，焦墨) */}
        <div
          style={{
            fontFamily: "'Liu Jian Mao Cao', cursive",
            fontSize: "6.5rem", // text-[104px] 级别
            lineHeight: "0.85",
            color: "#1a1a1a", // 焦墨
            textShadow: "4px 4px 10px rgba(26,26,26,0.1)", // 模拟墨迹厚度
            position: "relative",
          }}
        >
          {data.winRate}
          <span
            style={{
              fontFamily: "'Noto Serif SC', serif", // 符号使用衬线
              fontSize: "2.5rem",
              fontWeight: 300,
              marginLeft: "0.2rem",
              color: "#333333",
            }}
          >
            %
          </span>
        </div>

        {/* 正确数统计 (楷书：克制易读) */}
        <div
          style={{
            fontFamily: "'ZCOOL XiaoWei', serif",
            fontSize: "1.25rem",
            color: "#666666", // 淡墨
            marginTop: "0.75rem",
            letterSpacing: "0.1em",
          }}
        >
          答对 {data.correct} <span style={{ color: "#999999", margin: "0 0.2rem" }}>/</span> 共 {data.total}
        </div>
      </div>

      {/* ========== 右下角：品牌与CTA (现代与古典融合) ========== */}
      <div
        style={{
          position: "absolute",
          right: "8%",
          bottom: "8%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          fontFamily: "'Noto Serif SC', serif",
          color: "#999999", // 清墨
          fontSize: "0.75rem",
          letterSpacing: "0.05em",
        }}
      >
        <span style={{ color: "#333333", fontWeight: 700, fontSize: "0.875rem" }}>
          VibeBench
        </span>
        <span style={{ marginTop: "2px", fontFamily: "'ZCOOL XiaoWei', serif" }}>
          看作品 · 猜模型
        </span>
        <span
          style={{
            marginTop: "6px",
            fontFamily: "sans-serif", // URL需要纯粹的现代感保证可读
            fontSize: "0.7rem",
            opacity: 0.7,
          }}
        >
          vibebench.app/guess
        </span>
      </div>
    </div>
  );
}