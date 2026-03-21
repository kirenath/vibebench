'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Upload, Eye, EyeOff, AlertTriangle, FileCode, FileText, ImageIcon } from 'lucide-react';
import type { Challenge, ChallengePhase, ModelVariant, Channel, SubmissionOverview, Vendor, ModelFamily } from '@/types/database';

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionOverview[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [phases, setPhases] = useState<ChallengePhase[]>([]);
  const [variants, setVariants] = useState<ModelVariant[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [families, setFamilies] = useState<ModelFamily[]>([]);

  const [filterChallenge, setFilterChallenge] = useState('');
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [uploadingFor, setUploadingFor] = useState<{ submissionId: string; type: string } | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const loadAll = useCallback(async () => {
    const [s, c, p, mv, ch, v, f] = await Promise.all([
      fetch('/api/submissions').then(r => r.json()),
      fetch('/api/challenges?all=true').then(r => r.json()),
      Promise.resolve([]),
      fetch('/api/model-variants').then(r => r.json()),
      fetch('/api/channels').then(r => r.json()),
      fetch('/api/vendors').then(r => r.json()),
      fetch('/api/model-families').then(r => r.json()),
    ]);
    setSubmissions(s); setChallenges(c); setVariants(mv); setChannels(ch); setVendors(v); setFamilies(f);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Load phases when filter changes
  useEffect(() => {
    if (!filterChallenge) { setPhases([]); return; }
    fetch(`/api/challenges/${filterChallenge}/phases`).then(r => r.json()).then(setPhases);
  }, [filterChallenge]);

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  const filteredSubmissions = filterChallenge
    ? submissions.filter(s => s.challenge_id === filterChallenge)
    : submissions;

  async function saveSubmission() {
    if (!editing) return;
    const isNew = !editing.id;
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? '/api/submissions' : `/api/submissions/${editing.id}`;
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) });
    if (res.ok) { showToast('success', '保存成功'); setEditing(null); loadAll(); }
    else { const err = await res.json(); showToast('error', err.error); }
  }

  async function deleteSubmission(id: string) {
    if (!confirm('确定删除此作品？')) return;
    const res = await fetch(`/api/submissions/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('success', '已删除'); loadAll(); }
    else { const err = await res.json(); showToast('error', err.error); }
  }

  async function togglePublish(s: SubmissionOverview) {
    await fetch(`/api/submissions/${s.submission_id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !s.submission_is_published }),
    });
    loadAll();
  }

  async function handleFileUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!uploadingFor) return;
    const form = new FormData(e.currentTarget);
    form.append('type', uploadingFor.type);
    const res = await fetch(`/api/submissions/${uploadingFor.submissionId}/artifacts`, { method: 'POST', body: form });
    if (res.ok) { showToast('success', '上传成功'); setUploadingFor(null); loadAll(); }
    else { const err = await res.json(); showToast('error', err.error); }
  }

  async function deleteArtifact(submissionId: string, type: string) {
    if (!confirm(`确定删除此 ${type} 文件？`)) return;
    const res = await fetch(`/api/submissions/${submissionId}/artifacts/${type}`, { method: 'DELETE' });
    if (res.ok) { showToast('success', '已删除'); loadAll(); }
    else { const err = await res.json(); showToast('error', err.error); }
  }

  function getVariantLabel(variantId: string) {
    const v = variants.find(mv => mv.id === variantId);
    if (!v) return variantId;
    const f = families.find(mf => mf.id === v.family_id);
    const vendor = vendors.find(vd => vd.id === f?.vendor_id);
    return `${vendor?.name || ''} / ${v.name}`;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1>作品管理</h1>
        <button className="btn btn-primary" onClick={() => setEditing({ is_published: false, manual_touched: false })}>
          <Plus size={16} /> 创建作品
        </button>
      </div>

      {/* Filter */}
      <div className="field" style={{ maxWidth: 300 }}>
        <label>按赛题筛选</label>
        <select className="input" value={filterChallenge} onChange={e => setFilterChallenge(e.target.value)} style={{ borderRadius: 'var(--radius-md)' }}>
          <option value="">全部赛题</option>
          {challenges.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>赛题</th>
              <th>Phase</th>
              <th>模型</th>
              <th>渠道</th>
              <th>状态</th>
              <th>Artifacts</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.map(s => (
              <tr key={s.submission_id}>
                <td className="text-sm">{s.challenge_title}</td>
                <td><span className="badge badge-muted">{s.phase_label}</span></td>
                <td>
                  <strong className="text-sm">{s.model_variant_name}</strong>
                  {s.manual_touched && <span className="badge badge-warning" style={{ marginLeft: 4 }}><AlertTriangle size={8} /></span>}
                </td>
                <td className="text-sm">{s.channel_name}</td>
                <td>
                  <button className={`badge ${s.submission_is_published ? 'badge-primary' : 'badge-muted'}`} onClick={() => togglePublish(s)} style={{ cursor: 'pointer', border: 'none' }}>
                    {s.submission_is_published ? <><Eye size={10} /> 已发布</> : <><EyeOff size={10} /> 草稿</>}
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    {s.has_html ? (
                      <span className="badge badge-primary" style={{ cursor: 'pointer' }} onClick={() => deleteArtifact(s.submission_id, 'html')} title="点击删除">
                        <FileCode size={10} /> HTML
                      </span>
                    ) : (
                      <button className="badge badge-muted" style={{ cursor: 'pointer', border: 'none' }} onClick={() => setUploadingFor({ submissionId: s.submission_id, type: 'html' })}>
                        <Upload size={10} /> HTML
                      </button>
                    )}
                    {s.has_prd ? (
                      <span className="badge badge-primary" style={{ cursor: 'pointer' }} onClick={() => deleteArtifact(s.submission_id, 'prd')} title="点击删除">
                        <FileText size={10} /> PRD
                      </span>
                    ) : (
                      <button className="badge badge-muted" style={{ cursor: 'pointer', border: 'none' }} onClick={() => setUploadingFor({ submissionId: s.submission_id, type: 'prd' })}>
                        <Upload size={10} /> PRD
                      </button>
                    )}
                    {s.has_screenshot ? (
                      <span className="badge badge-primary" style={{ cursor: 'pointer' }} onClick={() => deleteArtifact(s.submission_id, 'screenshot')} title="点击删除">
                        <ImageIcon size={10} /> 截图
                      </span>
                    ) : (
                      <button className="badge badge-muted" style={{ cursor: 'pointer', border: 'none' }} onClick={() => setUploadingFor({ submissionId: s.submission_id, type: 'screenshot' })}>
                        <Upload size={10} /> 截图
                      </button>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing({
                      ...s, id: s.submission_id,
                      is_published: s.submission_is_published,
                    })}><Pencil size={14} /></button>
                    <button className="btn btn-ghost btn-sm" onClick={() => deleteSubmission(s.submission_id)} style={{ color: 'var(--color-destructive)' }}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 'var(--space-6)' }}>{editing.id ? '编辑作品' : '创建作品'}</h3>
            {!editing.id && (
              <>
                <div className="field">
                  <label>赛题 Phase</label>
                  <select className="input" value={String(editing.challenge_phase_id || '')} onChange={e => setEditing({ ...editing, challenge_phase_id: e.target.value })} style={{ borderRadius: 'var(--radius-md)' }}>
                    <option value="">选择...</option>
                    {challenges.map(c => phases.filter(p => p.challenge_id === c.id).length > 0 ? (
                      phases.filter(p => p.challenge_id === c.id).map(p => (
                        <option key={p.id} value={p.id}>{c.title} / {p.phase_label}</option>
                      ))
                    ) : null)}
                    {/* If phases haven't loaded for non-filtered challenges, show a hint */}
                  </select>
                </div>
                <div className="field">
                  <label>模型版本</label>
                  <select className="input" value={String(editing.model_variant_id || '')} onChange={e => setEditing({ ...editing, model_variant_id: e.target.value })} style={{ borderRadius: 'var(--radius-md)' }}>
                    <option value="">选择...</option>
                    {variants.map(v => <option key={v.id} value={v.id}>{getVariantLabel(v.id)}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>渠道</label>
                  <select className="input" value={String(editing.channel_id || '')} onChange={e => setEditing({ ...editing, channel_id: e.target.value })} style={{ borderRadius: 'var(--radius-md)' }}>
                    <option value="">选择...</option>
                    {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </>
            )}
            <div className="field">
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                <input type="checkbox" checked={!!editing.manual_touched} onChange={e => setEditing({ ...editing, manual_touched: e.target.checked })} />
                人工修订
              </label>
            </div>
            {Boolean(editing.manual_touched) && (
              <div className="field">
                <label>修订说明</label>
                <textarea className="input input-area" value={String(editing.manual_notes || '')} onChange={e => setEditing({ ...editing, manual_notes: e.target.value })} />
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="field">
                <label>迭代次数</label>
                <input className="input" type="number" value={String(editing.iteration_count ?? '')} onChange={e => setEditing({ ...editing, iteration_count: e.target.value ? parseInt(e.target.value) : null })} />
              </div>
              <div className="field">
                <label>耗时 (ms)</label>
                <input className="input" type="number" value={String(editing.duration_ms ?? '')} onChange={e => setEditing({ ...editing, duration_ms: e.target.value ? parseInt(e.target.value) : null })} />
              </div>
            </div>
            <div className="field">
              <label>计时方式</label>
              <select className="input" value={String(editing.timing_method || '')} onChange={e => setEditing({ ...editing, timing_method: e.target.value || null })} style={{ borderRadius: 'var(--radius-md)' }}>
                <option value="">未指定</option>
                <option value="manual">手动</option>
                <option value="measured">实测</option>
                <option value="estimated">估算</option>
              </select>
            </div>
            <div className="field">
              <label>备注</label>
              <textarea className="input input-area" value={String(editing.notes || '')} onChange={e => setEditing({ ...editing, notes: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>取消</button>
              <button className="btn btn-primary" onClick={saveSubmission}>保存</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadingFor && (
        <div className="modal-overlay" onClick={() => setUploadingFor(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h3 style={{ marginBottom: 'var(--space-6)' }}>上传 {uploadingFor.type.toUpperCase()}</h3>
            <form onSubmit={handleFileUpload}>
              <div className="field">
                <input type="file" name="file" required accept={
                  uploadingFor.type === 'html' ? '.html,.htm'
                  : uploadingFor.type === 'prd' ? '.md,.txt'
                  : '.png,.jpg,.jpeg,.webp,.gif'
                } />
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setUploadingFor(null)}>取消</button>
                <button type="submit" className="btn btn-primary"><Upload size={16} /> 上传</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
