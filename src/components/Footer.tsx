import { Leaf, Github, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-gradient-to-b from-transparent to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-5">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </span>
              <span className="font-heading font-bold text-lg">VibeBench</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm">
              探索 AI 编程的美学界限，发现每个模型的独特风格。
            </p>
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
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-3"></div>

          {/* Community Section */}
          <div className="lg:col-span-2">
            <h4 className="font-heading font-semibold mb-6 text-foreground">参与共建</h4>
            <div className="flex flex-col gap-4">
              <a
                href="https://github.com/kirenath/vibebench/pulls"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                提交赛题
              </a>
              <a
                href="https://github.com/kirenath/vibebench/discussions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                请求模型
              </a>
              <a
                href="https://linux.do"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                参与讨论
              </a>
              <a
                href="mailto:kirenath@tuta.io"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                联系我们
              </a>
            </div>
          </div>

          {/* Resources & Credits Section */}
          <div className="lg:col-span-2">
            <h4 className="font-heading font-semibold mb-6 text-foreground">资源与致谢</h4>
            <div className="flex flex-col gap-4">
              <Link
                href="/faq"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                常见问题
              </Link>
              <Link
                href="/changelog"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                更新日志
              </Link>
              <Link
                href="/api-docs"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                开放 API
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary uppercase tracking-wider translate-y-[0.5px]">
                  Beta
                </span>
              </Link>
              <Link
                href="/powered-by"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                技术支持
              </Link>
              <Link
                href="/credits"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                特别鸣谢
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-sm text-muted-foreground order-3 md:order-1 flex items-center gap-1.5 opacity-80">
            © {new Date().getFullYear()} VibeBench. All rights reserved.
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground order-2 md:order-2 opacity-80">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <span className="w-1 h-1 rounded-full bg-border/80"></span>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <span className="w-1 h-1 rounded-full bg-border/80"></span>
            <Link href="/license" className="hover:text-primary transition-colors">License</Link>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground order-1 md:order-3 bg-background/50 border border-border/50 px-4 py-2 rounded-full shadow-sm hover:bg-background transition-colors">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium tracking-wide">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
