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
    <aside className="w-56 shrink-0 border-r border-gray-200 bg-gray-50 min-h-screen p-4">
      <Link href="/admin" className="text-lg font-bold text-brand-600 mb-6 block">
        Admin
      </Link>
      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-brand-500 text-white font-medium"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 pt-4 border-t border-gray-200">
        <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">
          &larr; Back to site
        </Link>
      </div>
    </aside>
  );
}
