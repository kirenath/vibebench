import { query } from "@/lib/db";
import type { Challenge, ChallengePhase, SubmissionOverview } from "@/types";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface ChallengeDetail extends Challenge {
  phases: ChallengePhase[];
}

async function getChallenge(id: string): Promise<ChallengeDetail | null> {
  try {
    const [challengeResult, phasesResult] = await Promise.all([
      query<Challenge>(
        "SELECT * FROM public.challenges WHERE id = $1 AND is_published = true",
        [id]
      ),
      query<ChallengePhase>(
        "SELECT * FROM public.challenge_phases WHERE challenge_id = $1 ORDER BY sort_order, phase_label",
        [id]
      ),
    ]);

    if (challengeResult.rows.length === 0) return null;

    return {
      ...challengeResult.rows[0],
      phases: phasesResult.rows,
    };
  } catch {
    return null;
  }
}

async function getSubmissions(
  phaseId: string
): Promise<SubmissionOverview[]> {
  try {
    const result = await query<SubmissionOverview>(
      `SELECT * FROM public.submission_overview
       WHERE challenge_phase_id = $1
         AND submission_is_published = true
       ORDER BY vendor_name, model_variant_name, channel_name`,
      [phaseId]
    );
    return result.rows;
  } catch {
    return [];
  }
}

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const challenge = await getChallenge(id);

  if (!challenge) notFound();

  const defaultPhase = challenge.phases.find((p) => p.is_default) || challenge.phases[0];
  const submissions = defaultPhase ? await getSubmissions(defaultPhase.id) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* ── Challenge Header ── */}
      <div className="mb-10">
        <a href="/challenges" className="inline-flex items-center gap-1 text-sm font-medium text-moss transition-colors hover:text-deep-loam">
          &larr; 返回赛题列表
        </a>
        <h1
          className="mt-4 text-4xl font-bold text-deep-loam md:text-5xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {challenge.title}
        </h1>
        {challenge.description && (
          <p className="mt-4 text-lg text-dried-grass">{challenge.description}</p>
        )}
      </div>

      {/* ── Rules & Prompt ── */}
      <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {challenge.rules_markdown && (
          <div className="grain-overlay rounded-[2rem] border border-timber/50 bg-card p-6 shadow-soft">
            <h2
              className="mb-4 text-xl font-semibold text-deep-loam"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              规则说明
            </h2>
            <div className="max-w-none whitespace-pre-wrap text-sm text-dried-grass leading-relaxed">
              {challenge.rules_markdown}
            </div>
          </div>
        )}
        {challenge.prompt_markdown && (
          <div className="grain-overlay rounded-[2rem] border border-timber/50 bg-card p-6 shadow-soft">
            <h2
              className="mb-4 text-xl font-semibold text-deep-loam"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Prompt
            </h2>
            <div className="max-w-none whitespace-pre-wrap text-sm text-dried-grass leading-relaxed">
              {challenge.prompt_markdown}
            </div>
          </div>
        )}
      </div>

      {/* ── Phase Tabs ── */}
      {challenge.phases.length > 0 && (
        <div className="mb-8 flex gap-2 overflow-x-auto rounded-full border border-timber/30 bg-white/50 p-1.5 backdrop-blur-sm">
          {challenge.phases.map((phase) => (
            <button
              key={phase.id}
              className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                phase.id === defaultPhase?.id
                  ? "bg-moss text-pale-mist shadow-soft"
                  : "text-dried-grass hover:bg-stone/50 hover:text-deep-loam"
              }`}
              data-phase-id={phase.id}
            >
              {phase.phase_label}
            </button>
          ))}
        </div>
      )}

      {/* ── Submissions Header ── */}
      <div className="mb-6 flex items-center justify-between">
        <h2
          className="text-2xl font-semibold text-deep-loam"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          参赛作品
          <span className="ml-2 text-base font-normal text-dried-grass">
            ({submissions.length})
          </span>
        </h2>
        {submissions.length >= 2 && (
          <a
            href={`/compare?challenge=${id}`}
            className="rounded-full bg-moss px-6 py-2.5 text-sm font-semibold text-pale-mist shadow-soft transition-all duration-300 hover:scale-105 hover:shadow-[0_6px_24px_-4px_rgba(93,112,82,0.25)] active:scale-95"
          >
            进入横评对比
          </a>
        )}
      </div>

      {/* ── Submissions Grid ── */}
      {submissions.length === 0 ? (
        <div className="grain-overlay rounded-[2rem] border border-timber/50 bg-card p-16 text-center shadow-soft">
          <p className="text-dried-grass">该阶段暂无已发布作品</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {submissions.map((sub) => (
            <div
              key={sub.submission_id}
              className="grain-overlay rounded-[2rem] border border-timber/50 bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3
                    className="font-semibold text-deep-loam"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {sub.model_variant_name}
                  </h3>
                  <p className="text-sm text-dried-grass">{sub.vendor_name}</p>
                </div>
                {sub.manual_touched && (
                  <span className="rounded-full bg-terracotta/10 px-3 py-1 text-xs font-medium text-terracotta">
                    人工修订
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-dried-grass">
                <span className="rounded-full bg-stone/60 px-3 py-1">
                  {sub.channel_name}
                </span>
                {sub.duration_ms != null && (
                  <span className="rounded-full bg-stone/60 px-3 py-1">
                    {(sub.duration_ms / 1000).toFixed(1)}s
                  </span>
                )}
                {sub.iteration_count != null && (
                  <span className="rounded-full bg-stone/60 px-3 py-1">
                    {sub.iteration_count} 次迭代
                  </span>
                )}
              </div>

              {sub.manual_touched && sub.manual_notes && (
                <p className="mt-3 text-xs text-dried-grass/70 italic">
                  {sub.manual_notes}
                </p>
              )}

              {sub.has_html && (
                <div className="mt-4">
                  <button className="w-full rounded-full bg-moss/10 px-4 py-2 text-sm font-medium text-moss transition-all duration-300 hover:bg-moss/20 active:scale-95">
                    预览 HTML
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
