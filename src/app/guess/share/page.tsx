import type { Metadata } from "next";
import Link from "next/link";
import { Brain } from "lucide-react";
import { verifyResult } from "@/lib/guessShare";
import { winRateOf, DIFFICULTY_LABELS } from "@/lib/guessRank";
import { APP_URL } from "@/lib/constants";
import ShareCard from "@/components/guess/ShareCard";

interface PageProps {
  searchParams: Promise<{ r?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { r } = await searchParams;
  const result = r ? verifyResult(r) : null;

  if (!result) {
    return {
      title: "看作品猜模型 · VibeBench",
      description: "看一个 AI 作品，猜它出自哪个模型。来挑战你的眼力！",
    };
  }

  const winRate = winRateOf(result.c, result.t);
  const diff = DIFFICULTY_LABELS[result.d] ?? result.d;
  const title = `${result.n} 在猜模型拿到了 ${winRate}% · VibeBench`;
  const description = `${diff}难度 · ${result.c}/${result.t} 正确。你也来试试，能认出几个模型？`;
  const ogUrl = `${APP_URL}/api/guess/og?r=${encodeURIComponent(r!)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default async function GuessSharePage({ searchParams }: PageProps) {
  const { r } = await searchParams;
  const result = r ? verifyResult(r) : null;

  return (
    <div className="relative section pt-24 pb-24">
      <div
        className="absolute inset-0 -top-24 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 30%, var(--hero-primary-soft) 0%, transparent 70%)",
        }}
      />
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="font-heading text-3xl font-bold flex items-center justify-center gap-2 mb-8">
          <Brain className="h-7 w-7 text-primary" />
          看作品猜模型
        </h1>

        {result ? (
          <div className="flex justify-center mb-8">
            <div className="rounded-2xl overflow-hidden border border-border/50 shadow-lg">
              <ShareCard
                styleId={result.s}
                nickname={result.n || "匿名玩家"}
                difficulty={result.d}
                correct={result.c}
                total={result.t}
                authorRate={result.a}
              />
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground mb-8">
            分享内容已失效或无效，但你依然可以开始自己的挑战！
          </p>
        )}

        <Link href="/guess" className="btn-primary px-8 py-3 text-lg !rounded-full">
          我也来试试 →
        </Link>
      </div>
    </div>
  );
}
