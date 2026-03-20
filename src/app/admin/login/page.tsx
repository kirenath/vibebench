"use client";

import { useState, FormEvent } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
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
      if (!res.ok) {
        setError(data.error?.message || "Login failed");
        return;
      }
      window.location.href = "/admin";
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-organic-bg relative">
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-organic-primary/10 rounded-blob blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-organic-secondary/10 rounded-blob blur-3xl -z-10" />
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-heading font-bold text-center text-organic-fg mb-8">Admin Login</h1>
        <form onSubmit={handleSubmit} className="bg-organic-card p-8 rounded-organic border border-organic-border/50 shadow-float">
          <label className="block text-sm font-semibold text-organic-fg mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-organic-border rounded-full h-12 px-5 mb-5 text-sm bg-white/50 focus-visible:ring-2 focus-visible:ring-organic-primary/30 ring-offset-2 outline-none transition-all duration-300"
            required
          />
          {error && <p className="text-organic-destructive text-sm mb-4 font-medium">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-organic-primary text-organic-primary-fg rounded-full h-12 text-sm font-bold hover:scale-105 hover:shadow-[0_6px_24px_-4px_rgba(93,112,82,0.25)] active:scale-95 disabled:opacity-50 transition-all duration-300 shadow-soft"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
