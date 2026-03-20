"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then((d) => setStats(d.data));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold text-organic-fg mb-8">Dashboard</h1>
      {stats && (
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: "Published Challenges", value: stats.published_challenges },
            { label: "Active Models", value: stats.active_model_variants },
            { label: "Published Submissions", value: stats.published_submissions },
          ].map((item) => (
            <div key={item.label} className="bg-organic-card rounded-organic border border-organic-border/50 p-8 shadow-soft hover:-translate-y-1 hover:shadow-soft-hover transition-all duration-300">
              <p className="text-4xl font-heading font-bold text-organic-primary">{item.value}</p>
              <p className="text-sm text-organic-muted-fg mt-2 font-medium">{item.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
