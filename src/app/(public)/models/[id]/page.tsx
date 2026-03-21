import Link from 'next/link';
import supabase from '@/lib/db';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Eye, Clock, RotateCcw, AlertTriangle } from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data: variant } = await supabase.from('model_variants').select('name').eq('id', id).single();
  if (!variant) return { title: '模型不存在 — VibeBench' };
  return { title: `${variant.name} — VibeBench`, description: `${variant.name} 在 VibeBench 上的参赛作品` };
}

export default async function ModelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: variant } = await supabase.from('model_variants').select('*').eq('id', id).single();
  if (!variant) notFound();

  const { data: family } = await supabase.from('model_families').select('*, vendors(*)').eq('id', variant.family_id).single();

  const { data: submissions } = await supabase
    .from('submission_overview')
    .select('*')
    .eq('model_variant_id', id)
    .eq('submission_is_published', true)
    .eq('challenge_is_published', true)
    .order('created_at', { ascending: false });

  // Group submissions by challenge
  type SubItem = NonNullable<typeof submissions>[number];
  const byChallengeMap = new Map<string, SubItem[]>();
  (submissions || []).forEach(s => {
    const arr = byChallengeMap.get(s.challenge_id) || [];
    arr.push(s);
    byChallengeMap.set(s.challenge_id, arr);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const familyAny = family as any;
  const vendorName = familyAny?.vendors?.name as string | undefined;
  const familyName = familyAny?.name as string | undefined;

  return (
    <section className="section" style={{ paddingTop: 'var(--space-8)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-2)' }}>
            {vendorName} · {familyName}
          </p>
          <h1>{variant.name}</h1>
          {variant.description && <p className="text-muted text-lg">{variant.description}</p>}
        </div>

        {/* Submissions by challenge */}
        {byChallengeMap.size > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
            {Array.from(byChallengeMap.entries()).map(([challengeId, subs]) => subs && subs.length > 0 ? (
              <div key={challengeId}>
                <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)' }}>
                  <Link href={`/challenges/${challengeId}`} style={{ color: 'inherit' }}>
                    {subs[0].challenge_title}
                  </Link>
                </h2>
                <div className="grid grid-3" style={{ gap: 'var(--space-4)' }}>
                  {subs.map((s, i) => (
                    <div key={s.submission_id} className={`card card-organic-${(i % 6) + 1}`} style={{ padding: 'var(--space-6)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                        <span className="badge badge-primary">{s.phase_label}</span>
                        {s.manual_touched && (
                          <span className="badge badge-warning">
                            <AlertTriangle size={10} /> 人工修订
                          </span>
                        )}
                      </div>
                      <p className="text-sm" style={{ margin: 0 }}>{s.channel_name}</p>
                      <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-muted-foreground)' }}>
                        {s.duration_ms && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {Math.round(s.duration_ms / 1000)}s</span>}
                        {s.iteration_count != null && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><RotateCcw size={12} /> {s.iteration_count} 轮</span>}
                      </div>
                      <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
                        {s.has_html && (
                          <Link
                            href={`/challenges/${challengeId}`}
                            className="btn btn-primary btn-sm"
                          >
                            <Eye size={14} /> 查看
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null)}
          </div>
        ) : (
          <div className="empty-state">
            <h3>该模型暂无公开作品</h3>
            <p className="text-muted">该模型版本还没有已发布的参赛作品</p>
          </div>
        )}
      </div>
    </section>
  );
}
