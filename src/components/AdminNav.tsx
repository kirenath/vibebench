"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Leaf,
  Trophy,
  Cpu,
  FileCode2,
  LogOut,
} from "lucide-react";

const links = [
  { href: "/admin/challenges", label: "赛题管理", icon: Trophy },
  { href: "/admin/models", label: "模型管理", icon: Cpu },
  { href: "/admin/submissions", label: "作品管理", icon: FileCode2 },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="bg-white/70 backdrop-blur-md border-b border-border/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </span>
            <span className="font-heading font-bold text-sm">
              VibeBench Admin
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="btn-ghost btn-sm !h-9 !px-4 text-sm text-muted-foreground"
        >
          <LogOut className="h-4 w-4 mr-1" />
          登出
        </button>
      </div>
    </div>
  );
}
