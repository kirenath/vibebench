import Link from "next/link";
import { notFound } from "next/navigation";
import { query, queryOne } from "@/lib/db";
import Blob from "@/components/Blob";
import {
  ArrowLeft,
  Clock,
  RefreshCw,
  AlertTriangle,
  FileText,
  ExternalLink,
} from "lucide-react";

interface ChallengeRow {
  id: string;
  title: string;
  description: string | null;
  rules_markdown: string | null;
  prompt_markdown: string | null;
  cover_image: string | null;
}

interface PhaseRow {
  id: string;
  phase_key: string;
  phase_label: string;
  is_default: boolean;
}

interface SubmissionRow {
  submission_id: string;
  model_variant_id: string;
  model_variant_name: string;
  vendor_name: string;
  channel_id: string;
  channel_name: string;
  manual_touched: boolean;
  manual_notes: string | null;
  duration_ms: string | null;
  iteration_count: number | null;
  updated_at: string;
  has_html: boolean;
  has_prd: boolean;
}

async function getChallenge(id: string) {
  try {
    return await queryOne<ChallengeRow>(
      "SELECT id, title, description, rules_markdown, prompt_markdown, cover_image FROM challenges WHERE id = $1 AND is_published = true",
      [id]
    );
  } catch {
    return null;
  }
}

async function getPhases(challengeId: string) {
  try {
    return await query<PhaseRow>(
      "SELECT id, phase_key, phase_label, is_default FROM challenge_phases WHERE challenge_id = $1 ORDER BY sort_order",
      [challengeId]
    );
  } catch {
    return [];
  }
}

async function getSubmissions(phaseId: string) {
  try {
    return await query<SubmissionRow>(
      `SELECT submission_id, model_variant_id, model_variant_name, vendor_name,
              channel_id, channel_name, manual_touched, manual_notes,
              duration_ms, iteration_count, updated_at, has_html, has_prd
       FROM submission_overview
       WHERE challenge_phase_id = $1 AND submission_is_published = true
       ORDER BY vendor_name, model_variant_name`,
      [phaseId]
    );
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const challenge = await getChallenge(id);
  if (!challenge) return { title: "赛题未找到 — VibeBench" };
  return {
    title: `${challenge.title} — VibeBench`,
    description: challenge.description || `VibeBench 赛题：${challenge.title}`,
  };
}

export default async function ChallengeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ phase?: string }>;
}) {
  const { id } = await params;
  const { phase: phaseParam } = await searchParams;

  const challenge = await getChallenge(id);
  if (!challenge) notFound();

  const phases = await getPhases(id);
  const activePhase =
    phases.find((p) => p.phase_key === phaseParam) ||
    phases.find((p) => p.is_default) ||
    phases[0];

  const submissions = activePhase
    ? await getSubmissions(activePhase.id)
    : [];

  return (
    <div className="relative overflow-hidden">
      <Blob
        color="bg-secondary"
        size="w-80 h-80"
        className="-top-20 -right-20"
        shapeIndex={3}
      />

      <section className="section pt-24">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/challenges"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            返回赛题列表
          </Link>

          <div className="mb-12">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              {challenge.title}
            </h1>
            {challenge.description && (
              <p className="text-lg text-muted-foreground max-w-3xl">
                {challenge.description}
              </p>
            )}
          </div>

          {/* Rules & Prompt accordion */}
          {(challenge.rules_markdown || challenge.prompt_markdown) && (
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {challenge.rules_markdown && (
                <details className="card p-6 group">
                  <summary className="cursor-pointer font-heading font-semibold text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    规则说明
                    <span className="ml-auto text-muted-foreground group-open:rotate-180 transition-transform duration-300">
                      ▼
                    </span>
                  </summary>
                  <div className="mt-4 prose prose-sm max-w-none text-foreground/80 whitespace-pre-wrap">
                    {challenge.rules_markdown}
                  </div>
                </details>
              )}
              {challenge.prompt_markdown && (
                <details className="card p-6 group">
                  <summary className="cursor-pointer font-heading font-semibold text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-secondary" />
                    Prompt
                    <span className="ml-auto text-muted-foreground group-open:rotate-180 transition-transform duration-300">
                      ▼
                    </span>
                  </summary>
                  <div className="mt-4 prose prose-sm max-w-none text-foreground/80 whitespace-pre-wrap">
                    {challenge.prompt_markdown}
                  </div>
                </details>
              )}
            </div>
          )}

          {/* Phase tabs */}
          {phases.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {phases.map((p) => (
                <Link
                  key={p.id}
                  href={`/challenges/${id}?phase=${p.phase_key}`}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                    activePhase?.id === p.id
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {p.phase_label}
                </Link>
              ))}
            </div>
          )}

          {/* Submissions grid */}
          {submissions.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-muted-foreground">
                当前 phase 暂无已发布作品
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {submissions.map((s) => (
                <div
                  key={s.submission_id}
                  className="card p-6 card-hover group relative"
                >
                  {s.manual_touched && (
                    <div className="absolute top-4 right-4">
                      <span
                        className="badge-destructive flex items-center gap-1"
                        title={s.manual_notes || "人工修订"}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        人工修订
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="font-heading font-bold text-lg">
                      {s.model_variant_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {s.vendor_name} · {s.channel_name}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                    {s.duration_ms && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {(parseInt(s.duration_ms) / 1000).toFixed(1)}s
                      </span>
                    )}
                    {s.iteration_count != null && (
                      <span className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        {s.iteration_count} 次迭代
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-auto">
                    {s.has_html && (
                      <Link
                        href={`/s/${s.submission_id}/index.html`}
                        target="_blank"
                        className="btn-primary btn-sm !h-9 !px-4 text-xs"
                      >
                        查看效果
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Link>
                    )}
                    {s.has_prd && (
                      <Link
                        href={`/api/submissions/${s.submission_id}/artifacts/prd`}
                        target="_blank"
                        className="btn-ghost btn-sm !h-9 !px-4 text-xs"
                      >
                        PRD
                      </Link>
                    )}
                    {!s.has_html && (
                      <span className="text-xs text-muted-foreground">
                        暂无可对比作品
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
