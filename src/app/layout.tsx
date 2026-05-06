import type { Metadata } from "next";
import { Fraunces, Kalnia, Nunito, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import LayoutShell from "@/components/LayoutShell";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const displayFont = Kalnia({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-cjk",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "VibeBench — AI Vibe Coding 横向展示平台",
  description:
    "同一道前端题，不同 AI 各展风格。浏览、对比、分享不同模型的前端作品。",
};

/**
 * Anti-FOUC: synchronously resolve the active theme and apply the `dark`
 * class to <html> *before* any stylesheet paints. Touching localStorage and
 * matchMedia inline avoids a flash on hard reload. Kept tiny and standalone
 * — must NOT depend on any module/runtime.
 */
const themeBootScript = `(function(){try{var k='vibebench:theme';var p=localStorage.getItem(k);var s=window.matchMedia('(prefers-color-scheme: dark)').matches;var d=p==='dark'||((!p||p==='system')&&s);var c=document.documentElement.classList;if(d)c.add('dark');else c.remove('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${fraunces.variable} ${displayFont.variable} ${nunito.variable} ${notoSansSC.variable}`}
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <script
          dangerouslySetInnerHTML={{ __html: themeBootScript }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
