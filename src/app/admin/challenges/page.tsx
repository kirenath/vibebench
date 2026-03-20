"use client";

import { useEffect, useState } from "react";

interface Challenge {
  id: string;
  title: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id: "", title: "", description: "", rules_markdown: "", prompt_markdown: "",
    is_published: false, sort_order: 0,
  });

  useEffect(() => { loadChallenges(); }, []);

  async function loadChallenges() {
    const res = await fetch("/api/challenges?all=true");
    const data = await res.json();
    setChallenges(data.data || []);
  }

  async function handleCreate() {
    await fetch("/api/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ id: "", title: "", description: "", rules_markdown: "", prompt_markdown: "", is_published: false, sort_order: 0 });
    loadChallenges();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this challenge?")) return;
    await fetch(`/api/challenges/${id}`, { method: "DELETE" });
    loadChallenges();
  }

  async function togglePublish(c: Challenge) {
    await fetch(`/api/challenges/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !c.is_published }),
    });
    loadChallenges();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-heading font-bold text-organic-fg">Challenges</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-organic-primary text-organic-primary-fg px-6 py-2.5 rounded-full text-sm font-bold hover:scale-105 hover:shadow-[0_6px_24px_-4px_rgba(93,112,82,0.25)] active:scale-95 transition-all duration-300 shadow-soft"
        >
          {showForm ? "Cancel" : "New Challenge"}
        </button>
      </div>

      {showForm && (
        <div className="bg-organic-card border border-organic-border/50 rounded-organic p-6 mb-8 space-y-4 shadow-soft">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-organic-fg mb-1.5">ID (slug)</label>
              <input className="w-full border border-organic-border rounded-full h-10 px-4 text-sm bg-white/50 focus-visible:ring-2 focus-visible:ring-organic-primary/30 ring-offset-2 outline-none transition-all duration-300" value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-organic-fg mb-1.5">Title</label>
              <input className="w-full border border-organic-border rounded-full h-10 px-4 text-sm bg-white/50 focus-visible:ring-2 focus-visible:ring-organic-primary/30 ring-offset-2 outline-none transition-all duration-300" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-organic-fg mb-1.5">Description</label>
            <textarea className="w-full border border-organic-border rounded-2xl px-4 py-3 text-sm bg-white/50 focus-visible:ring-2 focus-visible:ring-organic-primary/30 ring-offset-2 outline-none transition-all duration-300" rows={2} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-organic-fg mb-1.5">Rules (Markdown)</label>
            <textarea className="w-full border border-organic-border rounded-2xl px-4 py-3 text-sm font-mono bg-white/50 focus-visible:ring-2 focus-visible:ring-organic-primary/30 ring-offset-2 outline-none transition-all duration-300" rows={4} value={form.rules_markdown}
              onChange={(e) => setForm({ ...form, rules_markdown: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-organic-fg mb-1.5">Prompt (Markdown)</label>
            <textarea className="w-full border border-organic-border rounded-2xl px-4 py-3 text-sm font-mono bg-white/50 focus-visible:ring-2 focus-visible:ring-organic-primary/30 ring-offset-2 outline-none transition-all duration-300" rows={4} value={form.prompt_markdown}
              onChange={(e) => setForm({ ...form, prompt_markdown: e.target.value })} />
          </div>
          <button onClick={handleCreate}
            className="bg-organic-primary text-organic-primary-fg px-8 py-2.5 rounded-full text-sm font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-soft">
            Create
          </button>
        </div>
      )}

      <div className="bg-organic-card rounded-organic border border-organic-border/50 overflow-hidden shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-organic-muted/50 text-left">
            <tr>
              <th className="px-5 py-3.5 font-semibold text-organic-muted-fg">ID</th>
              <th className="px-5 py-3.5 font-semibold text-organic-muted-fg">Title</th>
              <th className="px-5 py-3.5 font-semibold text-organic-muted-fg">Status</th>
              <th className="px-5 py-3.5 font-semibold text-organic-muted-fg">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-organic-border/30">
            {challenges.map((c) => (
              <tr key={c.id} className="hover:bg-organic-muted/20 transition-colors duration-200">
                <td className="px-5 py-3.5 font-mono text-organic-muted-fg">{c.id}</td>
                <td className="px-5 py-3.5 text-organic-fg font-medium">{c.title}</td>
                <td className="px-5 py-3.5">
                  <button onClick={() => togglePublish(c)}
                    className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all duration-300 ${c.is_published ? "bg-organic-primary/10 text-organic-primary" : "bg-organic-muted text-organic-muted-fg"}`}>
                    {c.is_published ? "Published" : "Draft"}
                  </button>
                </td>
                <td className="px-5 py-3.5">
                  <button onClick={() => handleDelete(c.id)}
                    className="text-xs text-organic-destructive hover:text-organic-destructive/80 font-bold transition-colors duration-300">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
