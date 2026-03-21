import type { Metadata } from "next";
import StaticPageLayout from "@/components/StaticPageLayout";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "License — VibeBench",
  description: "VibeBench 平台代码与内容的许可协议及版权归属说明。",
};

export default function LicensePage() {
  return (
    <StaticPageLayout
      eyebrow="Legal"
      title="许可与版权"
      description="VibeBench 平台代码与内容的许可协议及版权归属说明。"
      updatedAt="2026 年 3 月 22 日"
    >
      <h2>平台代码</h2>
      <p>
        VibeBench 平台代码以 <strong>AGPL-3.0</strong> 许可证开源。完整许可证文本以仓库根目录的{" "}
        <a href="https://github.com/kirenath/vibebench/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">
          LICENSE
        </a>{" "}
        文件为准。
      </p>

      <h2>维护者内容</h2>
      <p>
        由维护者发布的赛题提示词、HTML 评测成果及相关说明文档，同样适用 <strong>AGPL-3.0</strong> 许可证。
      </p>

      <h2>第三方贡献内容</h2>
      <p>
        由社区贡献者提交的提示词、评测成果及附属素材，<strong>版权归原作者所有</strong>，不纳入平台开源范围。未经原作者授权，不得转载或再分发。
      </p>

      <h2>品牌与第三方素材</h2>
      <p>
        品牌标识、第三方模型名称及其衍生展示内容，分别归属于各自的权利人。对这些内容的使用，请以原始授权说明为准。
      </p>

      <h2>联系</h2>
      <p>
        如需确认某项内容的许可状态或使用授权，请联系{" "}
        <a href={siteConfig.contactEmailHref}>{siteConfig.contactEmail}</a>。
      </p>
    </StaticPageLayout>
  );
}
