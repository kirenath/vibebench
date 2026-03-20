"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then((d) => setStats(d.data));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      {stats && (
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: "Published Challenges", value: stats.published_challenges },
            { label: "Active Models", value: stats.active_model_variants },
            { label: "Published Submissions", value: stats.published_submissions },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-3xl font-bold text-brand-600">{item.value}</p>
              <p className="text-sm text-gray-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
