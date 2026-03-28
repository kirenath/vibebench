import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeBench - AI Vibe Coding 横评平台",
  description:
    "同一道前端题，让不同 AI 来做，看看各自 vibe 出了什么。浏览、对比不同 AI 模型的前端作品。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {/* ── Floating Pill Navigation ── */}
        <header className="sticky top-4 z-50 mx-auto max-w-5xl px-4">
          <nav className="flex items-center justify-between rounded-full border border-timber/50 bg-white/70 px-6 py-3 shadow-soft backdrop-blur-md">
            <a
              href="/"
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-moss transition-colors hover:text-deep-loam"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-moss text-sm font-bold text-pale-mist">
                V
              </span>
              VibeBench
            </a>
            <div className="flex items-center gap-6 text-sm font-medium">
              <a href="/challenges" className="text-dried-grass transition-colors hover:text-moss">
                赛题
              </a>
              <a href="/models" className="text-dried-grass transition-colors hover:text-moss">
                模型
              </a>
              <a href="/compare" className="text-dried-grass transition-colors hover:text-moss">
                横评对比
              </a>
              <a
                href="/admin"
                className="rounded-full border border-timber/50 px-4 py-1.5 text-xs font-semibold text-dried-grass transition-all hover:border-moss hover:text-moss"
              >
                Admin
              </a>
            </div>
          </nav>
        </header>

        {/* ── Main Content ── */}
        <main>{children}</main>

        {/* ── Footer ── */}
        <footer className="border-t border-timber/50 py-12 text-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm text-dried-grass" style={{ fontFamily: "var(--font-heading)" }}>
              VibeBench — 不是跑分，是把不同 AI 的手艺摆到一起看
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
