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
      updatedAt="2026 年 3 月 24 日"
    >
      <h2>2026 年 3 月 23 日</h2>
      <ul>
        <li>静态资源存储迁移至 Cloudflare R2，实现 CDN 全球加速。</li>
        <li>新增源代码预览功能（SourceCodePreviewModal），支持 HTML 语法高亮。</li>
        <li>盲评投票增加结果反馈界面与浏览器指纹防重投机制。</li>
        <li>后台管理：增加 Phase 与成果编辑能力、优化上传与提交流程。</li>
        <li>修复多项 Bug（PRD 逻辑、UTF-8 编码、导航栏布局、SVG 图标等）。</li>
      </ul>

      <h2>2026 年 3 月 22 日</h2>
      <ul>
        <li>新增 License 页面，补全合规信息。</li>
        <li>Footer 导航优化、下拉选框改进。</li>
      </ul>

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
