import type { Metadata } from "next";
import StaticPageLayout from "@/components/StaticPageLayout";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "FAQ — VibeBench",
  description: "关于 VibeBench 的展示规则、内容边界与参与方式的常见疑问。",
};

export default function FaqPage() {
  return (
    <StaticPageLayout
      eyebrow="FAQ"
      title="常见问题"
      description="关于 VibeBench 的展示规则、内容边界与参与方式的常见疑问。"
      updatedAt="2026 年 3 月 22 日"
    >
      <h2>VibeBench 是跑分榜吗？</h2>
      <p>
        不是。VibeBench 更接近公开展览和横向展示，不强调单一分数，也不试图把不同模型压缩成一个绝对排名。
        你会看到相同挑战题下不同模型的作品、阶段产物和说明，而不是一张统一排行榜。
      </p>

      <h2>页面里的比较依据是什么？</h2>
      <p>
        当前站点主要提供并排观察能力：你可以看结构、视觉语言、实现方式、提示词上下文，以及是否存在人工修订。
        如果未来引入评分机制，也会优先把评价维度和局限性写清楚。
      </p>

      <h2>AI 作品会被人工修改吗？</h2>
      <p>
        允许存在人工修订，但原则是必须显式标注。
        VibeBench 不把&quot;纯生成&quot;与&quot;修订后生成&quot;混在一起对外叙述，以免误导访客对模型原始能力的判断。
      </p>

      <h2>如何参与贡献？</h2>
      <ul>
        <li>
          <strong>提交赛题或评测成果</strong>：通过{" "}
          <a href="https://github.com/kirenath/vibebench/issues" target="_blank" rel="noopener noreferrer">
            GitHub Issues
          </a>{" "}
          提交。
        </li>
        <li>
          <strong>提议赛题方向或请求接入模型</strong>：前往{" "}
          <a href="https://github.com/kirenath/vibebench/discussions" target="_blank" rel="noopener noreferrer">
            GitHub Discussions
          </a>{" "}
          发起讨论。
        </li>
        <li>
          <strong>社区交流</strong>：在{" "}
          <a href="https://linux.do" target="_blank" rel="noopener noreferrer">
            Linux.do
          </a>{" "}
          参与讨论，也可以{" "}
          <a href="https://linux.do/u/wolke_wolke" target="_blank" rel="noopener noreferrer">
            私信联系
          </a>。
        </li>
        <li>
          <strong>直接联系</strong>：发送邮件至{" "}
          <a href={siteConfig.contactEmailHref}>{siteConfig.contactEmail}</a>。
        </li>
      </ul>
    </StaticPageLayout>
  );
}
