"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.success) {
        window.location.href = "/admin";
      } else {
        setError(data.error || "登录失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h2
        className="mb-8 text-center text-2xl font-semibold text-deep-loam"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        管理员登录
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-bark">
            密码
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full rounded-full border border-timber bg-white/50 px-5 text-sm text-foreground transition-all focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none"
            required
          />
        </div>
        {error && (
          <p className="text-sm font-medium text-burnt-sienna">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-full bg-moss px-8 text-sm font-semibold text-pale-mist shadow-soft transition-all duration-300 hover:scale-105 hover:shadow-[0_6px_24px_-4px_rgba(93,112,82,0.25)] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? "登录中..." : "登录"}
        </button>
      </form>
    </div>
  );
}
