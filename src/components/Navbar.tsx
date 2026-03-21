'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Leaf } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      style={{
        position: 'sticky',
        top: '16px',
        zIndex: 100,
        margin: '0 16px',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '9999px',
          border: '1px solid rgba(222,216,207,0.5)',
          boxShadow: '0 4px 20px -2px rgba(93,112,82,0.1)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '60px',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            color: 'var(--color-foreground)',
          }}
        >
          <span
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Leaf size={18} color="white" />
          </span>
          <span
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 700,
              fontSize: '1.25rem',
            }}
          >
            VibeBench
          </span>
        </Link>

        {/* Desktop Nav */}
        <div
          className="hide-mobile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
          }}
        >
          <Link href="/" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-foreground)' }}>
            首页
          </Link>
          <Link href="/challenges" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-foreground)' }}>
            赛题
          </Link>
          <Link href="/models" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-foreground)' }}>
            模型
          </Link>
          <Link href="/compare" className="btn btn-primary btn-sm">
            横评对比
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="hide-desktop"
          onClick={() => setOpen(!open)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: 'var(--color-foreground)',
          }}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div
          style={{
            maxWidth: '1280px',
            margin: '8px auto 0',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(12px)',
            borderRadius: '2rem',
            border: '1px solid rgba(222,216,207,0.5)',
            boxShadow: '0 10px 40px -10px rgba(93,112,82,0.15)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <Link href="/" onClick={() => setOpen(false)} style={{ fontWeight: 600, padding: '8px 0' }}>首页</Link>
          <Link href="/challenges" onClick={() => setOpen(false)} style={{ fontWeight: 600, padding: '8px 0' }}>赛题</Link>
          <Link href="/models" onClick={() => setOpen(false)} style={{ fontWeight: 600, padding: '8px 0' }}>模型</Link>
          <Link href="/compare" onClick={() => setOpen(false)} className="btn btn-primary" style={{ textAlign: 'center' }}>横评对比</Link>
        </div>
      )}
    </nav>
  );
}
