import type { Metadata } from "next";
import { Fraunces, Kalnia, Nunito, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${fraunces.variable} ${displayFont.variable} ${nunito.variable} ${notoSansSC.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
