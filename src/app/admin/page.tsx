import supabase from '@/lib/db';
import Link from 'next/link';
import { Trophy, Cpu, FileCode } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const { count: challengeCount } = await supabase.from('challenges').select('*', { count: 'exact', head: true });
  const { count: variantCount } = await supabase.from('model_variants').select('*', { count: 'exact', head: true });
  const { count: submissionCount } = await supabase.from('submissions').select('*', { count: 'exact', head: true });

  const stats = [
    { label: '赛题', count: challengeCount ?? 0, icon: Trophy, href: '/admin/challenges' },
    { label: '模型版本', count: variantCount ?? 0, icon: Cpu, href: '/admin/models' },
    { label: '作品', count: submissionCount ?? 0, icon: FileCode, href: '/admin/submissions' },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--space-8)' }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)' }}>
        {stats.map(s => (
          <Link key={s.href} href={s.href} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card card-hover" style={{ cursor: 'pointer', padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <s.icon size={20} style={{ color: 'var(--color-primary)' }} />
                <span className="text-sm text-muted">{s.label}</span>
              </div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 'var(--text-3xl)', fontWeight: 800 }}>
                {s.count}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
