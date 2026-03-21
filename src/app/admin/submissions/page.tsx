"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface Challenge { id: string; title: string; }
interface Phase { id: string; phase_key: string; phase_label: string; }
interface ModelVariant { id: string; name: string; family_name: string; vendor_name: string; }
interface Channel { id: string; name: string; }
interface Submission {
  submission_id: string;
  challenge_title: string;
  phase_label: string;
  model_variant_name: string;
  channel_name: string;
  submission_is_published: boolean;
  manual_touched: boolean;
  has_html: boolean;
  has_prd: boolean;
  has_screenshot: boolean;
  created_at: string;
}

export default function AdminSubmissionsPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [variants, setVariants] = useState<ModelVariant[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    challenge_id: "", challenge_phase_id: "", model_variant_id: "", channel_id: "",
    is_published: false, manual_touched: false, manual_notes: "",
    iteration_count: "", duration_ms: "", timing_method: "", notes: "",
  });
  const [uploadForm, setUploadForm] = useState({ submission_id: "", type: "html" as string });

  const fetchAll = useCallback(async () => {
    const [c, v, ch, s] = await Promise.all([
      fetch("/api/challenges?all=true").then(r => r.json()),
      fetch("/api/model-variants").then(r => r.json()),
      fetch("/api/channels").then(r => r.json()),
      fetch("/api/submissions").then(r => r.json()),
    ]);
    setChallenges(c); setVariants(v); setChannels(ch); setSubmissions(s);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fetchPhases = async (challengeId: string) => {
    if (!challengeId) { setPhases([]); return; }
    const res = await fetch(`/api/challenges/${challengeId}/phases`);
    setPhases(await res.json());
  };

  const handleCreateSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/submissions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        iteration_count: form.iteration_count ? parseInt(form.iteration_count) : null,
        duration_ms: form.duration_ms ? parseInt(form.duration_ms) : null,
        timing_method: form.timing_method || null,
      }),
    });
    setShowForm(false);
    fetchAll();
  };

  const handleUploadArtifact = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file || !uploadForm.submission_id) return;

    setUploading(true); setUploadMsg("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", uploadForm.type);

    try {
      const res = await fetch(`/api/submissions/${uploadForm.submission_id}/artifacts`, { method: "POST", body: fd });
      if (res.ok) { setUploadMsg("上传成功！"); fetchAll(); }
      else { const d = await res.json(); setUploadMsg(`错误: ${d.error}`); }
    } catch { setUploadMsg("上传失败"); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此作品及其所有 artifact 文件？")) return;
    await fetch(`/api/submissions/${id}`, { method: "DELETE" });
    fetchAll();
  };

  const handleTogglePublish = async (sub: Submission) => {
    await fetch(`/api/submissions/${sub.submission_id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !sub.submission_is_published }),
    });
    fetchAll();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-bark-dark">作品管理</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(true)} className="btn-primary">新建作品</button>
        </div>
      </div>

      {/* Upload Section */}
      <div className="card p-5 mb-6">
        <h3 className="font-heading font-semibold text-bark-dark mb-3">上传 Artifact</h3>
        <form onSubmit={handleUploadArtifact} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-muted mb-1">作品</label>
            <select value={uploadForm.submission_id} onChange={e => setUploadForm(p => ({...p, submission_id: e.target.value}))} className="input-field text-sm" required>
              <option value="">选择作品</option>
              {submissions.map(s => (
                <option key={s.submission_id} value={s.submission_id}>
                  {s.challenge_title} / {s.phase_label} / {s.model_variant_name} ({s.channel_name})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">类型</label>
            <select value={uploadForm.type} onChange={e => setUploadForm(p => ({...p, type: e.target.value}))} className="input-field text-sm">
              <option value="html">HTML</option>
              <option value="prd">PRD</option>
              <option value="screenshot">Screenshot</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">文件</label>
            <input type="file" ref={fileRef} className="input-field text-sm" required />
          </div>
          <button type="submit" disabled={uploading} className="btn-primary disabled:opacity-50">{uploading ? "上传中..." : "上传"}</button>
          {uploadMsg && <span className={`text-sm ${uploadMsg.startsWith("错误") ? "text-danger" : "text-leaf-dark"}`}>{uploadMsg}</span>}
        </form>
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bark-dark/50 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
          <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-heading font-semibold text-bark-dark mb-4">新建作品</h3>
            <form onSubmit={handleCreateSubmission} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-bark mb-1">赛题</label>
                <select value={form.challenge_id} onChange={e => { setForm(p => ({...p, challenge_id: e.target.value, challenge_phase_id: ""})); fetchPhases(e.target.value); }} className="input-field" required>
                  <option value="">选择赛题</option>{challenges.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-bark mb-1">Phase</label>
                <select value={form.challenge_phase_id} onChange={e => setForm(p => ({...p, challenge_phase_id: e.target.value}))} className="input-field" required>
                  <option value="">选择 Phase</option>{phases.map(p => <option key={p.id} value={p.id}>{p.phase_label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-bark mb-1">模型版本</label>
                <select value={form.model_variant_id} onChange={e => setForm(p => ({...p, model_variant_id: e.target.value}))} className="input-field" required>
                  <option value="">选择模型</option>{variants.map(v => <option key={v.id} value={v.id}>{v.vendor_name} / {v.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-bark mb-1">渠道</label>
                <select value={form.channel_id} onChange={e => setForm(p => ({...p, channel_id: e.target.value}))} className="input-field" required>
                  <option value="">选择渠道</option>{channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-bark mb-1">迭代次数</label><input type="number" value={form.iteration_count} onChange={e => setForm(p => ({...p, iteration_count: e.target.value}))} className="input-field" /></div>
                <div><label className="block text-sm font-medium text-bark mb-1">耗时 (ms)</label><input type="number" value={form.duration_ms} onChange={e => setForm(p => ({...p, duration_ms: e.target.value}))} className="input-field" /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-bark mb-1">计时方式</label>
                <select value={form.timing_method} onChange={e => setForm(p => ({...p, timing_method: e.target.value}))} className="input-field">
                  <option value="">未标注</option><option value="manual">手动</option><option value="measured">测量</option><option value="estimated">估计</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={form.is_published} onChange={e => setForm(p => ({...p, is_published: e.target.checked}))} className="accent-leaf" /> 公开发布</label>
                <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={form.manual_touched} onChange={e => setForm(p => ({...p, manual_touched: e.target.checked}))} className="accent-warning" /> 人工修订</label>
              </div>
              {form.manual_touched && (
                <div><label className="block text-sm font-medium text-bark mb-1">修订备注</label><textarea value={form.manual_notes} onChange={e => setForm(p => ({...p, manual_notes: e.target.value}))} className="input-field" rows={2} /></div>
              )}
              <div><label className="block text-sm font-medium text-bark mb-1">备注</label><textarea value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} className="input-field" rows={2} /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">取消</button>
                <button type="submit" className="btn-primary">创建</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-dark">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-bark">赛题</th>
              <th className="text-left px-4 py-3 font-medium text-bark">Phase</th>
              <th className="text-left px-4 py-3 font-medium text-bark">模型</th>
              <th className="text-left px-4 py-3 font-medium text-bark">渠道</th>
              <th className="text-left px-4 py-3 font-medium text-bark">Artifacts</th>
              <th className="text-left px-4 py-3 font-medium text-bark">状态</th>
              <th className="text-right px-4 py-3 font-medium text-bark">操作</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(s => (
              <tr key={s.submission_id} className="border-t border-sand-light hover:bg-parchment transition-colors">
                <td className="px-4 py-3 text-bark-dark">{s.challenge_title}</td>
                <td className="px-4 py-3 text-muted">{s.phase_label}</td>
                <td className="px-4 py-3 font-medium text-bark-dark">{s.model_variant_name}</td>
                <td className="px-4 py-3 text-muted">{s.channel_name}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {s.has_html && <span className="badge badge-success text-xs">HTML</span>}
                    {s.has_prd && <span className="badge badge-neutral text-xs">PRD</span>}
                    {s.has_screenshot && <span className="badge badge-neutral text-xs">截图</span>}
                    {s.manual_touched && <span className="badge badge-warning text-xs">⚠修订</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${s.submission_is_published ? "badge-success" : "badge-neutral"}`}>
                    {s.submission_is_published ? "已发布" : "草稿"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => handleTogglePublish(s)} className="text-xs text-leaf-dark hover:underline">
                    {s.submission_is_published ? "取消发布" : "发布"}
                  </button>
                  <button onClick={() => handleDelete(s.submission_id)} className="text-xs text-danger hover:underline">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {submissions.length === 0 && (
          <div className="text-center py-12 text-muted">暂无作品，点击上方按钮创建</div>
        )}
      </div>
    </div>
  );
}
