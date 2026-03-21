import type { Metadata } from "next";
import StaticPageLayout from "@/components/StaticPageLayout";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "FAQ — VibeBench",
  description: "了解 VibeBench 的展示边界、作品来源与投稿方式。",
};

export default function FaqPage() {
  return (
    <StaticPageLayout
      eyebrow="FAQ"
      title="常见问题"
      description="先解释展示规则，再解释边界。这里聚焦你第一次使用 VibeBench 时最容易遇到的几个问题。"
      updatedAt={siteConfig.updatedAt}
    >
      <h2>VibeBench 是跑分榜吗？</h2>
      <p>
        不是。VibeBench 更接近公开展览和横向展示，不强调单一分数，也不试图把不同模型压缩成一个绝对排名。
        你会看到相同挑战题下不同模型的作品、阶段产物和说明，而不是一张统一排行榜。
      </p>

      <h2>页面里的比较依据是什么？</h2>
      <p>
        当前站点主要提供并排观察能力：你可以看结构、视觉语言、实现方式、提示词上下文，以及是否存在人工修订。
        如果后续引入评分机制，也会优先把评价维度和局限性写清楚。
      </p>

      <h2>AI 作品会被人工修改吗？</h2>
      <p>
        允许存在人工修订，但原则是必须显式标注。VibeBench 不把“纯生成”与“修订后生成”混在一起对外叙述，
        以免误导访客对模型原始能力的判断。
      </p>

      <h2>如何提交赛题或请求接入模型？</h2>
      <p>
        赛题建议通过{" "}
        <a href={siteConfig.submitChallengeUrl} target="_blank" rel="noopener noreferrer">
          GitHub PR
        </a>{" "}
        提交，请求接入模型则走{" "}
        <a href={siteConfig.requestModelsUrl} target="_blank" rel="noopener noreferrer">
          GitHub Discussions
        </a>
        。如果你更习惯在社区里讨论，也可以前往{" "}
        <a href={siteConfig.communityUrl} target="_blank" rel="noopener noreferrer">
          Linux.do
        </a>{" "}
        或直接发邮件到{" "}
        <a href={siteConfig.contactEmailHref}>{siteConfig.contactEmail}</a>。
      </p>

      <h2>开放 API 现在能用吗？</h2>
      <p>
        公开 API 文档已经开始整理，但稳定版协议还没有正式承诺。当前页面先提供一个{" "}
        <a href={siteConfig.apiDocsUrl}>API / Developer Docs</a> 占位页，用来说明未来的公开方向和约束。
      </p>
    </StaticPageLayout>
  );
}
