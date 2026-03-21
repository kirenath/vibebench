import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function getChallenge(id: string) {
  const res = await fetch(`${BASE_URL}/api/challenges/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function getPhases(id: string) {
  const res = await fetch(`${BASE_URL}/api/challenges/${id}/phases`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

async function getSubmissions(challengeId: string, phaseId?: string) {
  const url = new URL(`${BASE_URL}/api/submissions`);
  url.searchParams.set("challenge", challengeId);
  if (phaseId) url.searchParams.set("phase", phaseId);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

interface Phase {
  id: string;
  phase_key: string;
  phase_label: string;
  is_default: boolean;
}

interface Submission {
  submission_id: string;
  model_variant_id: string;
  model_variant_name: string;
  vendor_name: string;
  channel_name: string;
  channel_id: string;
  manual_touched: boolean;
  manual_notes: string | null;
  duration_ms: number | null;
  iteration_count: number | null;
  has_html: boolean;
  has_prd: boolean;
  updated_at: string;
}

export default async function ChallengeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ phase?: string }>;
}) {
  const { id } = await params;
  const { phase: selectedPhaseKey } = await searchParams;

  const [challenge, phases] = await Promise.all([
    getChallenge(id),
    getPhases(id),
  ]);

  if (!challenge) notFound();

  const activePhase = phases.find((p: Phase) => p.phase_key === selectedPhaseKey)
    || phases.find((p: Phase) => p.is_default)
    || phases[0];

  const submissions = activePhase ? await getSubmissions(id, activePhase.id) : [];

  const rulesHtml = challenge.rules_markdown ? marked(challenge.rules_markdown) : "";
  const promptHtml = challenge.prompt_markdown ? marked(challenge.prompt_markdown) : "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted mb-6">
        <Link href="/" className="hover:text-bark transition-colors">首页</Link>
        <span className="mx-2">/</span>
        <span className="text-bark-dark">{challenge.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-bark-dark mb-3">{challenge.title}</h1>
        {challenge.description && (
          <p className="text-lg text-muted leading-relaxed">{challenge.description}</p>
        )}
      </div>

      {/* Rules & Prompt Accordion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">
        {rulesHtml && (
          <details className="card p-5 group" open>
            <summary className="flex items-center gap-2 cursor-pointer font-heading font-semibold text-bark-dark select-none">
              <svg className="w-4 h-4 text-leaf transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              规则说明
            </summary>
            <div className="prose mt-4" dangerouslySetInnerHTML={{ __html: rulesHtml }} />
          </details>
        )}
        {promptHtml && (
          <details className="card p-5 group">
            <summary className="flex items-center gap-2 cursor-pointer font-heading font-semibold text-bark-dark select-none">
              <svg className="w-4 h-4 text-leaf transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              Prompt
            </summary>
            <div className="prose mt-4" dangerouslySetInnerHTML={{ __html: promptHtml }} />
          </details>
        )}
      </div>

      {/* Phase Tabs */}
      {phases.length > 0 && (
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {phases.map((phase: Phase) => (
            <Link
              key={phase.id}
              href={`/challenges/${id}?phase=${phase.phase_key}`}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activePhase?.id === phase.id
                  ? "bg-leaf text-white shadow-sm"
                  : "bg-cream-dark text-muted hover:bg-sand-light hover:text-bark"
              }`}
            >
              {phase.phase_label}
            </Link>
          ))}
        </div>
      )}

      {/* Submissions Grid */}
      {submissions.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🌿</div>
          <h3 className="text-xl font-heading font-semibold text-bark mb-2">暂无参赛作品</h3>
          <p className="text-muted">当前 phase 暂未收到作品，敬请期待</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {submissions.map((sub: Submission) => (
            <Link key={sub.submission_id} href={`/submissions/${sub.submission_id}`} className="group">
              <div className="card card-hover p-5 cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-heading font-semibold text-bark-dark group-hover:text-leaf-dark transition-colors">
                      {sub.model_variant_name}
                    </h3>
                    <p className="text-xs text-stone mt-0.5">{sub.vendor_name}</p>
                  </div>
                  <span className="badge badge-neutral text-xs">{sub.channel_name}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {sub.manual_touched && (
                    <span className="badge badge-warning">⚠ 人工修订</span>
                  )}
                  {sub.has_html && (
                    <span className="badge badge-success">HTML</span>
                  )}
                  {sub.has_prd && (
                    <span className="badge badge-neutral">PRD</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-stone">
                  {sub.duration_ms && (
                    <span>⏱ {(sub.duration_ms / 1000).toFixed(1)}s</span>
                  )}
                  {sub.iteration_count != null && (
                    <span>🔄 {sub.iteration_count} 次</span>
                  )}
                  <span className="ml-auto">{new Date(sub.updated_at).toLocaleDateString("zh-CN")}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Compare CTA */}
      {submissions.filter((s: Submission) => s.has_html).length >= 2 && (
        <div className="mt-10 text-center">
          <Link
            href={`/compare?challenge=${id}${activePhase ? `&phase=${activePhase.phase_key}` : ""}`}
            className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            对比作品
          </Link>
        </div>
      )}
    </div>
  );
}
