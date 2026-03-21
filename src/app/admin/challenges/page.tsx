"use client";

import { useEffect, useState, useCallback } from "react";

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
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
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPhases, setShowPhases] = useState<string | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    id: "", title: "", description: "", rules_markdown: "", prompt_markdown: "",
    is_published: false, sort_order: 0,
  });
  const [phaseForm, setPhaseForm] = useState({ phase_key: "", phase_label: "", sort_order: 0, is_default: false });

  const fetchChallenges = useCallback(async () => {
    const res = await fetch("/api/challenges?all=true");
    const data = await res.json();
    setChallenges(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/challenges/${editingId}` : "/api/challenges";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
    setShowForm(false);
    setEditingId(null);
    setFormData({ id: "", title: "", description: "", rules_markdown: "", prompt_markdown: "", is_published: false, sort_order: 0 });
    fetchChallenges();
  };

  const handleEdit = (c: Challenge) => {
    setEditingId(c.id);
    setFormData({ id: c.id, title: c.title, description: c.description || "", rules_markdown: "", prompt_markdown: "", is_published: c.is_published, sort_order: c.sort_order });
    setShowForm(true);
    // Fetch full data
    fetch(`/api/challenges/${c.id}`).then(r => r.json()).then(full => {
      setFormData(prev => ({ ...prev, rules_markdown: full.rules_markdown || "", prompt_markdown: full.prompt_markdown || "" }));
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除这个赛题？所有关联的 phase 和 submission 将一并删除。")) return;
    await fetch(`/api/challenges/${id}`, { method: "DELETE" });
    fetchChallenges();
  };

  const fetchPhases = async (challengeId: string) => {
    const res = await fetch(`/api/challenges/${challengeId}/phases`);
    setPhases(await res.json());
  };

  const handleAddPhase = async (e: React.FormEvent, challengeId: string) => {
    e.preventDefault();
    await fetch(`/api/challenges/${challengeId}/phases`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(phaseForm),
    });
    setPhaseForm({ phase_key: "", phase_label: "", sort_order: 0, is_default: false });
    fetchPhases(challengeId);
  };

  const handleDeletePhase = async (phaseId: string, challengeId: string) => {
    if (!confirm("确定删除这个 phase？关联的 submission 也将被删除。")) return;
    await fetch(`/api/challenge-phases/${phaseId}`, { method: "DELETE" });
    fetchPhases(challengeId);
  };

  if (loading) return <div className="skeleton h-8 w-48 mb-6"></div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-bark-dark">赛题管理</h1>
        <button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ id: "", title: "", description: "", rules_markdown: "", prompt_markdown: "", is_published: false, sort_order: 0 }); }} className="btn-primary">
          新建赛题
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bark-dark/50 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-heading font-semibold text-bark-dark mb-4">{editingId ? "编辑赛题" : "新建赛题"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-bark mb-1">ID (slug)</label>
                  <input value={formData.id} onChange={e => setFormData(p => ({...p, id: e.target.value}))} className="input-field" required disabled={!!editingId} placeholder="e.g. receipt" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bark mb-1">排序</label>
                  <input type="number" value={formData.sort_order} onChange={e => setFormData(p => ({...p, sort_order: parseInt(e.target.value) || 0}))} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-bark mb-1">标题</label>
                <input value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} className="input-field" required placeholder="热敏小票物理模拟" />
              </div>
              <div>
                <label className="block text-sm font-medium text-bark mb-1">简介</label>
                <textarea value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} className="input-field" rows={2} placeholder="赛题简介..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-bark mb-1">规则说明 (Markdown)</label>
                <textarea value={formData.rules_markdown} onChange={e => setFormData(p => ({...p, rules_markdown: e.target.value}))} className="input-field font-mono text-sm" rows={4} placeholder="## 规则\n- ..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-bark mb-1">Prompt (Markdown)</label>
                <textarea value={formData.prompt_markdown} onChange={e => setFormData(p => ({...p, prompt_markdown: e.target.value}))} className="input-field font-mono text-sm" rows={4} placeholder="请实现..." />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_published" checked={formData.is_published} onChange={e => setFormData(p => ({...p, is_published: e.target.checked}))} className="w-4 h-4 accent-leaf" />
                <label htmlFor="is_published" className="text-sm text-bark">公开发布</label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">取消</button>
                <button type="submit" className="btn-primary">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Challenge Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream-dark">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-bark">ID</th>
              <th className="text-left px-4 py-3 font-medium text-bark">标题</th>
              <th className="text-left px-4 py-3 font-medium text-bark">状态</th>
              <th className="text-left px-4 py-3 font-medium text-bark">排序</th>
              <th className="text-right px-4 py-3 font-medium text-bark">操作</th>
            </tr>
          </thead>
          <tbody>
            {challenges.map(c => (
              <>
                <tr key={c.id} className="border-t border-sand-light hover:bg-parchment transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted">{c.id}</td>
                  <td className="px-4 py-3 font-medium text-bark-dark">{c.title}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${c.is_published ? "badge-success" : "badge-neutral"}`}>
                      {c.is_published ? "已发布" : "草稿"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{c.sort_order}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => { setShowPhases(showPhases === c.id ? null : c.id); if (showPhases !== c.id) fetchPhases(c.id); }} className="text-xs text-leaf-dark hover:underline">Phases</button>
                    <button onClick={() => handleEdit(c)} className="text-xs text-leaf-dark hover:underline">编辑</button>
                    <button onClick={() => handleDelete(c.id)} className="text-xs text-danger hover:underline">删除</button>
                  </td>
                </tr>
                {showPhases === c.id && (
                  <tr key={`${c.id}-phases`}>
                    <td colSpan={5} className="bg-parchment px-6 py-4 border-t border-sand-light">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-heading font-semibold text-bark text-sm">Phase 配置</h4>
                      </div>
                      {phases.length > 0 && (
                        <div className="space-y-2 mb-4">
                          {phases.map(p => (
                            <div key={p.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-sand-light text-sm">
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-xs text-muted">{p.phase_key}</span>
                                <span className="font-medium text-bark-dark">{p.phase_label}</span>
                                {p.is_default && <span className="badge badge-success text-xs">默认</span>}
                              </div>
                              <button onClick={() => handleDeletePhase(p.id, c.id)} className="text-xs text-danger hover:underline">删除</button>
                            </div>
                          ))}
                        </div>
                      )}
                      <form onSubmit={e => handleAddPhase(e, c.id)} className="flex items-end gap-3">
                        <div><label className="block text-xs text-muted mb-1">Key</label><input value={phaseForm.phase_key} onChange={e => setPhaseForm(p => ({...p, phase_key: e.target.value}))} className="input-field text-sm" placeholder="phase1" required /></div>
                        <div><label className="block text-xs text-muted mb-1">显示名</label><input value={phaseForm.phase_label} onChange={e => setPhaseForm(p => ({...p, phase_label: e.target.value}))} className="input-field text-sm" placeholder="初版" required /></div>
                        <div><label className="block text-xs text-muted mb-1">排序</label><input type="number" value={phaseForm.sort_order} onChange={e => setPhaseForm(p => ({...p, sort_order: parseInt(e.target.value) || 0}))} className="input-field text-sm w-20" /></div>
                        <div className="flex items-center gap-1"><input type="checkbox" checked={phaseForm.is_default} onChange={e => setPhaseForm(p => ({...p, is_default: e.target.checked}))} className="accent-leaf" /><label className="text-xs text-muted">默认</label></div>
                        <button type="submit" className="btn-primary text-sm">添加</button>
                      </form>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {challenges.length === 0 && (
          <div className="text-center py-12 text-muted">暂无赛题，点击上方按钮创建</div>
        )}
      </div>
    </div>
  );
}
