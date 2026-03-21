import Link from "next/link";
import { Leaf } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-4 z-50 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-full bg-white/70 backdrop-blur-md border border-border/50 shadow-soft px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo icon always visible, text hidden on small screens */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="h-9 w-9 rounded-full bg-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="hidden md:inline font-heading font-bold text-lg text-foreground">
            VibeBench
          </span>
        </Link>

        {/* Nav links - always visible */}
        <div className="flex items-center gap-1">
          <Link href="/" className="btn-ghost btn-sm !px-3 sm:!px-4 !h-9 text-sm">
            首页
          </Link>
          <Link href="/challenges" className="btn-ghost btn-sm !px-3 sm:!px-4 !h-9 text-sm">
            赛题
          </Link>
          <Link href="/models" className="btn-ghost btn-sm !px-3 sm:!px-4 !h-9 text-sm">
            模型
          </Link>
          <Link href="/compare" className="btn-ghost btn-sm !px-3 sm:!px-4 !h-9 text-sm">
            <span className="md:hidden">对比</span>
            <span className="hidden md:inline">横评对比</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
