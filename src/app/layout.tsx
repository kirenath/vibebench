import type { Metadata } from "next";
import { Fraunces, Nunito } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VibeBench - AI Vibe Coding Horizontal Review",
  description: "A platform to compare frontend coding outputs across different AI models for the same coding challenge.",
  openGraph: {
    title: "VibeBench",
    description: "AI Vibe Coding Horizontal Review Platform",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${nunito.variable}`}>
      <body className="min-h-screen flex flex-col font-sans selection:bg-primary/20 selection:text-primary bg-background text-foreground tracking-tight antialiased relative">
        <div 
          className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-multiply" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />
        <Navbar />
        <main className="flex-1 shrink-0">{children}</main>
      </body>
    </html>
  );
}
