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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
      <header className="mb-10">
        <p className="text-sm text-organic-muted-fg mb-2">
          {variant.vendor_name} / {variant.family_name}
        </p>
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-organic-fg">{variant.name}</h1>
        {variant.description && (
          <p className="text-lg text-organic-muted-fg mt-3 leading-relaxed">{variant.description}</p>
        )}
      </header>

      {Object.entries(grouped).length === 0 ? (
        <p className="text-organic-muted-fg text-center py-12">No published submissions yet.</p>
      ) : (
        Object.entries(grouped).map(([challengeId, subs]) => (
          <section key={challengeId} className="mb-12">
            <h2 className="text-2xl font-heading font-semibold text-organic-fg mb-5">
              <Link href={`/challenges/${challengeId}`} className="hover:text-organic-primary transition-colors duration-300">
                {subs[0].challenge_title}
              </Link>
            </h2>
            <div className="grid gap-4">
              {subs.map((sub: any) => (
                <div key={sub.submission_id} className="p-5 rounded-organic border border-organic-border/50 bg-organic-card shadow-soft hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-organic-fg">{sub.phase_label}</span>
                    <span className="text-xs px-3 py-1 rounded-full bg-organic-accent text-organic-accent-fg font-medium">
                      {sub.channel_name}
                    </span>
                    {sub.has_html && <span className="text-xs px-2.5 py-1 rounded-full bg-organic-primary/10 text-organic-primary font-medium">HTML</span>}
                    {sub.manual_touched && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-organic-secondary/10 text-organic-secondary font-medium">Manual Edit</span>
                    )}
                  </div>
                  {sub.duration_ms != null && (
                    <p className="text-xs text-organic-muted-fg mt-2">Duration: {(sub.duration_ms / 1000).toFixed(1)}s</p>
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
