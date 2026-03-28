import { query } from "@/lib/db";
import type { ModelVariant, ModelFamily, Vendor } from "@/types";

export const dynamic = "force-dynamic";

interface ModelVariantWithMeta extends ModelVariant {
  vendor_name: string;
  vendor_id: string;
  family_name: string;
  family_id: string;
  submission_count: number;
}

async function getModels(): Promise<ModelVariantWithMeta[]> {
  try {
    const result = await query<ModelVariantWithMeta>(`
      SELECT
        mv.*,
        v.name AS vendor_name,
        v.id AS vendor_id,
        mf.name AS family_name,
        mf.id AS family_id,
        COUNT(DISTINCT s.id) FILTER (WHERE s.is_published)::int AS submission_count
      FROM public.model_variants mv
      JOIN public.model_families mf ON mf.id = mv.family_id
      JOIN public.vendors v ON v.id = mf.vendor_id
      LEFT JOIN public.submissions s ON s.model_variant_id = mv.id AND s.is_published
      GROUP BY mv.id, v.id, v.name, mf.id, mf.name
      HAVING COUNT(DISTINCT s.id) FILTER (WHERE s.is_published) > 0
      ORDER BY v.name, mf.name, mv.sort_order, mv.name
    `);
    return result.rows;
  } catch {
    return [];
  }
}

export default async function ModelsPage() {
  const models = await getModels();

  // Group by vendor -> family
  const grouped = models.reduce(
    (acc, model) => {
      if (!acc[model.vendor_name]) acc[model.vendor_name] = {};
      if (!acc[model.vendor_name][model.family_name])
        acc[model.vendor_name][model.family_name] = [];
      acc[model.vendor_name][model.family_name].push(model);
      return acc;
    },
    {} as Record<string, Record<string, ModelVariantWithMeta[]>>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1
        className="mb-12 text-4xl font-bold text-deep-loam md:text-5xl"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        模型目录
      </h1>

      {Object.keys(grouped).length === 0 ? (
        <div className="grain-overlay rounded-[2rem] border border-timber/50 bg-card p-16 text-center shadow-soft">
          <p className="text-dried-grass">暂无已注册模型或暂无已发布作品</p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(grouped).map(([vendor, families]) => (
            <div key={vendor}>
              <h2
                className="mb-6 border-b border-timber/30 pb-3 text-2xl font-semibold text-deep-loam"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {vendor}
              </h2>
              <div className="space-y-6">
                {Object.entries(families).map(([family, variants]) => (
                  <div key={family}>
                    <h3 className="mb-3 text-sm font-semibold tracking-wide text-moss uppercase">
                      {family}
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {variants.map((variant) => (
                        <a
                          key={variant.id}
                          href={`/models/${variant.id}`}
                          className="group grain-overlay rounded-[2rem] border border-timber/50 bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                        >
                          <h4
                            className="font-semibold text-deep-loam transition-colors group-hover:text-moss"
                            style={{ fontFamily: "var(--font-heading)" }}
                          >
                            {variant.name}
                          </h4>
                          <p className="mt-1 text-xs text-dried-grass">
                            {variant.submission_count} 个已发布作品
                          </p>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
