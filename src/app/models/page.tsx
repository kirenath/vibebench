import Link from "next/link";
import { query } from "@/lib/db";
import Blob from "@/components/Blob";
import ModelGrid, { ModelItem } from "@/components/ModelGrid";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "模型目录 — VibeBench",
  description: "浏览所有已注册的 AI 模型版本",
};

async function getModels() {
  try {
    return await query<ModelItem>(`
      SELECT mv.id, mv.name, mv.description,
             v.id as vendor_id, v.name as vendor_name,
             mf.id as family_id, mf.name as family_name,
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
    <div className="relative">
      <section className="relative section pt-24">
        {/* Background wash that extends behind navbar to eliminate the dividing line */}
        <div
          className="absolute inset-0 -top-24 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 20% 40%, rgba(93,112,82,0.10) 0%, transparent 70%)",
          }}
        />
        <Blob
          color="bg-secondary"
          size="w-64 h-64"
          className="-top-10 -left-10"
          shapeIndex={4}
        />
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-12"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
          <div className="mb-10">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              模型目录
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              浏览所有至少有 1 个已发布作品的模型版本
            </p>
          </div>

          <ModelGrid models={models} />
        </div>
      </section>
    </div>
  );
}
