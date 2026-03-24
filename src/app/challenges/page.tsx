import Link from "next/link";
import { query } from "@/lib/db";
import Blob from "@/components/Blob";
import ChallengeIcon from "@/components/ChallengeIcon";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "赛题列表 — VibeBench",
  description: "浏览所有已发布的 AI Vibe Coding 赛题",
};

interface ChallengeRow {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  published_at: string | null;
  submission_count: string;
  metadata: Record<string, string> | null;
}

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
          <div className="mb-16">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              赛题列表
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              每道赛题围绕一个前端挑战，收集不同模型的作品进行展示对比
            </p>
          </div>

          {challenges.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-muted-foreground">暂无已发布赛题</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {challenges.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/challenges/${c.id}`}
                  className="card card-hover p-0 overflow-hidden group"
                  style={{
                    borderRadius: [
                      "2rem 2rem 1rem 2rem",
                      "1rem 2rem 2rem 1rem",
                      "2rem 1rem 2rem 2rem",
                    ][i % 3],
                  }}
                >
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    {c.cover_image ? (
                      <img
                        src={c.cover_image}
                        alt={c.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <ChallengeIcon iconName={(c.metadata as Record<string, string> | null)?.icon} className="h-16 w-16 text-primary/40" />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-heading text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {c.title}
                    </h3>
                    {c.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {c.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="badge-primary">
                        {c.submission_count} 个作品
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
