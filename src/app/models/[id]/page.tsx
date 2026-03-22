import Link from "next/link";
import { notFound } from "next/navigation";
import { query, queryOne } from "@/lib/db";
import { ArrowLeft, Building2, ExternalLink } from "lucide-react";

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
  phase_label: string;
  channel_name: string;
  has_html: boolean;
  manual_touched: boolean;
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
      `SELECT submission_id, challenge_id, challenge_title, phase_label,
              channel_name, has_html, manual_touched, updated_at
       FROM submission_overview
       WHERE model_variant_id = $1 AND submission_is_published = true AND challenge_is_published = true
       ORDER BY challenge_title, phase_label`,
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

  return (
    <div className="section pt-12">
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

        {submissions.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-muted-foreground">暂无已发布作品</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map((s) => (
              <div key={s.submission_id} className="card p-6 card-hover">
                <h3 className="font-heading font-bold mb-1">
                  {s.challenge_title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {s.phase_label} · {s.channel_name}
                </p>
                {s.manual_touched && (
                  <span className="badge-destructive text-xs mb-3 inline-block">
                    人工修订
                  </span>
                )}
                <div className="flex items-center gap-2">
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
                  <Link
                    href={`/challenges/${s.challenge_id}`}
                    className="btn-ghost btn-sm !h-9 !px-4 text-xs"
                  >
                    赛题详情
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
