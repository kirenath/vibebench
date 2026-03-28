import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div>
      <h2
        className="mb-8 text-2xl font-semibold text-deep-loam"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        管理面板
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <a
          href="/admin/challenges"
          className="group grain-overlay rounded-[2rem] border border-timber/50 bg-card p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
        >
          <h3
            className="text-xl font-semibold text-deep-loam transition-colors group-hover:text-moss"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            赛题管理
          </h3>
          <p className="mt-2 text-sm text-dried-grass">
            创建、编辑、发布赛题和阶段配置
          </p>
        </a>
        <a
          href="/admin/models"
          className="group grain-overlay rounded-[2rem] border border-timber/50 bg-card p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
        >
          <h3
            className="text-xl font-semibold text-deep-loam transition-colors group-hover:text-moss"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            模型管理
          </h3>
          <p className="mt-2 text-sm text-dried-grass">
            管理厂商、产品线、模型版本和渠道
          </p>
        </a>
        <a
          href="/admin/submissions"
          className="group grain-overlay rounded-[2rem] border border-timber/50 bg-card p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
        >
          <h3
            className="text-xl font-semibold text-deep-loam transition-colors group-hover:text-moss"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            作品管理
          </h3>
          <p className="mt-2 text-sm text-dried-grass">
            上传、管理和发布 AI 作品及附件
          </p>
        </a>
      </div>
    </div>
  );
}
