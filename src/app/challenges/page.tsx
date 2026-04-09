import { Suspense } from "react";
import Link from "next/link";
import { query } from "@/lib/db";
import Blob from "@/components/Blob";
import ChallengeFilterGrid, { type ChallengeRow } from "@/components/ChallengeFilterGrid";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "赛题列表 — VibeBench",
  description: "浏览所有已发布的 AI Vibe Coding 赛题",
};

async function getChallenges() {
  try {
    return await query<ChallengeRow>(`
      SELECT c.id, c.title, c.description, c.cover_image, c.published_at, c.metadata,
        (SELECT COUNT(*) FROM submissions s
         JOIN challenge_phases cp ON cp.id = s.challenge_phase_id
         WHERE cp.challenge_id = c.id AND s.is_published = true
        ) as submission_count
      FROM challenges c
      WHERE c.is_published = true
      ORDER BY c.sort_order, c.published_at DESC NULLS LAST
    `);
  } catch {
    return [];
  }
}

export default async function ChallengesPage() {
  const challenges = await getChallenges();

  return (
    <div className="relative">
      <section className="relative section pt-24">
        {/* Background wash that extends behind navbar to eliminate the dividing line */}
        <div
          className="absolute inset-0 -top-24 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 80% 30%, rgba(93,112,82,0.10) 0%, transparent 70%)",
          }}
        />
        <Blob
          color="bg-primary"
          size="w-72 h-72"
          className="-top-10 -right-10"
          shapeIndex={2}
        />
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-12"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
          <div className="mb-16">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              赛题列表
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              每道赛题围绕一个前端挑战，收集不同模型的作品进行展示对比
            </p>
          </div>

          <Suspense fallback={null}>
            <ChallengeFilterGrid challenges={challenges} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
