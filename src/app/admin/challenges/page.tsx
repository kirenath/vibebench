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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Challenges</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-600"
        >
          {showForm ? "Cancel" : "New Challenge"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID (slug)</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rules (Markdown)</label>
            <textarea className="w-full border rounded-lg px-3 py-2 text-sm font-mono" rows={4} value={form.rules_markdown}
              onChange={(e) => setForm({ ...form, rules_markdown: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prompt (Markdown)</label>
            <textarea className="w-full border rounded-lg px-3 py-2 text-sm font-mono" rows={4} value={form.prompt_markdown}
              onChange={(e) => setForm({ ...form, prompt_markdown: e.target.value })} />
          </div>
          <button onClick={handleCreate}
            className="bg-brand-500 text-white px-6 py-2 rounded-lg text-sm hover:bg-brand-600">
            Create
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-500">ID</th>
              <th className="px-4 py-3 font-medium text-gray-500">Title</th>
              <th className="px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {challenges.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-mono text-gray-600">{c.id}</td>
                <td className="px-4 py-3 text-gray-900">{c.title}</td>
                <td className="px-4 py-3">
                  <button onClick={() => togglePublish(c)}
                    className={`text-xs px-2 py-1 rounded ${c.is_published ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                    {c.is_published ? "Published" : "Draft"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(c.id)}
                    className="text-xs text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
