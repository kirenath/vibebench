"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/challenges", label: "Challenges" },
  { href: "/admin/models", label: "Models" },
  { href: "/admin/submissions", label: "Submissions" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-organic-border/50 bg-organic-muted/30 min-h-screen p-5">
      <Link href="/admin" className="flex items-center gap-2 mb-8">
        <span className="h-8 w-8 rounded-full bg-organic-primary flex items-center justify-center text-white text-sm font-bold font-heading">A</span>
        <span className="text-lg font-bold font-heading text-organic-primary">Admin</span>
      </Link>
      <nav className="flex flex-col gap-1.5">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                active
                  ? "bg-organic-primary text-organic-primary-fg shadow-soft"
                  : "text-organic-muted-fg hover:bg-organic-primary/10 hover:text-organic-primary"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 pt-4 border-t border-organic-border/50 flex flex-col gap-2">
        <Link href="/" className="text-xs text-organic-muted-fg hover:text-organic-primary transition-colors duration-300 font-medium">
          &larr; Back to site
        </Link>
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/admin/login";
          }}
          className="text-xs text-organic-muted-fg hover:text-organic-destructive transition-colors duration-300 font-medium text-left"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
