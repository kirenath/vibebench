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
      updatedAt="2026 年 3 月 23 日"
    >
      <h2>我们收集的数据</h2>
      <p>
        VibeBench 不收集、不存储访客的个人身份信息。站点不使用分析工具、广告追踪或第三方统计服务。
      </p>

      <h2>匿名投票与浏览器指纹</h2>
      <p>
        在盲评投票功能中，我们使用浏览器指纹技术（基于开源的 FingerprintJS）生成一个匿名的设备标识符，
        用于防止同一设备重复投票。该标识符：
      </p>
      <ul>
        <li>不包含任何个人身份信息（姓名、邮箱等）</li>
        <li>无法被反向追踪到具体个人</li>
        <li>仅用于投票去重，不用于其他用途</li>
        <li>不与任何第三方共享</li>
      </ul>

      <h2>联系</h2>
      <p>
        若你对隐私处理方式有疑问，请联系{" "}
        <a href={siteConfig.contactEmailHref}>{siteConfig.contactEmail}</a>。
      </p>
    </StaticPageLayout>
  );
}
