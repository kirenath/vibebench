'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Leaf, Lock } from 'lucide-react';
import { Suspense } from 'react';

function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '登录失败');
        return;
      }

      const redirect = searchParams.get('redirect') || '/admin';
      router.push(redirect);
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        background: 'var(--color-background)',
      }}
    >
      <div className="card" style={{ maxWidth: 400, width: '100%', padding: 'var(--space-10)', textAlign: 'center' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 'var(--space-8)' }}>
          <span style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={22} color="white" />
          </span>
          <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '1.5rem' }}>VibeBench</span>
        </div>

        <h2 style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-2xl)' }}>管理后台</h2>
        <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-8)' }}>请输入管理员密码</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted-foreground)' }} />
              <input
                type="password"
                className="input"
                placeholder="管理员密码"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingLeft: 44 }}
                required
                autoFocus
              />
            </div>
          </div>

          {error && (
            <p style={{ color: 'var(--color-destructive)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <Link
          href="/"
          style={{ display: 'block', marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-muted-foreground)' }}
        >
          ← 返回首页
        </Link>
      </div>
    </div>
  );
}

import Link from 'next/link';

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
