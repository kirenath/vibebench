import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VibeBench Admin",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-10 flex items-center justify-between">
        <h1
          className="text-3xl font-bold text-deep-loam"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Admin 后台
        </h1>
        <div className="flex gap-4 text-sm font-medium">
          <a href="/admin/challenges" className="text-dried-grass transition-colors hover:text-moss">
            赛题管理
          </a>
          <a href="/admin/models" className="text-dried-grass transition-colors hover:text-moss">
            模型管理
          </a>
          <a href="/admin/submissions" className="text-dried-grass transition-colors hover:text-moss">
            作品管理
          </a>
          <a href="/" className="rounded-full border border-timber/50 px-4 py-1.5 text-xs font-semibold text-dried-grass transition-all hover:border-moss hover:text-moss">
            返回前台
          </a>
        </div>
      </div>
      {children}
    </div>
  );
}
