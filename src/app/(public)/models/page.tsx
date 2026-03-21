import Link from 'next/link';
import supabase from '@/lib/db';
import { Cpu, Building2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '模型目录 — VibeBench',
  description: '浏览所有参赛 AI 模型',
};

export const revalidate = 60;

export default async function ModelsPage() {
  // Get all vendors with their families and variants
  const { data: vendors } = await supabase
    .from('vendors')
    .select('*')
    .order('sort_order', { ascending: true });

  const { data: families } = await supabase
    .from('model_families')
    .select('*')
    .order('sort_order', { ascending: true });

  const { data: variants } = await supabase
    .from('model_variants')
    .select('*')
    .order('sort_order', { ascending: true });

  // Get model variants that have at least 1 published submission
  const { data: activeVariants } = await supabase
    .from('submission_overview')
    .select('model_variant_id')
    .eq('submission_is_published', true)
    .eq('challenge_is_published', true);

  const activeVariantIds = new Set(activeVariants?.map(v => v.model_variant_id) || []);

  // Group by vendor — cast to any to avoid Supabase's untyped returns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vendorGroups = ((vendors || []) as any[]).map(v => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vFamilies = ((families || []) as any[]).filter(f => f.vendor_id === v.id).map(f => ({
      ...f,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      variants: ((variants || []) as any[]).filter(mv => mv.family_id === f.id && activeVariantIds.has(mv.id)),
    })).filter(f => f.variants.length > 0);

    return { ...v, families: vFamilies };
  }).filter(v => v.families.length > 0);

  return (
    <section className="section">
      <div className="container">
        <h1 style={{ marginBottom: 'var(--space-4)' }}>模型目录</h1>
        <p className="text-muted" style={{ marginBottom: 'var(--space-8)' }}>
          所有参与 VibeBench 赛题的 AI 模型版本
        </p>

        {vendorGroups.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
            {vendorGroups.map(v => (
              <div key={v.id}>
                <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Building2 size={24} style={{ color: 'var(--color-secondary)' }} /> {v.name}
                </h2>
                {v.description && <p className="text-muted text-sm" style={{ marginBottom: 'var(--space-6)' }}>{v.description}</p>}
                {v.families.map((f: { id: string; name: string; variants: { id: string; name: string; description: string | null }[] }) => (
                  <div key={f.id} style={{ marginBottom: 'var(--space-6)' }}>
                    <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)', color: 'var(--color-muted-foreground)' }}>{f.name}</h3>
                    <div className="grid grid-3" style={{ gap: 'var(--space-4)' }}>
                      {f.variants.map((mv: { id: string; name: string; description: string | null }, i: number) => (
                        <Link key={mv.id} href={`/models/${mv.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <div className={`card card-hover card-organic-${(i % 6) + 1}`} style={{ cursor: 'pointer', padding: 'var(--space-6)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                              <div style={{
                                width: 40, height: 40, borderRadius: 'var(--radius-md)',
                                background: 'rgba(93,112,82,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <Cpu size={20} style={{ color: 'var(--color-primary)' }} />
                              </div>
                              <div>
                                <strong style={{ fontSize: 'var(--text-base)' }}>{mv.name}</strong>
                                {mv.description && <p className="text-xs text-muted" style={{ margin: 0 }}>{mv.description}</p>}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>暂无模型数据</h3>
            <p className="text-muted">尚无模型拥有已发布的作品</p>
          </div>
        )}
      </div>
    </section>
  );
}
