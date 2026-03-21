"use client";

import { useState, useEffect } from "react";
import AdminNav from "@/components/AdminNav";
import { Plus, Pencil, Trash2, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  rules_markdown: string | null;
  prompt_markdown: string | null;
  is_published: boolean;
  sort_order: number;
  submission_count: string;
}

interface Phase {
  id: string;
  phase_key: string;
  phase_label: string;
  sort_order: number;
  is_default: boolean;
}

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [form, setForm] = useState({
    id: "", title: "", description: "", rules_markdown: "",
    prompt_markdown: "", is_published: false, sort_order: 0,
  });
  const [phaseForm, setPhaseForm] = useState({
    phase_key: "", phase_label: "", sort_order: 0, is_default: false,
  });

  const load = () => {
    fetch("/api/challenges?all=true")
      .then((r) => r.json())
      .then((d) => setChallenges(d.data || []))
      .catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const loadPhases = (challengeId: string) => {
    fetch(`/api/challenges/${challengeId}/phases`)
      .then((r) => r.json())
      .then((d) => setPhases(d.data || []))
      .catch(() => {});
  };

  const handleSave = async () => {
    const method = editId ? "PUT" : "POST";
    const url = editId ? `/api/challenges/${editId}` : "/api/challenges";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setEditId(null);
    setForm({ id: "", title: "", description: "", rules_markdown: "", prompt_markdown: "", is_published: false, sort_order: 0 });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确认删除？")) return;
    await fetch(`/api/challenges/${id}`, { method: "DELETE" });
    load();
  };

  const handleTogglePublish = async (c: Challenge) => {
    await fetch(`/api/challenges/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !c.is_published }),
    });
    load();
  };

  const handleEdit = (c: Challenge) => {
    setEditId(c.id);
    setForm({
      id: c.id, title: c.title, description: c.description || "",
      rules_markdown: c.rules_markdown || "", prompt_markdown: c.prompt_markdown || "",
      is_published: c.is_published, sort_order: c.sort_order,
    });
    setShowForm(true);
  };

  const handleAddPhase = async (challengeId: string) => {
    if (!phaseForm.phase_key || !phaseForm.phase_label) return;
    await fetch(`/api/challenges/${challengeId}/phases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(phaseForm),
    });
    setPhaseForm({ phase_key: "", phase_label: "", sort_order: 0, is_default: false });
    loadPhases(challengeId);
  };

  return (
    <div>
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-3xl font-bold">赛题管理</h1>
          <button
            onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ id: "", title: "", description: "", rules_markdown: "", prompt_markdown: "", is_published: false, sort_order: 0 }); }}
            className="btn-primary btn-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            新建赛题
          </button>
        </div>

        {showForm && (
          <div className="card p-6 mb-8">
            <h2 className="font-heading font-bold text-lg mb-4">
              {editId ? "编辑赛题" : "新建赛题"}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label mb-1 block">ID (slug)</label>
                <input className="input" value={form.id} disabled={!!editId}
                  onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="receipt" />
              </div>
              <div>
                <label className="label mb-1 block">标题</label>
                <input className="input" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="热敏小票物理模拟" />
              </div>
              <div className="md:col-span-2">
                <label className="label mb-1 block">描述</label>
                <textarea className="textarea" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="label mb-1 block">规则说明 (Markdown)</label>
                <textarea className="textarea min-h-[200px]" value={form.rules_markdown}
                  onChange={(e) => setForm({ ...form, rules_markdown: e.target.value })} />
              </div>
              <div>
                <label className="label mb-1 block">Prompt (Markdown)</label>
                <textarea className="textarea min-h-[200px]" value={form.prompt_markdown}
                  onChange={(e) => setForm({ ...form, prompt_markdown: e.target.value })} />
              </div>
              <div>
                <label className="label mb-1 block">排序</label>
                <input className="input" type="number" value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" id="published" checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="h-4 w-4" />
                <label htmlFor="published" className="label">公开发布</label>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleSave} className="btn-primary btn-sm">保存</button>
              <button onClick={() => setShowForm(false)} className="btn-ghost btn-sm">取消</button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {challenges.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => {
                    if (expandedId === c.id) { setExpandedId(null); }
                    else { setExpandedId(c.id); loadPhases(c.id); }
                  }} className="text-muted-foreground hover:text-primary transition-colors">
                    {expandedId === c.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                  <div>
                    <h3 className="font-heading font-bold">{c.title}</h3>
                    <p className="text-xs text-muted-foreground">{c.id} · {c.submission_count} 作品</p>
                  </div>
                  {c.is_published ? (
                    <span className="badge-primary text-xs">已发布</span>
                  ) : (
                    <span className="badge-muted text-xs">草稿</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleTogglePublish(c)} className="btn-ghost btn-sm !h-8 !px-3" title={c.is_published ? "取消发布" : "发布"}>
                    {c.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button onClick={() => handleEdit(c)} className="btn-ghost btn-sm !h-8 !px-3">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="btn-ghost btn-sm !h-8 !px-3 text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {expandedId === c.id && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <h4 className="font-heading font-semibold text-sm mb-3">Phases</h4>
                  <div className="space-y-2 mb-4">
                    {phases.map((p) => (
                      <div key={p.id} className="flex items-center justify-between bg-muted/50 rounded-2xl px-4 py-2 text-sm">
                        <span>{p.phase_label} <span className="text-muted-foreground">({p.phase_key})</span></span>
                        <div className="flex items-center gap-2">
                          {p.is_default && <span className="badge-primary text-xs">默认</span>}
                          <span className="text-muted-foreground text-xs">排序: {p.sort_order}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 items-end">
                    <div>
                      <label className="label text-xs mb-1 block">Key</label>
                      <input className="input !h-9 text-sm" value={phaseForm.phase_key} placeholder="phase1"
                        onChange={(e) => setPhaseForm({ ...phaseForm, phase_key: e.target.value })} />
                    </div>
                    <div>
                      <label className="label text-xs mb-1 block">显示名</label>
                      <input className="input !h-9 text-sm" value={phaseForm.phase_label} placeholder="初版"
                        onChange={(e) => setPhaseForm({ ...phaseForm, phase_label: e.target.value })} />
                    </div>
                    <div>
                      <label className="label text-xs mb-1 block">排序</label>
                      <input className="input !h-9 text-sm w-20" type="number" value={phaseForm.sort_order}
                        onChange={(e) => setPhaseForm({ ...phaseForm, sort_order: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="flex items-center gap-1 pb-1">
                      <input type="checkbox" checked={phaseForm.is_default}
                        onChange={(e) => setPhaseForm({ ...phaseForm, is_default: e.target.checked })} className="h-3 w-3" />
                      <label className="text-xs">默认</label>
                    </div>
                    <button onClick={() => handleAddPhase(c.id)} className="btn-primary btn-sm !h-9">添加</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
