import db from "@/lib/db";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Models - VibeBench",
  description: "Browse all AI models participating in VibeBench challenges.",
};

export default async function ModelsPage() {
  const { rows: vendors } = await db.query(
    `SELECT v.*,
       (SELECT count(DISTINCT mv.id) FROM model_variants mv
        JOIN model_families mf ON mf.id = mv.family_id
        JOIN submissions s ON s.model_variant_id = mv.id AND s.is_published = true
        WHERE mf.vendor_id = v.id) as variant_count
     FROM vendors v
     ORDER BY v.sort_order, v.name`
  );

  const { rows: variants } = await db.query(
    `SELECT DISTINCT mv.*, mf.name as family_name, v.name as vendor_name, v.id as vendor_id
     FROM model_variants mv
     JOIN model_families mf ON mf.id = mv.family_id
     JOIN vendors v ON v.id = mf.vendor_id
     JOIN submissions s ON s.model_variant_id = mv.id AND s.is_published = true
     ORDER BY mv.sort_order, mv.name`
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Models</h1>

      {vendors.filter((v: any) => parseInt(v.variant_count) > 0).map((vendor: any) => (
        <section key={vendor.id} className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">{vendor.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {variants
              .filter((v: any) => v.vendor_id === vendor.id)
              .map((variant: any) => (
                <Link
                  key={variant.id}
                  href={`/models/${variant.id}`}
                  className="block p-5 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow"
                >
                  <p className="font-medium text-gray-900">{variant.name}</p>
                  <p className="text-sm text-gray-400 mt-1">{variant.family_name}</p>
                  {variant.description && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{variant.description}</p>
                  )}
                </Link>
              ))}
          </div>
        </section>
      ))}

      {variants.length === 0 && (
        <p className="text-gray-400 text-center py-12">No models with published submissions yet.</p>
      )}
    </div>
  );
}
