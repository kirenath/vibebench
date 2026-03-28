import { query } from "@/lib/db";
import type { Challenge, ChallengePhase } from "@/types";

interface ChallengeWithStats extends Challenge {
  phase_count: number;
  submission_count: number;
}

export const dynamic = "force-dynamic";

async function getChallenges(): Promise<ChallengeWithStats[]> {
  try {
    const result = await query<ChallengeWithStats>(`
      SELECT
        c.*,
        COUNT(DISTINCT cp.id)::int AS phase_count,
        COUNT(DISTINCT s.id) FILTER (WHERE s.is_published)::int AS submission_count
      FROM public.challenges c
      LEFT JOIN public.challenge_phases cp ON cp.challenge_id = c.id
      LEFT JOIN public.submissions s ON s.challenge_phase_id = cp.id AND s.is_published
      WHERE c.is_published = true
      GROUP BY c.id
      ORDER BY c.sort_order, c.created_at DESC
    `);
    return result.rows;
  } catch {
    return [];
  }
}

export default async function ChallengesPage() {
  const challenges = await getChallenges();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1
        className="mb-12 text-4xl font-bold text-deep-loam md:text-5xl"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        赛题列表
      </h1>

      {challenges.length === 0 ? (
        <div className="grain-overlay rounded-[2rem] border border-timber/50 bg-card p-16 text-center shadow-soft">
          <p className="text-dried-grass">暂无已发布赛题</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {challenges.map((challenge, idx) => {
            const radiiPatterns = [
              "rounded-tl-[4rem] rounded-br-[3rem] rounded-tr-[2rem] rounded-bl-[2rem]",
              "rounded-tr-[4rem] rounded-bl-[3rem] rounded-tl-[2rem] rounded-br-[2rem]",
              "rounded-bl-[4rem] rounded-tr-[3rem] rounded-br-[2rem] rounded-tl-[2rem]",
              "rounded-br-[4rem] rounded-tl-[3rem] rounded-bl-[2rem] rounded-tr-[2rem]",
              "rounded-tl-[5rem] rounded-br-[2rem] rounded-tr-[2rem] rounded-bl-[2rem]",
              "rounded-br-[5rem] rounded-tl-[2rem] rounded-bl-[2rem] rounded-tr-[2rem]",
            ];
            const organicRadius = radiiPatterns[idx % radiiPatterns.length];

            return (
              <a
                key={challenge.id}
                href={`/challenges/${challenge.id}`}
                className={`group grain-overlay flex flex-col overflow-hidden border border-timber/50 bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${organicRadius}`}
              >
                {challenge.cover_image && (
                  <div className="aspect-video w-full overflow-hidden bg-stone/50">
                    <img
                      src={challenge.cover_image}
                      alt={challenge.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h2
                    className="text-lg font-semibold text-deep-loam transition-colors group-hover:text-moss"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {challenge.title}
                  </h2>
                  {challenge.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-dried-grass">
                      {challenge.description}
                    </p>
                  )}
                  <div className="mt-auto flex items-center gap-4 pt-4 text-xs font-medium text-dried-grass/70">
                    <span>{challenge.phase_count} 个阶段</span>
                    <span>{challenge.submission_count} 个作品</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
