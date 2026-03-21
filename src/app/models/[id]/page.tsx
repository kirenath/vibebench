import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function getModelVariants() {
  const res = await fetch(`${BASE_URL}/api/model-variants`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

async function getSubmissions(modelVariantId: string) {
  const url = new URL(`${BASE_URL}/api/submissions`);
  url.searchParams.set("model_variant", modelVariantId);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

interface ModelVariant { id: string; name: string; description: string | null; family_name: string; vendor_name: string; }
interface Sub { submission_id: string; challenge_id: string; challenge_title: string; phase_label: string; channel_name: string; manual_touched: boolean; has_html: boolean; updated_at: string; }

export default async function ModelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const allVariants: ModelVariant[] = await getModelVariants();
  const model = allVariants.find((v) => v.id === id);
  if (!model) notFound();

  const submissions: Sub[] = await getSubmissions(id);

  // Group by challenge
  const grouped = submissions.reduce<Record<string, { title: string; subs: Sub[] }>>((acc, s) => {
    if (!acc[s.challenge_id]) acc[s.challenge_id] = { title: s.challenge_title, subs: [] };
    acc[s.challenge_id].subs.push(s);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <nav className="text-sm text-muted mb-6">
        <Link href="/models" className="hover:text-bark transition-colors">模型目录</Link>
        <span className="mx-2">/</span>
        <span className="text-bark-dark">{model.name}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-bark-dark mb-2">{model.name}</h1>
        <div className="flex items-center gap-3 text-sm text-muted">
          <span>{model.vendor_name}</span>
          <span className="text-sand">·</span>
          <span>{model.family_name}</span>
        </div>
        {model.description && <p className="mt-3 text-muted">{model.description}</p>}
      </div>

      <h2 className="text-xl font-heading font-semibold text-bark-dark mb-4">参赛记录</h2>
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🌱</div>
          <p className="text-muted">该模型暂无已发布的参赛记录</p>
        </div>
      ) : (
        Object.entries(grouped).map(([challengeId, { title, subs }]) => (
          <div key={challengeId} className="mb-6">
            <h3 className="font-heading font-semibold text-bark mb-3">
              <Link href={`/challenges/${challengeId}`} className="hover:text-leaf-dark transition-colors">{title}</Link>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subs.map((s) => (
                <Link key={s.submission_id} href={`/submissions/${s.submission_id}`}>
                  <div className="card card-hover p-4 cursor-pointer flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-bark-dark">{s.phase_label} — {s.channel_name}</div>
                      <div className="text-xs text-stone mt-0.5">{new Date(s.updated_at).toLocaleDateString("zh-CN")}</div>
                    </div>
                    <div className="flex gap-1">
                      {s.manual_touched && <span className="badge badge-warning text-xs">⚠修订</span>}
                      {s.has_html && <span className="badge badge-success text-xs">HTML</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
