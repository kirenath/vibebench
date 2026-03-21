"use client";

import { Leaf, Github, MessageSquare, Mail, ArrowUpRight, ChevronUp, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

export default function Footer() {
  const [status, setStatus] = useState<"operational" | "degraded" | "checking">("checking");

  const checkHealth = useCallback(async () => {
    setStatus("checking");
    const minDelay = new Promise((r) => setTimeout(r, 800));
    try {
      const [res] = await Promise.all([fetch("/api/health"), minDelay]);
      if (res.ok) {
        setStatus("operational");
      } else {
        setStatus("degraded");
      }
    } catch (e) {
      await minDelay;
      setStatus("degraded");
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);
  return (
    <footer className="border-t border-border/50 bg-gradient-to-b from-transparent to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </span>
              <span className="font-heading font-bold text-lg">VibeBench</span>
            </Link>
            <div className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm flex flex-col gap-3">
              <p>探索 AI 编程的美学界限，发现每个模型的独特风格。</p>
              <p>同一道前端题，让不同 AI 模型拿出各自的作品，横向看风格、方法和完成度。</p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/kirenath/vibebench"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-transform hover:scale-110 active:scale-95 flex items-center justify-center w-9 h-9 rounded-full bg-background/50 border border-border shadow-sm"
                title="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://linux.do"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-transform hover:scale-110 active:scale-95 flex items-center justify-center w-9 h-9 rounded-full bg-background/50 border border-border shadow-sm"
                title="Linux.do" 
              >
                <MessageSquare className="h-4 w-4" />
              </a>
              <a
                href="mailto:kirenath@tuta.io"
                className="text-muted-foreground hover:text-primary transition-transform hover:scale-110 active:scale-95 flex items-center justify-center w-9 h-9 rounded-full bg-background/50 border border-border shadow-sm"
                title="Email" 
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-2"></div>

          {/* Community Section */}
          <div className="lg:col-span-3">
            <h4 className="font-heading font-semibold mb-6 text-foreground">参与共建</h4>
            <div className="flex flex-col gap-6">
              <a
                href="https://github.com/kirenath/vibebench/pulls"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-1 transition-colors"
              >
                <span className="text-sm text-foreground/80 group-hover:text-primary flex items-center gap-1">
                  提交评测产物 <ArrowUpRight className="h-3 w-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </span>
                <span className="text-xs text-muted-foreground/70">通过 GitHub PR 提交题目、HTML 产物及元数据。</span>
              </a>
              <a
                href="https://github.com/kirenath/vibebench/discussions"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-1 transition-colors"
              >
                <span className="text-sm text-foreground/80 group-hover:text-primary flex items-center gap-1">
                  提议赛题方向 <ArrowUpRight className="h-3 w-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </span>
                <span className="text-xs text-muted-foreground/70">在 Discussion 提出新赛题想法，或请求测试新模型。</span>
              </a>
              <a
                href="https://linux.do"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-1 transition-colors"
              >
                <span className="text-sm text-foreground/80 group-hover:text-primary flex items-center gap-1">
                  参与社区讨论 <ArrowUpRight className="h-3 w-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </span>
                <span className="text-xs text-muted-foreground/70">前往 Linux.do 参与社区反馈与讨论。</span>
              </a>
              <a
                href="mailto:kirenath@tuta.io"
                className="group flex flex-col gap-1 transition-colors"
              >
                <span className="text-sm text-foreground/80 group-hover:text-primary flex items-center gap-1">
                  通过邮件联系 <ArrowUpRight className="h-3 w-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </span>
                <span className="text-xs text-muted-foreground/70">通过邮件发送提示词、素材授权或相关代码文件。</span>
              </a>
            </div>
          </div>

          {/* Resources & Credits Section */}
          <div className="lg:col-span-3">
            <h4 className="font-heading font-semibold mb-6 text-foreground">资源与致谢</h4>
            <div className="flex flex-col gap-6">
              <Link
                href="/faq"
                className="group flex flex-col gap-1 transition-colors"
              >
                <span className="text-sm text-foreground/80 group-hover:text-primary flex items-center gap-1">常见问题 <ChevronRight className="h-3 w-3 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></span>
                <span className="text-xs text-muted-foreground/70">解释评测边界、展示规则和人工修订标记。</span>
              </Link>
              <Link
                href="/changelog"
                className="group flex flex-col gap-1 transition-colors"
              >
                <span className="text-sm text-foreground/80 group-hover:text-primary flex items-center gap-1">更新日志 <ChevronRight className="h-3 w-3 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></span>
                <span className="text-xs text-muted-foreground/70">记录站点迭代、入口调整和公开信息更新。</span>
              </Link>
              <Link
                href="/powered-by"
                className="group flex flex-col gap-1 transition-colors"
              >
                <span className="text-sm text-foreground/80 group-hover:text-primary flex items-center gap-1">技术支持 <ChevronRight className="h-3 w-3 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></span>
                <span className="text-xs text-muted-foreground/70">驱动平台底层的技术栈与基础设施。</span>
              </Link>
              <Link
                href="/credits"
                className="group flex flex-col gap-1 transition-colors"
              >
                <span className="text-sm text-foreground/80 group-hover:text-primary flex items-center gap-1">特别鸣谢 <ChevronRight className="h-3 w-3 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" /></span>
                <span className="text-xs text-muted-foreground/70">感谢开源社区、初创素材授权者与反馈用户。</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 relative">
          <div className="absolute left-1/2 -translate-x-1/2 -top-5">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all hover:-translate-y-1 shadow-sm"
              aria-label="回到顶部"
            >
              <ChevronUp className="h-5 w-5" />
            </button>
          </div>
          
          <div className="pt-8 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-sm text-muted-foreground order-3 md:order-1 flex items-center gap-1.5 opacity-80">
            © {new Date().getFullYear()} VibeBench. 保留所有权利。
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground order-2 md:order-2 opacity-80">
            <Link href="/terms" className="hover:text-primary hover:underline underline-offset-4 transition-colors">服务条款</Link>
            <span className="w-1 h-1 rounded-full bg-border/80"></span>
            <Link href="/privacy" className="hover:text-primary hover:underline underline-offset-4 transition-colors">隐私政策</Link>
            <span className="w-1 h-1 rounded-full bg-border/80"></span>
            <Link href="/license" className="hover:text-primary hover:underline underline-offset-4 transition-colors">开源协议</Link>
          </div>

          <button
            onClick={checkHealth}
            className="flex items-center gap-3 text-sm text-muted-foreground order-1 md:order-3 bg-background/50 border border-border/50 px-4 py-2 rounded-full shadow-sm hover:bg-background active:scale-95 transition-all cursor-pointer select-none"
            title="点击重新检测系统状态"
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 transition-colors duration-500 ${status === 'operational' ? 'bg-emerald-400' : status === 'checking' ? 'bg-amber-400' : 'bg-red-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 transition-colors duration-500 ${status === 'operational' ? 'bg-emerald-500' : status === 'checking' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="grid font-medium tracking-wide">
              <span className={`col-start-1 row-start-1 transition-opacity duration-300 ${status === 'operational' ? 'opacity-100' : 'opacity-0'}`}>系统运行正常</span>
              <span className={`col-start-1 row-start-1 transition-opacity duration-300 ${status === 'checking' ? 'opacity-70' : 'opacity-0'}`}>正在检查系统状态...</span>
              <span className={`col-start-1 row-start-1 transition-opacity duration-300 ${status === 'degraded' ? 'opacity-100' : 'opacity-0'}`}>服务暂不可用</span>
            </span>
          </button>
        </div>
      </div>
      </div>
    </footer>
  );
}
