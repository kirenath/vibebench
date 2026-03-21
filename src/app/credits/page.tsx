import type { Metadata } from "next";
import StaticPageLayout from "@/components/StaticPageLayout";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Credits — VibeBench",
  description: "感谢协助 VibeBench 从想法走向落地的个人、社区和开源项目。",
};

export default function CreditsPage() {
  return (
    <StaticPageLayout
      eyebrow="Credits"
      title="特别鸣谢"
      description="感谢协助 VibeBench 从想法走向落地的个人、社区和开源项目。"
      updatedAt="2026 年 3 月 22 日"
    >
      <h2>开源项目</h2>
      <p>
        VibeBench 的技术基础建立在众多优秀的开源项目之上，包括 Next.js、React、Tailwind CSS、Supabase、Lucide Icons 等。
        完整列表请参阅{" "}
        <a href="/powered-by">技术支持</a> 页。
      </p>

      <h2>社区与反馈</h2>
      <ul>
        <li>
          <a href="https://linux.do" target="_blank" rel="noopener noreferrer">
            <strong>Linux.do 社区</strong>
          </a>{" "}
          — 提供用户反馈与讨论场地
        </li>
        <li>
          所有在{" "}
          <a href="https://github.com/kirenath/vibebench/pulls" target="_blank" rel="noopener noreferrer">
            GitHub PR
          </a>{" "}
          提交PR的贡献者和{" "}
          <a href="https://github.com/kirenath/vibebench/discussions" target="_blank" rel="noopener noreferrer">
            GitHub Discussions
          </a>{" "}
          中参与讨论的用户
        </li>
      </ul>

      <h2>创意与内容</h2>
      <ul>
        <li>赛题的提出者和贡献者</li>
        <li>提供提示词、截图或素材授权的个人</li>
      </ul>

      <h2>联系</h2>
      <p>
        如果你的贡献未被提及，或你希望调整署名方式，请联系{" "}
        <a href={siteConfig.contactEmailHref}>{siteConfig.contactEmail}</a>。
      </p>
    </StaticPageLayout>
  );
}
