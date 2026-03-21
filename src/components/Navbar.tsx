"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Leaf } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-4 z-50 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-full bg-white/70 backdrop-blur-md border border-border/50 shadow-soft px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="h-9 w-9 rounded-full bg-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="font-heading font-bold text-lg text-foreground">
            VibeBench
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/" className="btn-ghost btn-sm !px-4 !h-9 text-sm">
            首页
          </Link>
          <Link
            href="/challenges"
            className="btn-ghost btn-sm !px-4 !h-9 text-sm"
          >
            赛题
          </Link>
          <Link
            href="/models"
            className="btn-ghost btn-sm !px-4 !h-9 text-sm"
          >
            模型
          </Link>
          <Link
            href="/compare"
            className="btn-ghost btn-sm !px-4 !h-9 text-sm"
          >
            横评对比
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-full hover:bg-primary/10 transition-colors duration-300"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? (
            <X className="h-5 w-5 text-foreground" />
          ) : (
            <Menu className="h-5 w-5 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mt-2 rounded-[2rem] bg-white/90 backdrop-blur-md border border-border/50 shadow-float p-6 flex flex-col gap-2">
          <Link
            href="/"
            className="btn-ghost !justify-start !px-4"
            onClick={() => setOpen(false)}
          >
            首页
          </Link>
          <Link
            href="/challenges"
            className="btn-ghost !justify-start !px-4"
            onClick={() => setOpen(false)}
          >
            赛题
          </Link>
          <Link
            href="/models"
            className="btn-ghost !justify-start !px-4"
            onClick={() => setOpen(false)}
          >
            模型
          </Link>
          <Link
            href="/compare"
            className="btn-ghost !justify-start !px-4"
            onClick={() => setOpen(false)}
          >
            横评对比
          </Link>
        </div>
      )}
    </nav>
  );
}
