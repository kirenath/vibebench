import { notFound } from "next/navigation";
import db from "@/lib/db";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { rows } = await db.query(`SELECT name FROM model_variants WHERE id = $1`, [id]);
  if (rows.length === 0) return { title: "Not Found" };
  return { title: `${rows[0].name} - VibeBench` };
}

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { rows: variantRows } = await db.query(
    `SELECT mv.*, mf.name as family_name, v.name as vendor_name
     FROM model_variants mv
     JOIN model_families mf ON mf.id = mv.family_id
     JOIN vendors v ON v.id = mf.vendor_id
     WHERE mv.id = $1`,
    [id]
  );
  if (variantRows.length === 0) notFound();
  const variant = variantRows[0];

  const { rows: submissions } = await db.query(
    `SELECT * FROM submission_overview
     WHERE model_variant_id = $1 AND submission_is_published = true AND challenge_is_published = true
     ORDER BY challenge_title, phase_sort_order, channel_name`,
    [id]
  );

  const grouped: Record<string, typeof submissions> = {};
  for (const sub of submissions) {
    const key = sub.challenge_id;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(sub);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8">
        <p className="text-sm text-gray-400 mb-1">
          {variant.vendor_name} / {variant.family_name}
        </p>
        <h1 className="text-4xl font-bold text-gray-900">{variant.name}</h1>
        {variant.description && (
          <p className="text-lg text-gray-500 mt-2">{variant.description}</p>
        )}
      </header>

      {Object.entries(grouped).length === 0 ? (
        <p className="text-gray-400 text-center py-12">No published submissions yet.</p>
      ) : (
        Object.entries(grouped).map(([challengeId, subs]) => (
          <section key={challengeId} className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              <Link href={`/challenges/${challengeId}`} className="hover:text-brand-600">
                {subs[0].challenge_title}
              </Link>
            </h2>
            <div className="grid gap-3">
              {subs.map((sub: any) => (
                <div key={sub.submission_id} className="p-4 rounded-lg border border-gray-200 bg-white">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{sub.phase_label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      {sub.channel_name}
                    </span>
                    {sub.has_html && <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-600">HTML</span>}
                    {sub.manual_touched && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Manual Edit</span>
                    )}
                  </div>
                  {sub.duration_ms != null && (
                    <p className="text-xs text-gray-400 mt-1">Duration: {(sub.duration_ms / 1000).toFixed(1)}s</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
