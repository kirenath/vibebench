import Link from "next/link";
import { notFound } from "next/navigation";
import { query, queryOne } from "@/lib/db";
import { ArrowLeft, Building2, ExternalLink } from "lucide-react";
import ModelSubmissionCard, { PhaseSubmission } from "@/components/ModelSubmissionCard";

export const dynamic = "force-dynamic";

interface ModelRow {
  id: string;
  name: string;
  description: string | null;
  vendor_name: string;
  family_name: string;
}

interface SubmissionRow {
  submission_id: string;
  challenge_id: string;
  challenge_title: string;
  phase_key: string;
  phase_label: string;
  channel_id: string;
  channel_name: string;
  has_html: boolean;
  has_prd: boolean;
  duration_ms: string | null;
  iteration_count: number | null;
  manual_touched: boolean;
  manual_notes: string | null;
  updated_at: string;
}

async function getModel(id: string) {
  try {
    return await queryOne<ModelRow>(
      `SELECT mv.id, mv.name, mv.description, v.name as vendor_name, mf.name as family_name
       FROM model_variants mv
       JOIN model_families mf ON mf.id = mv.family_id
       JOIN vendors v ON v.id = mf.vendor_id
       WHERE mv.id = $1`,
      [id]
    );
  } catch {
    return null;
  }
}

async function getModelSubmissions(modelId: string) {
  try {
    return await query<SubmissionRow>(
      `SELECT submission_id, challenge_id, challenge_title, phase_key, phase_label,
              channel_id, channel_name, has_html, has_prd, duration_ms, iteration_count,
              manual_touched, manual_notes, updated_at
       FROM submission_overview
       WHERE model_variant_id = $1 AND submission_is_published = true AND challenge_is_published = true
       ORDER BY challenge_title, channel_name, phase_key`,
      [modelId]
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
  const model = await getModel(id);
  if (!model) return { title: "模型未找到 — VibeBench" };
  return {
    title: `${model.name} — VibeBench`,
    description: `${model.vendor_name} ${model.family_name} - ${model.name}`,
  };
}

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const model = await getModel(id);
  if (!model) notFound();

  const submissions = await getModelSubmissions(id);

  const groupedTasks: Record<
    string,
    {
      challengeId: string;
      challengeTitle: string;
      channelName: string;
      phase1: PhaseSubmission | null;
      phase2: PhaseSubmission | null;
    }
  > = {};

  submissions.forEach((s) => {
    const key = `${s.challenge_id}_${s.channel_id}`;
    if (!groupedTasks[key]) {
      groupedTasks[key] = {
        challengeId: s.challenge_id,
        challengeTitle: s.challenge_title,
        channelName: s.channel_name,
        phase1: null,
        phase2: null,
      };
    }
    const pData: PhaseSubmission = {
      submission_id: s.submission_id,
      duration_ms: s.duration_ms,
      iteration_count: s.iteration_count,
      has_html: s.has_html,
      has_prd: s.has_prd,
      manual_touched: s.manual_touched,
      manual_notes: s.manual_notes,
    };
    if (s.phase_key.startsWith("phase2")) {
      groupedTasks[key].phase2 = pData;
    } else {
      groupedTasks[key].phase1 = pData;
    }
  });

  const cards = Object.values(groupedTasks).sort((a, b) =>
    a.challengeTitle.localeCompare(b.challengeTitle)
  );

  return (
    <div className="relative section pt-24">
      {/* Background wash that extends behind navbar to eliminate the dividing line */}
      <div
        className="absolute inset-0 -top-24 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% 40%, rgba(93,112,82,0.10) 0%, transparent 70%)",
        }}
      />
      <div className="max-w-7xl mx-auto">
        <Link
          href="/models"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          返回模型目录
        </Link>

        <div className="mb-12">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-2">
            {model.name}
          </h1>
          <p className="text-lg text-muted-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {model.vendor_name} · {model.family_name}
          </p>
          {model.description && (
            <p className="mt-4 text-muted-foreground max-w-3xl">
              {model.description}
            </p>
          )}
        </div>

        <h2 className="font-heading text-2xl font-bold mb-6">参赛作品</h2>

        {cards.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-muted-foreground">暂无已发布作品</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((c) => (
              <ModelSubmissionCard
                key={`${c.challengeId}_${c.channelName}`}
                challengeId={c.challengeId}
                challengeTitle={c.challengeTitle}
                channelName={c.channelName}
                phase1={c.phase1}
                phase2={c.phase2}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
