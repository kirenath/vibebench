import type { Metadata } from "next";
import StaticPageLayout from "@/components/StaticPageLayout";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy — VibeBench",
  description: "VibeBench 的隐私政策占位页。",
};

export default function PrivacyPage() {
  return (
    <StaticPageLayout
      eyebrow="Legal"
      title="隐私政策"
      description="当前版本只覆盖基础的站点运行需求，后续若引入登录、统计或社区能力，会继续补充。"
      updatedAt={siteConfig.updatedAt}
    >
      <h2>我们处理哪些数据</h2>
      <p>
        公开访客访问站点时，服务器可能记录基础访问日志、错误日志和性能诊断信息。
        管理后台会额外使用认证相关的 Cookie 或令牌，用于维持登录状态和访问控制。
      </p>

      <h2>我们为什么处理这些数据</h2>
      <p>
        这些信息主要用于保障站点可用性、识别异常流量、保护管理员入口，以及排查作品渲染或接口请求错误。
      </p>

      <h2>我们不会主动做什么</h2>
      <p>
        当前公开站点不以广告投放或跨站追踪为目标，也不会因为普通浏览行为出售个人信息。
        如果未来接入新的统计或登录提供方，会先更新本页再上线。
      </p>

      <h2>联系</h2>
      <p>
        若你对隐私处理方式有疑问，请联系{" "}
        <a href={siteConfig.contactEmailHref}>{siteConfig.contactEmail}</a>。
      </p>
    </StaticPageLayout>
  );
}
