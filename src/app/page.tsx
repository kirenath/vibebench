import Link from "next/link";
import { query } from "@/lib/db";
import Blob from "@/components/Blob";
import {
  Trophy,
  Cpu,
  FileCode2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

async function getStats() {
  try {
    const [challenges] = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM challenges WHERE is_published = true"
    );
    const [models] = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM model_variants"
    );
    const [submissions] = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM submissions WHERE is_published = true"
    );
    return {
      challenges: parseInt(challenges?.count || "0"),
      models: parseInt(models?.count || "0"),
      submissions: parseInt(submissions?.count || "0"),
    };
  } catch {
    return { challenges: 0, models: 0, submissions: 0 };
  }
}

interface ChallengeRow {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  published_at: string | null;
  submission_count: string;
}

async function getChallenges() {
  try {
    return await query<ChallengeRow>(`
      SELECT c.id, c.title, c.description, c.cover_image, c.published_at,
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

export default async function HomePage() {
  const [stats, challenges] = await Promise.all([getStats(), getChallenges()]);

  return (
    <div>
      {/* Hero */}
      <section className="relative section pt-12 md:pt-16 pb-20">
        {/* Background wash that extends behind navbar to eliminate the dividing line */}
        <div
          className="absolute inset-0 -top-24 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 20% 50%, rgba(93,112,82,0.10) 0%, transparent 70%), radial-gradient(ellipse 60% 60% at 85% 30%, rgba(193,140,93,0.08) 0%, transparent 70%)",
          }}
        />
        <Blob
          color="bg-primary"
          size="w-96 h-96"
          className="-top-20 -left-20 animate-float-slow"
          shapeIndex={0}
        />
        <Blob
          color="bg-secondary"
          size="w-80 h-80"
          className="top-10 -right-10 animate-float-slower"
          shapeIndex={1}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 badge-primary mb-6 text-sm">
            <Sparkles className="h-4 w-4" />
            AI Vibe Coding 横向展示平台
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-6xl md:text-8xl font-bold text-foreground leading-tight text-balance mb-3">
            Same Challenge,
            <br />
            <span className="text-primary">Different Vibes</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground/60 mb-10">同一道题，你 pick 谁的 vibe？</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/challenges" className="btn-primary btn-lg">
              浏览赛题
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/compare" className="btn-secondary btn-lg">
              开始对比
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
            <div className="card p-8 text-center group card-hover">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary transition-colors duration-300">
                <Trophy className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <div className="font-heading text-4xl font-bold text-foreground group-hover:scale-110 transition-transform duration-300">
                {stats.challenges}
              </div>
              <div className="text-sm text-muted-foreground mt-1">已发布赛题</div>
            </div>
            <div className="card p-8 text-center group card-hover">
              <div className="h-14 w-14 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary transition-colors duration-300">
                <Cpu className="h-7 w-7 text-secondary group-hover:text-secondary-foreground transition-colors duration-300" />
              </div>
              <div className="font-heading text-4xl font-bold text-foreground group-hover:scale-110 transition-transform duration-300">
                {stats.models}
              </div>
              <div className="text-sm text-muted-foreground mt-1">模型版本</div>
            </div>
            <div className="card p-8 text-center group card-hover col-span-2 md:col-span-1">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary transition-colors duration-300">
                <FileCode2 className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <div className="font-heading text-4xl font-bold text-foreground group-hover:scale-110 transition-transform duration-300">
                {stats.submissions}
              </div>
              <div className="text-sm text-muted-foreground mt-1">已发布作品</div>
            </div>
          </div>
        </div>
      </section>

      {/* Challenge cards */}
      <section className="section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              赛题列表
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
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
                      <FileCode2 className="h-16 w-16 text-primary/40" />
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
