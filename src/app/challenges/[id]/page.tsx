import Link from "next/link";
import { notFound } from "next/navigation";
import { query, queryOne } from "@/lib/db";
import Blob from "@/components/Blob";
import {
  ArrowLeft,
  ClipboardList,
  MessageSquareText,
} from "lucide-react";
import CopyButton from "@/components/CopyButton";
import SubmissionCard, { type PhaseSubmission } from "@/components/SubmissionCard";

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
  phase_key: string;
  phase_label: string;
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

async function getAllSubmissions(challengeId: string) {
  try {
    return await query<SubmissionRow>(
      `SELECT submission_id, phase_key, phase_label,
              model_variant_id, model_variant_name, vendor_name,
              channel_id, channel_name, manual_touched, manual_notes,
              duration_ms, iteration_count, updated_at, has_html, has_prd
       FROM submission_overview
       WHERE challenge_id = $1 AND submission_is_published = true
       ORDER BY vendor_name, model_variant_name, phase_key`,
      [challengeId]
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

/** Group submissions by model_variant_id + channel_id */
interface GroupedModel {
  modelName: string;
  vendorName: string;
  channelName: string;
  phase1: PhaseSubmission | null;
  phase2: PhaseSubmission | null;
}

function groupByModel(submissions: SubmissionRow[]): GroupedModel[] {
  const map = new Map<string, GroupedModel>();

  for (const s of submissions) {
    const key = `${s.model_variant_id}__${s.channel_id}`;
    if (!map.has(key)) {
      map.set(key, {
        modelName: s.model_variant_name,
        vendorName: s.vendor_name,
        channelName: s.channel_name,
        phase1: null,
        phase2: null,
      });
    }
    const group = map.get(key)!;
    const sub: PhaseSubmission = {
      submission_id: s.submission_id,
      duration_ms: s.duration_ms,
      iteration_count: s.iteration_count,
      has_html: s.has_html,
      has_prd: s.has_prd,
      manual_touched: s.manual_touched,
      manual_notes: s.manual_notes,
    };

    if (s.phase_key.startsWith("phase2")) {
      group.phase2 = sub;
    } else {
      group.phase1 = sub;
    }
  }

  return Array.from(map.values());
}

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const challenge = await getChallenge(id);
  if (!challenge) notFound();

  const phases = await getPhases(id);
  const submissions = await getAllSubmissions(id);
  const groupedModels = groupByModel(submissions);

  const rawPrompt = challenge.prompt_markdown || "";
  const phase2Step1 = `以下是一个设计需求：\n"${rawPrompt}"\n请你根据这个需求，撰写一份详细的产品需求文档（PRD），不要写代码，只输出 PRD。`;
  const phase2Step2 = "根据你自己的 PRD 文档，请输出完整的HTML。";

  const hasPhase2 = phases.some((p) => p.phase_key.startsWith("phase2"));

  return (
    <div className="relative">
      <section className="relative section pt-24">
        {/* Background wash */}
        <div
          className="absolute inset-0 -top-24 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 80% 30%, rgba(193,140,93,0.08) 0%, transparent 70%)",
          }}
        />
        <Blob
          color="bg-secondary"
          size="w-80 h-80"
          className="-top-20 -right-20"
          shapeIndex={3}
        />
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
            <div className="grid md:grid-cols-2 gap-6 mb-12 items-start">
              {challenge.rules_markdown && (() => {
                const detailMarker = /##\s*详细解析[：:]?\s*/;
                const parts = challenge.rules_markdown.split(detailMarker);
                const briefRules = parts[0]?.trimEnd() || "";
                const detailedAnalysis = parts.length > 1 ? parts[1]?.trimStart() : null;

                return (
                  <details className="card p-6 group" open>
                    <summary className="cursor-pointer font-heading font-semibold text-lg flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-primary" />
                      规则说明
                      <span className="ml-auto text-muted-foreground group-open:rotate-180 transition-transform duration-300">
                        ▼
                      </span>
                    </summary>
                    <div className="mt-4 prose prose-sm max-w-none text-foreground/80 whitespace-pre-wrap">
                      {briefRules}
                    </div>
                    {detailedAnalysis && (
                      <details className="mt-4 rounded-2xl border border-border/50 bg-muted/30">
                        <summary className="cursor-pointer px-4 py-3 flex items-center gap-2 text-sm font-heading font-semibold text-muted-foreground hover:text-foreground transition-colors">
                          详细解析
                          <span className="ml-auto text-muted-foreground text-xs">▼</span>
                        </summary>
                        <div className="px-4 pb-4 prose prose-sm max-w-none text-foreground/80 whitespace-pre-wrap text-sm">
                          {detailedAnalysis}
                        </div>
                      </details>
                    )}
                  </details>
                );
              })()}
              {challenge.prompt_markdown && (
                <details className="card p-6 group" open>
                  <summary className="cursor-pointer font-heading font-semibold text-lg flex items-center gap-2">
                    <MessageSquareText className="h-5 w-5 text-secondary" />
                    Prompt
                    <span className="ml-auto text-muted-foreground group-open:rotate-180 transition-transform duration-300">
                      ▼
                    </span>
                  </summary>

                  <div className="mt-4 space-y-3">
                    {/* Phase 1 prompt — expanded by default */}
                    <details className="rounded-2xl border border-border/50 bg-muted/30" open>
                      <summary className="cursor-pointer px-4 py-3 flex items-center gap-2 text-sm font-heading font-semibold">
                        Phase 1（初版）提示词
                        <CopyButton text={rawPrompt} />
                        <span className="ml-auto text-muted-foreground text-xs">▼</span>
                      </summary>
                      <div className="px-4 pb-4 prose prose-sm max-w-none text-foreground/80 whitespace-pre-wrap text-sm">
                        {rawPrompt}
                      </div>
                    </details>

                    {/* Phase 2 prompt — collapsed by default */}
                    {hasPhase2 && (
                      <details className="rounded-2xl border border-border/50 bg-muted/30">
                        <summary className="cursor-pointer px-4 py-3 flex items-center gap-2 text-sm font-heading font-semibold">
                          Phase 2（改版）提示词
                          <span className="ml-auto text-muted-foreground text-xs">▼</span>
                        </summary>
                        <div className="px-4 pb-4 space-y-3">
                          {/* Step 1 */}
                          <div className="rounded-xl border border-border/30 bg-background/50 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                              <span className="font-heading font-semibold text-sm">生成 PRD</span>
                              <CopyButton text={phase2Step1} />
                            </div>
                            <div className="prose prose-sm max-w-none text-foreground/80 whitespace-pre-wrap text-sm">
                              {phase2Step1}
                            </div>
                          </div>
                          {/* Step 2 */}
                          <div className="rounded-xl border border-border/30 bg-background/50 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                              <span className="font-heading font-semibold text-sm">根据 PRD 生成代码</span>
                              <CopyButton text={phase2Step2} />
                            </div>
                            <div className="prose prose-sm max-w-none text-foreground/80 whitespace-pre-wrap text-sm">
                              {phase2Step2}
                            </div>
                          </div>
                        </div>
                      </details>
                    )}
                  </div>
                </details>
              )}
            </div>
          )}

          {/* Submissions grid — grouped by model */}
          {groupedModels.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-muted-foreground">
                暂无已发布作品
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedModels.map((g) => (
                <SubmissionCard
                  key={`${g.modelName}__${g.channelName}`}
                  modelName={g.modelName}
                  vendorName={g.vendorName}
                  channelName={g.channelName}
                  phase1={g.phase1}
                  phase2={g.phase2}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
