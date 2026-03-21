import type { Metadata } from "next";
import StaticPageLayout from "@/components/StaticPageLayout";

export const metadata: Metadata = {
  title: "Changelog — VibeBench",
  description: "VibeBench 平台功能迭代、基础设施变更与内容更新的完整时间线。",
};

export default function ChangelogPage() {
  return (
    <StaticPageLayout
      eyebrow="Changelog"
      title="更新日志"
      description="VibeBench 平台功能迭代、基础设施变更与内容更新的完整时间线。"
      updatedAt="2026 年 3 月 22 日"
    >
      <h2>2026 年 3 月 21 日</h2>
      <ul>
        <li>重构 Footer，从重复路由导航切换为品牌、共建、资源和合规信息架构。</li>
        <li>新增 FAQ、API Docs、Terms、Privacy、License 等公开占位页，减少死链。</li>
        <li>补充开源生态、社区入口与站点运行状态表达，使 footer 更接近平台名片。</li>
      </ul>

      <h2>2026 年 3 月 20 日</h2>
      <ul>
        <li>完成首页、赛题页、模型页、对比页和管理员后台的 MVP 应用骨架。</li>
        <li>落地 REST API、HTML 沙箱预览和 Organic / Natural 设计系统。</li>
        <li>建立 PostgreSQL 初始 Schema，支撑挑战题、模型、作品和附件等核心对象。</li>
      </ul>
    </StaticPageLayout>
  );
}
