import type { Metadata } from "next";
import StaticPageLayout from "@/components/StaticPageLayout";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Changelog — VibeBench",
  description: "查看 VibeBench 的公开更新记录与近期迭代方向。",
};

export default function ChangelogPage() {
  return (
    <StaticPageLayout
      eyebrow="Changelog"
      title="更新日志"
      description="这里记录对外可见的信息架构变化、文档补充和平台方向调整。"
      updatedAt={siteConfig.updatedAt}
    >
      <h2>2026 年 3 月 21 日</h2>
      <ul>
        <li>重构 Footer，从重复路由导航切换为品牌、共建、资源和合规信息架构。</li>
        <li>新增 FAQ、API Docs、Terms、Privacy、License 等公开占位页，减少死链。</li>
        <li>补充开源生态、社区入口与站点运行状态表达，使 footer 更接近平台名片。</li>
      </ul>

      <h2>更早变更（日期待补录）</h2>
      <ul>
        <li>完成首页、赛题页、模型页、对比页和管理员后台的 MVP 应用骨架。</li>
        <li>落地 REST API、HTML 沙箱预览和 Organic / Natural 设计系统。</li>
        <li>建立 PostgreSQL 初始 Schema，支撑挑战题、模型、作品和附件等核心对象。</li>
      </ul>

      <h2>接下来</h2>
      <ul>
        <li>继续整理开放 API 的读接口边界、字段稳定性和节流策略。</li>
        <li>补全更细的变更日期和版本标签，让 Changelog 可直接对外引用。</li>
      </ul>
    </StaticPageLayout>
  );
}
