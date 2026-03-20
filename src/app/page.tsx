import db from "@/lib/db";
import ChallengeCard from "@/components/ChallengeCard";
import StatsCards from "@/components/StatsCards";
import type { Challenge } from "@/types";

export const dynamic = "force-dynamic";

async function getStats() {
  const [c, m, s] = await Promise.all([
    db.query(`SELECT count(*) as count FROM challenges WHERE is_published = true`),
    db.query(
      `SELECT count(DISTINCT mv.id) as count FROM model_variants mv
       JOIN submissions s ON s.model_variant_id = mv.id AND s.is_published = true`
    ),
    db.query(`SELECT count(*) as count FROM submissions WHERE is_published = true`),
  ]);
  return {
    published_challenges: parseInt(c.rows[0].count),
    active_model_variants: parseInt(m.rows[0].count),
    published_submissions: parseInt(s.rows[0].count),
  };
}

async function getChallenges() {
  const { rows } = await db.query(
    `SELECT c.*, (
       SELECT count(*) FROM submissions s
       JOIN challenge_phases cp ON cp.id = s.challenge_phase_id
       WHERE cp.challenge_id = c.id AND s.is_published = true
     ) as submission_count
     FROM challenges c
     WHERE c.is_published = true
     ORDER BY c.sort_order, c.title`
  );
  return rows;
}

export default async function HomePage() {
  const [stats, challenges] = await Promise.all([getStats(), getChallenges()]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
          VibeBench
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Same challenge, different AI models. See who vibes the best.
        </p>
      </section>

      <section className="mb-16">
        <StatsCards stats={stats} />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Challenges</h2>
        {challenges.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No challenges published yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge: Challenge & { submission_count: string }) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                submissionCount={parseInt(challenge.submission_count)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
