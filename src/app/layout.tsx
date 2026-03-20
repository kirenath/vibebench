import type { Metadata } from "next";
import { Fraunces, Nunito } from "next/font/google";
import { SiteHeader } from "@/components/blocks/SiteHeader";
import "./globals.css";

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"]
});

const bodyFont = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: "VibeBench",
  description: "Organic / Natural display shell for VibeBench."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="appBody">
        <div className="globalAura" aria-hidden>
          <span className="auraOne" />
          <span className="auraTwo" />
          <span className="auraThree" />
        </div>
        <div className="appShell">
          <SiteHeader />
          <main className="appMain">{children}</main>
        </div>
      </body>
    </html>
  );
}
