import Link from "next/link";
import { query } from "@/lib/db";
import Blob from "@/components/Blob";
import { Cpu, ArrowRight, Building2 } from "lucide-react";

export const metadata = {
  title: "模型目录 — VibeBench",
  description: "浏览所有已注册的 AI 模型版本",
};

interface ModelRow {
  id: string;
  name: string;
  description: string | null;
  vendor_name: string;
  family_name: string;
  submission_count: string;
}

async function getModels() {
  try {
    return await query<ModelRow>(`
      SELECT mv.id, mv.name, mv.description,
             v.name as vendor_name, mf.name as family_name,
             (SELECT COUNT(*) FROM submissions s WHERE s.model_variant_id = mv.id AND s.is_published = true) as submission_count
      FROM model_variants mv
      JOIN model_families mf ON mf.id = mv.family_id
      JOIN vendors v ON v.id = mf.vendor_id
      WHERE EXISTS (SELECT 1 FROM submissions s WHERE s.model_variant_id = mv.id AND s.is_published = true)
      ORDER BY v.sort_order, mf.sort_order, mv.sort_order
    `);
  } catch {
    return [];
  }
}

export default async function ModelsPage() {
  const models = await getModels();

  return (
    <div className="relative overflow-hidden">
      <Blob
        color="bg-secondary"
        size="w-64 h-64"
        className="-top-10 -left-10"
        shapeIndex={4}
      />

      <section className="section pt-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              模型目录
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              浏览所有至少有 1 个已发布作品的模型版本
            </p>
          </div>

          {models.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-muted-foreground">暂无已注册模型</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {models.map((m) => (
                <Link
                  key={m.id}
                  href={`/models/${m.id}`}
                  className="card card-hover p-6 group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors duration-300">
                      <Cpu className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg group-hover:text-primary transition-colors">
                        {m.name}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {m.vendor_name} · {m.family_name}
                      </p>
                    </div>
                  </div>
                  {m.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {m.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="badge-primary">
                      {m.submission_count} 个作品
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
