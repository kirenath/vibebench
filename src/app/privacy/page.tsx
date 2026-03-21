import type { Metadata } from "next";
import StaticPageLayout from "@/components/StaticPageLayout";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy — VibeBench",
  description: "VibeBench 的用户数据处理原则与隐私保护说明。",
};

export default function PrivacyPage() {
  return (
    <StaticPageLayout
      eyebrow="Legal"
      title="隐私政策"
      description="VibeBench 的用户数据处理原则与隐私保护说明。"
      updatedAt="2026 年 3 月 22 日"
    >
      <h2>我们不收集用户数据</h2>
      <p>
        VibeBench 不收集、不存储任何访客的个人信息。站点不使用分析工具、广告追踪或第三方统计服务。
      </p>

      <h2>我们不会主动做什么</h2>
      <p>
        当前公开站点不以广告投放或跨站追踪为目标，也不会因为普通浏览行为出售个人信息。
        未来可能引入登录或匿名投票等功能，但仍将遵循最小化原则，不收集与功能无关的信息。届时会先更新本页再上线。
      </p>

      <h2>联系</h2>
      <p>
        若你对隐私处理方式有疑问，请联系{" "}
        <a href={siteConfig.contactEmailHref}>{siteConfig.contactEmail}</a>。
      </p>
    </StaticPageLayout>
  );
}
