"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, LogIn } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "登录失败");
        return;
      }
      router.push("/admin/challenges");
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
            <Leaf className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-bold">管理后台</h1>
          <p className="text-sm text-muted-foreground mt-1">
            请输入管理员密码登录
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="label mb-2 block">
              密码
            </label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入管理员密码"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-2xl p-3 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? "登录中..." : "登录"}
            <LogIn className="ml-2 h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
