import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
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
    <html lang="en" className={`${plusJakartaSans.variable}`}>
      <body className="min-h-screen flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
        <Navbar />
        <main className="flex-1 shrink-0">{children}</main>
      </body>
    </html>
  );
}
