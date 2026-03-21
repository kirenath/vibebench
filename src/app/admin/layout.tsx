'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Trophy, Cpu, FileCode, LogOut, Leaf } from 'lucide-react';

const navItems = [
  { href: '/admin/challenges', label: '赛题管理', icon: Trophy },
  { href: '/admin/models', label: '模型管理', icon: Cpu },
  { href: '/admin/submissions', label: '作品管理', icon: FileCode },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Login page doesn't get the admin layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-8)', textDecoration: 'none', color: 'var(--color-foreground)' }}>
          <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={16} color="white" />
          </span>
          <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '1.1rem' }}>VibeBench</span>
        </Link>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <Link href="/admin" className={pathname === '/admin' ? 'active' : ''}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className={pathname.startsWith(item.href) ? 'active' : ''}>
              <item.icon size={18} /> {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-8)' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              background: 'none', border: 'none',
              color: 'var(--color-destructive)',
              fontWeight: 500, cursor: 'pointer',
              fontFamily: "'Nunito', sans-serif",
              fontSize: 'var(--text-sm)',
              width: '100%',
            }}
          >
            <LogOut size={18} /> 退出登录
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
