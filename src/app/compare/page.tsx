"use client";

import Link from "next/link";
import { ArrowLeft, Columns2, Sparkles, Shuffle } from "lucide-react";

export default function CompareGatewayPage() {
  return (
    <div className="section pt-32 pb-24">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-12"
        >
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </Link>
        
        <div className="text-center mb-16">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            模型横评
          </h1>
          <p className="text-muted-foreground text-lg">
            请选择您想要进行的对比模式
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1: Blind Eval */}
          <Link href="/eval" className="group relative block h-full">
            <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-xl group-hover:bg-primary/20 transition-colors duration-500"></div>
            <div className="relative h-full bg-card border border-border/50 rounded-3xl p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-lg flex flex-col items-center text-center">
              <div className="h-16 w-16 mb-6 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold mb-3">盲评挑战</h2>
              <p className="text-muted-foreground mb-6">
                匿名 1v1 对比，基于作品质量投票。投票后揭晓模型身份，收集最客观的偏好数据。
              </p>
              <div className="mt-auto px-6 py-2 rounded-full bg-primary text-primary-foreground font-semibold opacity-90 group-hover:opacity-100 transition-opacity">
                开始盲评
              </div>
            </div>
          </Link>

          {/* Card 2: Manual Compare */}
          <Link href="/compare/manual" className="group relative block h-full">
            <div className="absolute inset-0 bg-muted/50 rounded-3xl blur-xl group-hover:bg-muted transition-colors duration-500"></div>
            <div className="relative h-full bg-card border border-border/50 rounded-3xl p-8 hover:border-border transition-all duration-300 hover:shadow-lg flex flex-col items-center text-center">
              <div className="h-16 w-16 mb-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:scale-110 transition-transform duration-300">
                <Columns2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold mb-3">展示对比</h2>
              <p className="text-muted-foreground mb-6">
                明牌 1v1 对比。选择同一赛题下两个模型的作品并排展示，方便细节对照。
              </p>
              <div className="mt-auto px-6 py-2 rounded-full bg-secondary text-secondary-foreground font-semibold opacity-90 group-hover:opacity-100 transition-opacity">
                手动选择
              </div>
            </div>
          </Link>

          {/* Card 3: Freestyle Compare */}
          <Link href="/compare/freestyle" className="group relative block h-full">
            <div className="absolute inset-0 bg-accent/30 rounded-3xl blur-xl group-hover:bg-accent/50 transition-colors duration-500"></div>
            <div className="relative h-full bg-card border border-border/50 rounded-3xl p-8 hover:border-accent/30 transition-all duration-300 hover:shadow-lg flex flex-col items-center text-center">
              <div className="h-16 w-16 mb-6 rounded-full bg-accent/20 flex items-center justify-center text-accent-foreground group-hover:scale-110 transition-transform duration-300">
                <Shuffle className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold mb-3">自由对比</h2>
              <p className="text-muted-foreground mb-6">
                无限制对比。跨赛题、跨 Phase，甚至同模型不同作品，任意组合并排查看。
              </p>
              <div className="mt-auto px-6 py-2 rounded-full bg-accent text-accent-foreground font-semibold opacity-90 group-hover:opacity-100 transition-opacity">
                自由选择
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
