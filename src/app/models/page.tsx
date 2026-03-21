import Link from "next/link";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface ModelVariant {
  id: string;
  name: string;
  description: string | null;
  family_name: string;
  vendor_name: string;
  vendor_id: string;
}

async function getModelVariants() {
  try {
    const res = await fetch(`${BASE_URL}/api/model-variants`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function ModelsPage() {
  const variants: ModelVariant[] = await getModelVariants();

  // Group by vendor
  const grouped = variants.reduce<Record<string, { vendorName: string; models: ModelVariant[] }>>((acc, v) => {
    if (!acc[v.vendor_id]) acc[v.vendor_id] = { vendorName: v.vendor_name, models: [] };
    acc[v.vendor_id].models.push(v);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-bark-dark mb-2">模型目录</h1>
        <p className="text-muted">浏览所有参赛 AI 模型</p>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-heading font-semibold text-bark mb-2">暂无模型</h3>
          <p className="text-muted">模型数据将在管理员录入后出现</p>
        </div>
      ) : (
        Object.entries(grouped).map(([vendorId, { vendorName, models }]) => (
          <div key={vendorId} className="mb-10">
            <h2 className="text-xl font-heading font-semibold text-bark mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-leaf rounded-full"></span>
              {vendorName}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {models.map((model) => (
                <Link key={model.id} href={`/models/${model.id}`} className="group">
                  <div className="card card-hover p-5 cursor-pointer">
                    <h3 className="font-heading font-semibold text-bark-dark group-hover:text-leaf-dark transition-colors mb-1">
                      {model.name}
                    </h3>
                    <p className="text-xs text-stone mb-2">{model.family_name}</p>
                    {model.description && (
                      <p className="text-sm text-muted line-clamp-2">{model.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
