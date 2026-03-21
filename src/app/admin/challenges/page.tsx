'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';
import type { Challenge, ChallengePhase } from '@/types/database';

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [phases, setPhases] = useState<Record<string, ChallengePhase[]>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Challenge> | null>(null);
  const [editingPhase, setEditingPhase] = useState<Partial<ChallengePhase> & { challenge_id?: string } | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const loadChallenges = useCallback(async () => {
    const res = await fetch('/api/challenges?all=true');
    setChallenges(await res.json());
  }, []);

  useEffect(() => { loadChallenges(); }, [loadChallenges]);

  async function loadPhases(challengeId: string) {
    const res = await fetch(`/api/challenges/${challengeId}/phases`);
    const data = await res.json();
    setPhases(prev => ({ ...prev, [challengeId]: data }));
  }

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  async function saveChallenge() {
    if (!editing) return;
    const isNew = !challenges.find(c => c.id === editing.id);
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? '/api/challenges' : `/api/challenges/${editing.id}`;
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) });
    if (res.ok) { showToast('success', isNew ? '创建成功' : '更新成功'); setEditing(null); loadChallenges(); }
    else { const err = await res.json(); showToast('error', err.error); }
  }

  async function deleteChallenge(id: string) {
    if (!confirm('确定删除此赛题？')) return;
    const res = await fetch(`/api/challenges/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('success', '已删除'); loadChallenges(); }
    else { const err = await res.json(); showToast('error', err.error); }
  }

  async function togglePublish(c: Challenge) {
    await fetch(`/api/challenges/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !c.is_published }),
    });
    loadChallenges();
  }

  async function savePhase() {
    if (!editingPhase?.challenge_id) return;
    const isNew = !editingPhase.id;
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? `/api/challenges/${editingPhase.challenge_id}/phases` : `/api/challenge-phases/${editingPhase.id}`;
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingPhase) });
    if (res.ok) { showToast('success', '保存成功'); setEditingPhase(null); loadPhases(editingPhase.challenge_id); }
    else { const err = await res.json(); showToast('error', err.error); }
  }

  async function deletePhase(phaseId: string, challengeId: string) {
    if (!confirm('确定删除此 Phase？')) return;
    const res = await fetch(`/api/challenge-phases/${phaseId}`, { method: 'DELETE' });
    if (res.ok) { showToast('success', '已删除'); loadPhases(challengeId); }
    else { const err = await res.json(); showToast('error', err.error); }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <h1>赛题管理</h1>
        <button className="btn btn-primary" onClick={() => setEditing({ id: '', title: '', is_published: false, sort_order: 0 })}>
          <Plus size={16} /> 创建赛题
        </button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>标题</th>
              <th>状态</th>
              <th>排序</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {challenges.map(c => (
              <>
                <tr key={c.id}>
                  <td><code style={{ fontSize: 'var(--text-xs)' }}>{c.id}</code></td>
                  <td><strong>{c.title}</strong></td>
                  <td>
                    <button className={`badge ${c.is_published ? 'badge-primary' : 'badge-muted'}`} onClick={() => togglePublish(c)} style={{ cursor: 'pointer', border: 'none' }}>
                      {c.is_published ? <><Eye size={10} /> 已发布</> : <><EyeOff size={10} /> 草稿</>}
                    </button>
                  </td>
                  <td>{c.sort_order}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setExpandedId(expandedId === c.id ? null : c.id); if (expandedId !== c.id) loadPhases(c.id); }}>
                        {expandedId === c.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />} Phases
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing(c)}><Pencil size={14} /></button>
                      <button className="btn btn-ghost btn-sm" onClick={() => deleteChallenge(c.id)} style={{ color: 'var(--color-destructive)' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
                {expandedId === c.id && (
                  <tr key={`${c.id}-phases`}>
                    <td colSpan={5} style={{ background: 'var(--color-muted)', padding: 'var(--space-4) var(--space-6)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                        <strong>Phases</strong>
                        <button className="btn btn-outline btn-sm" onClick={() => setEditingPhase({ challenge_id: c.id, phase_key: '', phase_label: '', sort_order: 0, is_default: false })}>
                          <Plus size={14} /> 添加 Phase
                        </button>
                      </div>
                      {(phases[c.id] || []).length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                          {(phases[c.id] || []).map(p => (
                            <div key={p.id} className="card" style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 'var(--radius-md)' }}>
                              <div>
                                <strong>{p.phase_label}</strong> <code className="text-xs text-muted">{p.phase_key}</code>
                                {p.is_default && <span className="badge badge-primary" style={{ marginLeft: 8 }}>默认</span>}
                              </div>
                              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => setEditingPhase({ ...p, challenge_id: c.id })}><Pencil size={12} /></button>
                                <button className="btn btn-ghost btn-sm" onClick={() => deletePhase(p.id, c.id)} style={{ color: 'var(--color-destructive)' }}><Trash2 size={12} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted">暂无 Phase</p>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Challenge Edit Modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 'var(--space-6)' }}>{editing.id && challenges.find(c => c.id === editing.id) ? '编辑赛题' : '创建赛题'}</h3>
            <div className="field">
              <label>ID (slug)</label>
              <input className="input" value={editing.id || ''} onChange={e => setEditing({ ...editing, id: e.target.value })} disabled={!!challenges.find(c => c.id === editing.id)} />
            </div>
            <div className="field">
              <label>标题</label>
              <input className="input" value={editing.title || ''} onChange={e => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div className="field">
              <label>描述</label>
              <textarea className="input input-area" value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} />
            </div>
            <div className="field">
              <label>规则说明 (Markdown)</label>
              <textarea className="input input-area" value={editing.rules_markdown || ''} onChange={e => setEditing({ ...editing, rules_markdown: e.target.value })} style={{ minHeight: 150 }} />
            </div>
            <div className="field">
              <label>Prompt (Markdown)</label>
              <textarea className="input input-area" value={editing.prompt_markdown || ''} onChange={e => setEditing({ ...editing, prompt_markdown: e.target.value })} style={{ minHeight: 150 }} />
            </div>
            <div className="field">
              <label>封面图 URL</label>
              <input className="input" value={editing.cover_image || ''} onChange={e => setEditing({ ...editing, cover_image: e.target.value })} />
            </div>
            <div className="field">
              <label>排序</label>
              <input className="input" type="number" value={editing.sort_order ?? 0} onChange={e => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>取消</button>
              <button className="btn btn-primary" onClick={saveChallenge}>保存</button>
            </div>
          </div>
        </div>
      )}

      {/* Phase Edit Modal */}
      {editingPhase && (
        <div className="modal-overlay" onClick={() => setEditingPhase(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <h3 style={{ marginBottom: 'var(--space-6)' }}>{editingPhase.id ? '编辑 Phase' : '添加 Phase'}</h3>
            <div className="field">
              <label>Phase Key</label>
              <input className="input" value={editingPhase.phase_key || ''} onChange={e => setEditingPhase({ ...editingPhase, phase_key: e.target.value })} />
            </div>
            <div className="field">
              <label>显示名</label>
              <input className="input" value={editingPhase.phase_label || ''} onChange={e => setEditingPhase({ ...editingPhase, phase_label: e.target.value })} />
            </div>
            <div className="field">
              <label>排序</label>
              <input className="input" type="number" value={editingPhase.sort_order ?? 0} onChange={e => setEditingPhase({ ...editingPhase, sort_order: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="field">
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                <input type="checkbox" checked={editingPhase.is_default || false} onChange={e => setEditingPhase({ ...editingPhase, is_default: e.target.checked })} />
                设为默认 Phase
              </label>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setEditingPhase(null)}>取消</button>
              <button className="btn btn-primary" onClick={savePhase}>保存</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
