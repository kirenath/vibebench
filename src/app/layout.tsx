import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VibeBench — AI Vibe Coding 横评平台',
  description: '同一道前端题，让不同 AI 来做，看看谁 vibe 得最好。浏览、切换 phase、并排对比不同 AI 模型的前端作品。',
  openGraph: {
    title: 'VibeBench — AI Vibe Coding 横评平台',
    description: '同一道前端题，让不同 AI 来做，看看谁 vibe 得最好。',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
      </body>
    </html>
  );
}
