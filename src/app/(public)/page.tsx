import Link from 'next/link';
import supabase from '@/lib/db';
import { Sparkles, Trophy, Cpu, FileCode } from 'lucide-react';

export const revalidate = 60; // ISR: revalidate every 60 seconds

async function getStats() {
  const { count: challengeCount } = await supabase
    .from('challenges')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true);

  const { data: modelData } = await supabase
    .from('submission_overview')
    .select('model_variant_id')
    .eq('submission_is_published', true)
    .eq('challenge_is_published', true);

  const uniqueModels = new Set(modelData?.map(d => d.model_variant_id) || []);

  const { count: submissionCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true);

  return {
    challenges: challengeCount ?? 0,
    models: uniqueModels.size,
    submissions: submissionCount ?? 0,
  };
}

async function getChallenges() {
  const { data } = await supabase
    .from('challenges')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  // Get submission counts per challenge
  const challenges = data || [];
  const enriched = await Promise.all(
    challenges.map(async (c) => {
      const { data: subs } = await supabase
        .from('submission_overview')
        .select('model_variant_id')
        .eq('challenge_id', c.id)
        .eq('submission_is_published', true);

      const modelCount = new Set(subs?.map(s => s.model_variant_id) || []).size;
      return { ...c, modelCount };
    })
  );

  return enriched;
}

export default async function HomePage() {
  const [stats, challenges] = await Promise.all([getStats(), getChallenges()]);

  return (
    <>
      {/* Hero */}
      <section
        className="section"
        style={{ position: 'relative', overflow: 'hidden', textAlign: 'center' }}
      >
        {/* Blob backgrounds */}
        <div
          className="blob blob-primary"
          style={{ width: 400, height: 400, top: -100, left: -100 }}
        />
        <div
          className="blob blob-secondary"
          style={{ width: 300, height: 300, top: 50, right: -50, borderRadius: '40% 60% 70% 30% / 40% 50% 50% 60%' }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div
              className="badge badge-primary"
              style={{ marginBottom: 'var(--space-4)', display: 'inline-flex' }}
            >
              <Sparkles size={12} />
              AI Vibe Coding 横评平台
            </div>
            <h1 style={{ marginBottom: 'var(--space-6)' }}>
              同一道题，不同 AI，
              <br />
              <span style={{ color: 'var(--color-primary)' }}>谁 vibe 得最好？</span>
            </h1>
            <p
              style={{
                fontSize: 'var(--text-lg)',
                color: 'var(--color-muted-foreground)',
                maxWidth: '600px',
                margin: '0 auto var(--space-8)',
              }}
            >
              VibeBench 围绕同一道前端题收集不同 AI 模型的作品产出，让你浏览、切换 phase、并排对比，看看谁的实现更有味道。
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/compare" className="btn btn-primary btn-lg">
                开始对比
              </Link>
              <Link href="/challenges" className="btn btn-outline btn-lg">
                浏览赛题
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ paddingBottom: 'var(--space-16)' }}>
        <div className="container">
          <div className="grid grid-4" style={{ maxWidth: '700px', margin: '0 auto', gap: 'var(--space-6)' }}>
            <StatCard icon={<Trophy size={28} />} value={stats.challenges} label="已发布赛题" />
            <StatCard icon={<Cpu size={28} />} value={stats.models} label="参赛模型" />
            <StatCard icon={<FileCode size={28} />} value={stats.submissions} label="提交作品" />
          </div>
        </div>
      </section>

      {/* Challenges Grid */}
      <section className="section" style={{ background: 'rgba(240,235,229,0.3)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <h2 style={{ marginBottom: 'var(--space-4)' }}>赛题</h2>
            <p className="text-muted" style={{ maxWidth: '500px', margin: '0 auto' }}>
              每道赛题定义一个前端挑战，各个 AI 模型在相同条件下完成，你来评判谁做得更好
            </p>
          </div>

          {challenges.length > 0 ? (
            <div className="grid grid-3">
              {challenges.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/challenges/${c.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    className={`card card-hover card-organic-${(i % 6) + 1}`}
                    style={{ cursor: 'pointer' }}
                  >
                    {c.cover_image && (
                      <div
                        style={{
                          height: 180,
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                          marginBottom: 'var(--space-4)',
                        }}
                      >
                        <img
                          src={c.cover_image}
                          alt={c.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>
                      {c.title}
                    </h3>
                    {c.description && (
                      <p
                        className="text-muted text-sm"
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          margin: 0,
                        }}
                      >
                        {c.description}
                      </p>
                    )}
                    <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
                      <span className="badge badge-primary">
                        <Cpu size={10} /> {c.modelCount} 个模型
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Sparkles size={48} style={{ opacity: 0.3, margin: '0 auto var(--space-4)' }} />
              <h3>敬请期待</h3>
              <p className="text-muted">赛题即将上线，请稍后再来看看 ✨</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
      <div style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-2)', display: 'flex', justifyContent: 'center' }}>
        {icon}
      </div>
      <div
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 'var(--text-3xl)',
          fontWeight: 800,
          color: 'var(--color-foreground)',
        }}
      >
        {value}
      </div>
      <div className="text-sm text-muted">{label}</div>
    </div>
  );
}
