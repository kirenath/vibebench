import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeBench — AI Vibe Coding 横评平台",
  description: "同一道前端题，让不同 AI 来做，看看谁 vibe 得最好。浏览、对比、分享 AI 生成的前端作品。",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        <nav className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-sand-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <a href="/" className="flex items-center gap-2.5 group">
                <span className="text-2xl">🎨</span>
                <span className="font-heading text-xl font-bold text-bark-dark group-hover:text-leaf-dark transition-colors">
                  VibeBench
                </span>
              </a>
              <div className="flex items-center gap-1">
                <a href="/" className="px-3 py-2 text-sm font-medium text-muted hover:text-bark-dark hover:bg-cream-dark rounded-lg transition-all">
                  首页
                </a>
                <a href="/models" className="px-3 py-2 text-sm font-medium text-muted hover:text-bark-dark hover:bg-cream-dark rounded-lg transition-all">
                  模型目录
                </a>
                <a href="/compare" className="px-3 py-2 text-sm font-medium text-muted hover:text-bark-dark hover:bg-cream-dark rounded-lg transition-all">
                  对比
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-sand-light bg-cream-dark/50 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted">
                <span className="text-lg">🎨</span>
                <span className="font-heading font-semibold text-bark">VibeBench</span>
                <span>— AI Vibe Coding 横评平台</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-stone">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-bark transition-colors">GitHub</a>
                <span>·</span>
                <a href="/admin/login" className="hover:text-bark transition-colors">管理后台</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
