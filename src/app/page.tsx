export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      {/* ── Hero Section with Blob Backgrounds ── */}
      <section className="relative mb-24 py-16 text-center">
        {/* Decorative blobs */}
        <div className="organic-blob-soft absolute -left-32 -top-16 h-72 w-72 bg-moss/5 blur-3xl" />
        <div className="organic-blob absolute -bottom-20 -right-24 h-80 w-80 bg-terracotta/5 blur-3xl" />

        <div className="relative mx-auto max-w-4xl">
          <h1
            className="text-5xl font-bold tracking-tight text-deep-loam md:text-7xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            VibeBench
          </h1>
          <p className="mt-6 text-lg text-dried-grass md:text-xl">
            同一道前端题，让不同 AI 来做，看看各自 vibe 出了什么
          </p>
          <p className="mt-3 text-sm text-dried-grass/70">
            不是跑分 Benchmark，是一个把不同 AI 手艺摆到一起看的展示橱窗
          </p>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="mb-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 md:gap-12">
          <div className="grain-overlay rounded-[2rem] border border-timber/50 bg-card p-8 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
            <div
              className="text-4xl font-bold text-moss"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              —
            </div>
            <div className="mt-2 text-sm font-medium text-dried-grass">已发布赛题</div>
          </div>
          <div className="grain-overlay rounded-[2rem] border border-timber/50 bg-card p-8 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
            <div
              className="text-4xl font-bold text-terracotta"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              —
            </div>
            <div className="mt-2 text-sm font-medium text-dried-grass">模型版本</div>
          </div>
          <div className="grain-overlay rounded-[2rem] border border-timber/50 bg-card p-8 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
            <div
              className="text-4xl font-bold text-moss"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              —
            </div>
            <div className="mt-2 text-sm font-medium text-dried-grass">已发布作品</div>
          </div>
        </div>
      </section>

      {/* ── Challenge List Placeholder ── */}
      <section className="mb-20">
        <h2
          className="mb-8 text-3xl font-semibold text-deep-loam md:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          赛题列表
        </h2>
        <div className="grain-overlay rounded-[2rem] border border-timber/50 bg-card p-16 text-center shadow-soft">
          <p className="text-dried-grass">暂无已发布赛题，请通过 Admin 后台添加</p>
        </div>
      </section>

      {/* ── Quick Links ── */}
      <section className="relative py-12">
        {/* Decorative blob */}
        <div className="organic-blob-alt absolute right-0 bottom-0 h-64 w-64 bg-terracotta/5 blur-3xl" />

        <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2">
          <a
            href="/compare"
            className="group grain-overlay rounded-[2rem] border border-timber/50 bg-card p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
          >
            <h3
              className="text-xl font-semibold text-deep-loam transition-colors group-hover:text-moss"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              横评对比
            </h3>
            <p className="mt-2 text-sm text-dried-grass">
              选择赛题和模型，并排对比不同 AI 的产出效果
            </p>
          </a>
          <a
            href="/models"
            className="group grain-overlay rounded-[2rem] border border-timber/50 bg-card p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
          >
            <h3
              className="text-xl font-semibold text-deep-loam transition-colors group-hover:text-moss"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              模型目录
            </h3>
            <p className="mt-2 text-sm text-dried-grass">
              按厂商、产品线浏览已注册的 AI 模型
            </p>
          </a>
        </div>
      </section>
    </div>
  );
}
