import type { Metadata } from "next";
import StaticPageLayout from "@/components/StaticPageLayout";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Terms of Service — VibeBench",
  description: "VibeBench 的服务条款占位页。",
};

export default function TermsPage() {
  return (
    <StaticPageLayout
      eyebrow="Legal"
      title="服务条款"
      description="当前版本以简要说明为主，用于明确平台用途、投稿责任和基础使用边界。"
      updatedAt={siteConfig.updatedAt}
    >
      <h2>平台性质</h2>
      <p>
        VibeBench 是一个公开展示与横向观察平台，不保证对所有模型、作品或挑战题做持续收录，也不保证任何页面长期可用。
      </p>

      <h2>投稿与授权</h2>
      <p>
        你提交赛题、素材、截图、提示词或说明内容时，应当确认自己拥有足够的发布权限。
        非原创内容请附带来源与授权说明；缺失授权信息的内容可能被拒绝收录或下线。
      </p>

      <h2>可接受使用</h2>
      <p>
        不要通过平台提交违法、侵权、恶意攻击或故意误导他人的内容。对于影响站点安全、版权边界或社区秩序的内容，
        维护者保留删除、隐藏或拒绝展示的权利。
      </p>

      <h2>联系</h2>
      <p>
        如果你需要纠错、下架或授权沟通，请发送邮件到{" "}
        <a href={siteConfig.contactEmailHref}>{siteConfig.contactEmail}</a>。
      </p>
    </StaticPageLayout>
  );
}
