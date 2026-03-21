import { Leaf, Github } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </span>
              <span className="font-heading font-bold text-lg">VibeBench</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              围绕不同的前端挑战，收集不同 AI 模型的产出，并排对比效果，发现每个模型的独特风格。
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">浏览</h4>
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                首页
              </Link>
              <Link
                href="/challenges"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                赛题列表
              </Link>
              <Link
                href="/models"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                模型目录
              </Link>
              <Link
                href="/compare"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                展示对比
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">链接</h4>
            <div className="flex flex-col gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
              <Link
                href="/admin/login"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                管理后台
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} VibeBench. Built with ❤️ for the AI
          community.
        </div>
      </div>
    </footer>
  );
}
