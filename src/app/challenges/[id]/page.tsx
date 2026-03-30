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
import SubmissionCard, { type PhaseSubmission, type PhaseData } from "@/components/SubmissionCard";

export const dynamic = "force-dynamic";

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
  phases: PhaseData[];
}

function groupByModel(submissions: SubmissionRow[], allPhases: PhaseRow[]): GroupedModel[] {
  const map = new Map<string, GroupedModel>();

  for (const s of submissions) {
    const key = `${s.model_variant_id}__${s.channel_id}`;
    if (!map.has(key)) {
      map.set(key, {
        modelName: s.model_variant_name,
        vendorName: s.vendor_name,
        channelName: s.channel_name,
        phases: allPhases.map((p) => ({
          phase_key: p.phase_key,
          phase_label: p.phase_label,
          submission: null,
        })),
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

    const phaseEntry = group.phases.find((p) => p.phase_key === s.phase_key);
    if (phaseEntry) {
      phaseEntry.submission = sub;
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
  const groupedModels = groupByModel(submissions, phases);



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
              {challenge.prompt_markdown && (() => {
                const promptStr = challenge.prompt_markdown;

                // Split by top-level headings only (skip headings inside code fences)
                // 1. Find all code fence regions so we can ignore headings within them
                const codeFenceRegex = /^(`{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm;
                const fenceRanges: [number, number][] = [];
                let fenceMatch: RegExpExecArray | null;
                while ((fenceMatch = codeFenceRegex.exec(promptStr)) !== null) {
                  fenceRanges.push([fenceMatch.index, fenceMatch.index + fenceMatch[0].length]);
                }
                const isInsideFence = (pos: number) => fenceRanges.some(([s, e]) => pos >= s && pos < e);

                // 2. Find heading positions that are NOT inside code fences
                const headingRegex = /^(#{1,6})\s+([^\n]+)$/gm;
                const headings: { level: number; title: string; index: number; fullMatchLen: number }[] = [];
                let hMatch: RegExpExecArray | null;
                while ((hMatch = headingRegex.exec(promptStr)) !== null) {
                  if (!isInsideFence(hMatch.index)) {
                    headings.push({ level: hMatch[1].length, title: hMatch[2].trim(), index: hMatch.index, fullMatchLen: hMatch[0].length });
                  }
                }

                // 3. Build sections from heading positions
                const sections: { title: string; content: string }[] = [];
                if (headings.length === 0) {
                  const trimmed = promptStr.trim();
                  if (trimmed) sections.push({ title: "Prompt", content: trimmed });
                } else {
                  const preContent = promptStr.slice(0, headings[0].index).trim();
                  if (preContent) sections.push({ title: "Prompt", content: preContent });
                  for (let i = 0; i < headings.length; i++) {
                    const contentStart = headings[i].index + headings[i].fullMatchLen;
                    const contentEnd = i + 1 < headings.length ? headings[i + 1].index : promptStr.length;
                    const content = promptStr.slice(contentStart, contentEnd).trim();
                    sections.push({ title: headings[i].title, content });
                  }
                }

                if (sections.length === 0) return null;

                // Group multi-step phases: "phase2 step1", "phase2 step2" → group under "phase2"
                type GroupItem = { type: 'single'; section: typeof sections[0]; idx: number } | { type: 'group'; groupTitle: string; children: { section: typeof sections[0]; idx: number }[] };
                const grouped: GroupItem[] = [];
                const phaseStepRegex = /^(phase\d+)\s+step\s*\d+/i;

                let i = 0;
                while (i < sections.length) {
                  const match = sections[i].title.match(phaseStepRegex);
                  if (match) {
                    const prefix = match[1].toLowerCase();
                    const children: { section: typeof sections[0]; idx: number }[] = [];
                    while (i < sections.length) {
                      const m = sections[i].title.match(phaseStepRegex);
                      if (m && m[1].toLowerCase() === prefix) {
                        children.push({ section: sections[i], idx: i });
                        i++;
                      } else break;
                    }
                    if (children.length > 1) {
                      grouped.push({ type: 'group', groupTitle: prefix, children });
                    } else {
                      grouped.push({ type: 'single', section: children[0].section, idx: children[0].idx });
                    }
                  } else {
                    grouped.push({ type: 'single', section: sections[i], idx: i });
                    i++;
                  }
                }

                return (
                  <details className="card p-6 group" open>
                    <summary className="cursor-pointer font-heading font-semibold text-lg flex items-center gap-2">
                      <MessageSquareText className="h-5 w-5 text-secondary" />
                      Prompt
                      <span className="ml-auto text-muted-foreground group-open:rotate-180 transition-transform duration-300">
                        ▼
                      </span>
                    </summary>

                    <div className="mt-4 space-y-3">
                      {grouped.map((item, gIdx) => {
                        if (item.type === 'single') {
                          return (
                            <details
                              key={item.idx}
                              className="rounded-2xl border border-border/50 bg-muted/30"
                              open={item.idx === 0}
                            >
                              <summary className="cursor-pointer px-4 py-3 flex items-center gap-2 text-sm font-heading font-semibold">
                                {item.section.title}
                                <CopyButton text={item.section.content} />
                                <span className="ml-auto text-muted-foreground text-xs">▼</span>
                              </summary>
                              <div className="px-4 pb-4 prose prose-sm max-w-none text-foreground/80 whitespace-pre-wrap text-sm">
                                {item.section.content}
                              </div>
                            </details>
                          );
                        }
                        // group with children
                        return (
                          <details
                            key={`g-${gIdx}`}
                            className="rounded-2xl border border-border/50 bg-muted/30"
                          >
                            <summary className="cursor-pointer px-4 py-3 flex items-center gap-2 text-sm font-heading font-semibold">
                              {item.groupTitle}
                              <span className="text-xs text-muted-foreground font-normal">({item.children.length} steps)</span>
                              <span className="ml-auto text-muted-foreground text-xs">▼</span>
                            </summary>
                            <div className="px-4 pb-3 space-y-2">
                              {item.children.map((child) => (
                                <details
                                  key={child.idx}
                                  className="rounded-xl border border-border/40 bg-background/50"
                                >
                                  <summary className="cursor-pointer px-3 py-2 flex items-center gap-2 text-sm font-heading font-semibold">
                                    {child.section.title}
                                    <CopyButton text={child.section.content} />
                                    <span className="ml-auto text-muted-foreground text-xs">▼</span>
                                  </summary>
                                  <div className="px-3 pb-3 prose prose-sm max-w-none text-foreground/80 whitespace-pre-wrap text-sm">
                                    {child.section.content}
                                  </div>
                                </details>
                              ))}
                            </div>
                          </details>
                        );
                      })}
                    </div>
                  </details>
                );
              })()}
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
                  phases={g.phases}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
