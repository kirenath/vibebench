import Link from "next/link";

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/stats`, { cache: "no-store" });
    if (!res.ok) return { challenges: 0, models: 0, submissions: 0 };
    return await res.json();
  } catch {
    return { challenges: 0, models: 0, submissions: 0 };
  }
}

async function getChallenges() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/challenges`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  cover_image: string | null;
  published_at: string;
}

export default async function HomePage() {
  const [stats, challenges] = await Promise.all([getStats(), getChallenges()]);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-parchment via-cream to-sand-light">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235C4A3A'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center relative">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-success-light text-leaf-dark text-sm font-medium rounded-full border border-leaf-light">
            <span className="w-2 h-2 bg-leaf rounded-full animate-pulse"></span>
            AI Vibe Coding 横评平台
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-bark-dark leading-tight mb-6">
            同一道题，让不同 AI 来做<br />
            <span className="text-leaf">看看谁 vibe 得最好</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            围绕同一道前端挑战题，收集不同 AI 模型的产出。浏览、切换 phase、并排对比作品效果，发现最有 vibe 的 AI 选手。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="#challenges" className="btn-primary text-base px-8 py-3">
              浏览赛题 →
            </Link>
            <Link href="/compare" className="btn-secondary text-base px-8 py-3">
              开始对比
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "赛题", value: stats.challenges, icon: "📋" },
            { label: "参赛模型", value: stats.models, icon: "🤖" },
            { label: "作品", value: stats.submissions, icon: "🎨" },
          ].map((stat) => (
            <div key={stat.label} className="card p-5 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-3xl font-heading font-bold text-bark-dark">{stat.value}</div>
              <div className="text-sm text-muted mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Challenge Grid */}
      <section id="challenges" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-heading font-bold text-bark-dark mb-3">赛题列表</h2>
          <p className="text-muted">选择一个赛题，查看不同 AI 模型的表现</p>
        </div>

        {challenges.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-heading font-semibold text-bark mb-2">暂无赛题</h3>
            <p className="text-muted">赛题将在管理员发布后出现在这里</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge: Challenge) => (
              <Link key={challenge.id} href={`/challenges/${challenge.id}`} className="group">
                <div className="card card-hover overflow-hidden cursor-pointer">
                  <div className="aspect-[16/10] bg-gradient-to-br from-sand-light to-cream-dark flex items-center justify-center">
                    {challenge.cover_image ? (
                      <img src={challenge.cover_image} alt={challenge.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl opacity-30">🎯</span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-heading font-semibold text-bark-dark group-hover:text-leaf-dark transition-colors mb-2">
                      {challenge.title}
                    </h3>
                    {challenge.description && (
                      <p className="text-sm text-muted line-clamp-2">{challenge.description}</p>
                    )}
                    <div className="mt-3 text-xs text-stone">
                      {challenge.published_at && new Date(challenge.published_at).toLocaleDateString("zh-CN")}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
