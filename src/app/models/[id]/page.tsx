import { query } from "@/lib/db";
import type { SubmissionOverview } from "@/types";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface ModelInfo {
  id: string;
  name: string;
  description: string | null;
  family_name: string;
  vendor_name: string;
}

async function getModel(id: string): Promise<ModelInfo | null> {
  try {
    const result = await query<ModelInfo>(
      `SELECT mv.id, mv.name, mv.description,
              mf.name AS family_name, v.name AS vendor_name
       FROM public.model_variants mv
       JOIN public.model_families mf ON mf.id = mv.family_id
       JOIN public.vendors v ON v.id = mf.vendor_id
       WHERE mv.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  } catch {
    return null;
  }
}

async function getModelSubmissions(
  modelVariantId: string
): Promise<SubmissionOverview[]> {
  try {
    const result = await query<SubmissionOverview>(
      `SELECT * FROM public.submission_overview
       WHERE model_variant_id = $1 AND submission_is_published = true
       ORDER BY challenge_title, phase_sort_order, channel_name`,
      [modelVariantId]
    );
    return result.rows;
  } catch {
    return [];
  }
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

  // Group by challenge
  const byChallenge = submissions.reduce(
    (acc, sub) => {
      if (!acc[sub.challenge_title]) acc[sub.challenge_title] = [];
      acc[sub.challenge_title].push(sub);
      return acc;
    },
    {} as Record<string, SubmissionOverview[]>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <a href="/models" className="inline-flex items-center gap-1 text-sm font-medium text-moss transition-colors hover:text-deep-loam">
        &larr; 返回模型目录
      </a>

      <div className="mt-6">
        <h1
          className="text-4xl font-bold text-deep-loam md:text-5xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {model.name}
        </h1>
        <p className="mt-2 text-lg text-dried-grass">
          {model.vendor_name} / {model.family_name}
        </p>
        {model.description && (
          <p className="mt-4 text-dried-grass">{model.description}</p>
        )}
      </div>

      <div className="mt-12">
        <h2
          className="mb-6 text-2xl font-semibold text-deep-loam"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          参赛记录
          <span className="ml-2 text-base font-normal text-dried-grass">
            ({submissions.length} 个已发布作品)
          </span>
        </h2>

        {Object.keys(byChallenge).length === 0 ? (
          <div className="grain-overlay rounded-[2rem] border border-timber/50 bg-card p-16 text-center shadow-soft">
            <p className="text-dried-grass">该模型暂无已发布作品</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(byChallenge).map(([challengeTitle, subs]) => (
              <div key={challengeTitle}>
                <h3
                  className="mb-4 text-xl font-medium text-deep-loam"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {challengeTitle}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {subs.map((sub) => (
                    <a
                      key={sub.submission_id}
                      href={`/challenges/${sub.challenge_id}`}
                      className="group grain-overlay rounded-[2rem] border border-timber/50 bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p
                            className="text-sm font-semibold text-deep-loam transition-colors group-hover:text-moss"
                            style={{ fontFamily: "var(--font-heading)" }}
                          >
                            {sub.phase_label}
                          </p>
                          <p className="text-xs text-dried-grass">
                            {sub.channel_name}
                          </p>
                        </div>
                        {sub.manual_touched && (
                          <span className="rounded-full bg-terracotta/10 px-2.5 py-0.5 text-xs font-medium text-terracotta">
                            人工修订
                          </span>
                        )}
                      </div>
                      {sub.duration_ms != null && (
                        <p className="mt-2 text-xs text-dried-grass/70">
                          耗时 {(sub.duration_ms / 1000).toFixed(1)}s
                        </p>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
