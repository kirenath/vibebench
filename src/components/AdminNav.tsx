"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Leaf,
  Trophy,
  Cpu,
  FileCode2,
  LogOut,
  Shield,
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
    <div className="bg-[#3D4D35] sticky top-0 z-40 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </span>
            <span className="font-heading font-bold text-sm text-primary-foreground">
              VibeBench
            </span>
            <span className="flex items-center gap-1 bg-white/15 text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              <Shield className="h-3 w-3" />
              Admin
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
                      ? "bg-white/20 text-white"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
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
          className="inline-flex items-center justify-center rounded-full bg-transparent text-white/60 font-medium
                     px-4 h-9 text-sm hover:bg-white/10 hover:text-white transition-all duration-300"
        >
          <LogOut className="h-4 w-4 mr-1" />
          登出
        </button>
      </div>
    </div>
  );
}
