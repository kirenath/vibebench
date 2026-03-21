"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Trophy,
  Cpu,
  Inbox,
  LogOut,
  Globe
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/challenges", icon: Trophy, label: "Challenges" },
    { href: "/admin/models", icon: Cpu, label: "Model Directory" },
    { href: "/admin/submissions", icon: Inbox, label: "Submissions" },
  ];

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background shadow-none hidden md:flex flex-col z-10">
        <div className="p-6 border-b">
          <Link href="/admin" className="flex items-center space-x-3 font-serif font-bold text-xl text-primary">
            <div className="bg-primary/10 text-primary p-2 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] transition-transform hover:scale-110">
              <Trophy className="w-5 h-5" />
            </div>
            <span>Admin Panel</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-full text-sm font-bold transition-all duration-300",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft hover:scale-105"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t space-y-2">
          <Link
            href="/"
            className="flex items-center space-x-3 px-4 py-3 rounded-full text-sm font-bold text-muted-foreground hover:bg-muted transition-all duration-300 hover:translate-x-1"
          >
            <Globe className="w-4 h-4" />
            <span>View Public Site</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-full text-sm font-bold text-destructive hover:bg-destructive/10 transition-all duration-300 hover:translate-x-1 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="bg-card rounded-[2rem] shadow-soft h-full border border-border/50 overflow-auto relative">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
          {children}
        </div>
      </main>
    </div>
  );
}
