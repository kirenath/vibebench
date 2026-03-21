import Link from 'next/link';
import supabase from '@/lib/db';
import { Cpu } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '赛题列表 — VibeBench',
  description: '浏览所有 AI Vibe Coding 赛题',
};

export const revalidate = 60;

export default async function ChallengesPage() {
  const { data: challenges } = await supabase
    .from('challenges')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  const enriched = await Promise.all(
    (challenges || []).map(async (c) => {
      const { data: subs } = await supabase
        .from('submission_overview')
        .select('model_variant_id')
        .eq('challenge_id', c.id)
        .eq('submission_is_published', true);
      const modelCount = new Set(subs?.map(s => s.model_variant_id) || []).size;
      return { ...c, modelCount };
    })
  );

  return (
    <section className="section">
      <div className="container">
        <h1 style={{ marginBottom: 'var(--space-4)' }}>赛题</h1>
        <p className="text-muted" style={{ marginBottom: 'var(--space-8)' }}>
          每道赛题都是一个前端挑战，不同 AI 模型在相同条件下作答
        </p>

        {enriched.length > 0 ? (
          <div className="grid grid-3">
            {enriched.map((c, i) => (
              <Link key={c.id} href={`/challenges/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={`card card-hover card-organic-${(i % 6) + 1}`} style={{ cursor: 'pointer' }}>
                  {c.cover_image && (
                    <div style={{ height: 180, borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 'var(--space-4)' }}>
                      <img src={c.cover_image} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>{c.title}</h3>
                  {c.description && <p className="text-muted text-sm" style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{c.description}</p>}
                  <div style={{ marginTop: 'var(--space-4)' }}>
                    <span className="badge badge-primary"><Cpu size={10} /> {c.modelCount} 个模型</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>暂无已发布赛题</h3>
            <p className="text-muted">赛题即将上线，敬请期待</p>
          </div>
        )}
      </div>
    </section>
  );
}
