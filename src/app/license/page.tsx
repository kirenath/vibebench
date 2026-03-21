import type { Metadata } from "next";
import StaticPageLayout from "@/components/StaticPageLayout";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "License — VibeBench",
  description: "VibeBench 的许可方向与版权边界说明。",
};

export default function LicensePage() {
  return (
    <StaticPageLayout
      eyebrow="Legal"
      title="许可与版权"
      description="这里先说明许可方向和内容边界。正式仓库许可证发布后，应以仓库根目录的许可证文件为准。"
      updatedAt={siteConfig.updatedAt}
    >
      <h2>代码许可方向</h2>
      <p>
        平台代码倾向采用宽松许可证发布，例如 MIT，以降低二次开发和研究复用的门槛。
        在正式许可证文件落地之前，本页只表达方向，不构成最终授权文本。
      </p>

      <h2>内容与展示素材</h2>
      <p>
        赛题原文、截图、品牌素材、第三方模型名称及其衍生展示内容，可能分别归属于各自的权利人。
        对这些内容的转载和再分发，请以原始授权说明为准。
      </p>

      <h2>评测结果与编辑内容</h2>
      <p>
        如果后续公开评测说明、对比文案或结构化数据，计划优先采用类似 CC BY 4.0 的署名型开放许可。
        具体范围会在正式发布时进一步拆分说明。
      </p>

      <h2>补充说明</h2>
      <p>
        如需确认某项素材是否可再使用，请先联系{" "}
        <a href={siteConfig.contactEmailHref}>{siteConfig.contactEmail}</a>。
      </p>
    </StaticPageLayout>
  );
}
