import type { Metadata } from "next";
import StaticPageLayout from "@/components/StaticPageLayout";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "API / Developer Docs — VibeBench",
  description: "VibeBench 开放 API 与开发者文档的公开占位页。",
};

export default function ApiDocsPage() {
  return (
    <StaticPageLayout
      eyebrow="Beta"
      title="API / Developer Docs"
      description="公开 API 仍在整理中。当前页面先说明设计方向、开放原则和大致的资源边界。"
      updatedAt={siteConfig.updatedAt}
    >
      <h2>当前状态</h2>
      <p>
        VibeBench 已经在站内使用 REST 风格的资源接口，但对外公开时仍需要补齐稳定性承诺、鉴权边界、
        字段冻结策略和速率限制。因此现在先以 Beta 占位页形式公开说明，而不是直接承诺完整接口契约。
      </p>

      <h2>计划开放的读接口</h2>
      <ul>
        <li>
          <code>/api/challenges</code> 与 <code>/api/challenges/[id]</code>
        </li>
        <li>
          <code>/api/model-families</code>、<code>/api/model-variants</code> 和{" "}
          <code>/api/vendors</code>
        </li>
        <li>
          <code>/api/submissions</code> 及作品附件相关只读查询
        </li>
      </ul>

      <h2>开放原则</h2>
      <ul>
        <li>优先提供公开展示页已经可见的数据，不额外暴露后台管理字段。</li>
        <li>版本变更会先写入 Changelog，再考虑字段级兼容策略。</li>
        <li>正式开放前，外部集成请先以页面抓取或仓库协作为主，不建议依赖未承诺的内部接口。</li>
      </ul>

      <h2>反馈入口</h2>
      <p>
        如果你有明确的集成需求，可以去{" "}
        <a href={siteConfig.requestModelsUrl} target="_blank" rel="noopener noreferrer">
          GitHub Discussions
        </a>{" "}
        说明场景，或直接在{" "}
        <a href={siteConfig.repoUrl} target="_blank" rel="noopener noreferrer">
          仓库
        </a>{" "}
        中发起 issue / PR。
      </p>
    </StaticPageLayout>
  );
}
