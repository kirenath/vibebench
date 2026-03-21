"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const adminNavItems = [
  { href: "/admin/challenges", label: "赛题管理", icon: "📋" },
  { href: "/admin/models", label: "模型管理", icon: "🤖" },
  { href: "/admin/submissions", label: "作品管理", icon: "🎨" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  // Skip auth check on login page
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) { setVerified(true); return; }
    // Quick auth check by trying to fetch admin-only data
    fetch("/api/challenges?all=true")
      .then(r => {
        if (r.ok) setVerified(true);
        else router.push("/admin/login");
      })
      .catch(() => router.push("/admin/login"));
  }, [isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;

  if (!verified) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="skeleton w-12 h-12 rounded-full"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-60 bg-bark-dark text-cream shrink-0 hidden lg:flex flex-col">
        <div className="p-5 border-b border-bark">
          <h2 className="font-heading font-bold text-lg">管理后台</h2>
          <p className="text-xs text-sand-light mt-0.5 opacity-70">VibeBench Admin</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {adminNavItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                pathname.startsWith(item.href)
                  ? "bg-leaf text-white"
                  : "text-sand-light hover:bg-bark-light/30 hover:text-cream"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-bark">
          <button onClick={handleLogout} className="text-sm text-sand-light hover:text-cream transition-colors">
            退出登录
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-cream">
        {/* Mobile nav */}
        <div className="lg:hidden flex items-center gap-2 p-3 bg-bark-dark overflow-x-auto">
          {adminNavItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                pathname.startsWith(item.href) ? "bg-leaf text-white" : "bg-bark text-sand-light"
              }`}
            >
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="ml-auto text-xs text-sand-light whitespace-nowrap">退出</button>
        </div>
        <div className="p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
