import { Leaf, Github } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-border)',
        padding: 'var(--space-12) 0',
        marginTop: 'var(--space-16)',
        background: 'var(--color-muted)',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-6)',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Leaf size={16} color="white" />
            </span>
            <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '1rem' }}>
              VibeBench
            </span>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted-foreground)' }}>首页</Link>
            <Link href="/challenges" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted-foreground)' }}>赛题</Link>
            <Link href="/models" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted-foreground)' }}>模型</Link>
            <Link href="/compare" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted-foreground)' }}>横评对比</Link>
          </div>

          {/* Social */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-muted-foreground)' }}
            aria-label="GitHub"
          >
            <Github size={20} />
          </a>

          {/* Copyright */}
          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-muted-foreground)',
              margin: 0,
            }}
          >
            © {new Date().getFullYear()} VibeBench. 同一道前端题，让不同 AI 来做，看看谁 vibe 得最好。
          </p>
        </div>
      </div>
    </footer>
  );
}
