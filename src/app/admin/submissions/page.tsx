"use client";

import { useState, useEffect, useRef } from "react";
import AdminNav from "@/components/AdminNav";
import { Plus, Trash2, Eye, EyeOff, Upload, AlertTriangle } from "lucide-react";

interface Challenge { id: string; title: string; }
interface Phase { id: string; phase_key: string; phase_label: string; }
interface Variant { id: string; name: string; family_name?: string; vendor_name?: string; }
interface Channel { id: string; name: string; }
interface Submission {
  submission_id: string;
  challenge_title: string;
  phase_label: string;
  model_variant_name: string;
  vendor_name: string;
  channel_name: string;
  submission_is_published: boolean;
  manual_touched: boolean;
  has_html: boolean;
  has_prd: boolean;
  has_screenshot: boolean;
  created_at: string;
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [uploadSubId, setUploadSubId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    challenge_phase_id: "", model_variant_id: "", channel_id: "",
    is_published: false, manual_touched: false, manual_notes: "",
    iteration_count: "", duration_ms: "", timing_method: "", notes: "",
  });

  const [selectedChallenge, setSelectedChallenge] = useState("");
  const [artifactType, setArtifactType] = useState("html");

  const load = () => {
    fetch("/api/submissions").then(r => r.json()).then(d => setSubmissions(d.data || [])).catch(() => {});
    fetch("/api/challenges?all=true").then(r => r.json()).then(d => setChallenges(d.data || [])).catch(() => {});
    fetch("/api/model-variants").then(r => r.json()).then(d => setVariants(d.data || [])).catch(() => {});
    fetch("/api/channels").then(r => r.json()).then(d => setChannels(d.data || [])).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!selectedChallenge) { setPhases([]); return; }
    fetch(`/api/challenges/${selectedChallenge}/phases`)
      .then(r => r.json()).then(d => setPhases(d.data || [])).catch(() => {});
  }, [selectedChallenge]);

  const handleSave = async () => {
    const body = {
      ...form,
      iteration_count: form.iteration_count ? parseInt(form.iteration_count) : null,
      duration_ms: form.duration_ms ? parseInt(form.duration_ms) : null,
      timing_method: form.timing_method || null,
    };
    await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setShowForm(false);
    setForm({ challenge_phase_id: "", model_variant_id: "", channel_id: "", is_published: false, manual_touched: false, manual_notes: "", iteration_count: "", duration_ms: "", timing_method: "", notes: "" });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确认删除？")) return;
    await fetch(`/api/submissions/${id}`, { method: "DELETE" });
    load();
  };

  const handleToggle = async (s: Submission) => {
    await fetch(`/api/submissions/${s.submission_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !s.submission_is_published }),
    });
    load();
  };

  const handleUpload = async () => {
    if (!uploadSubId || !fileRef.current?.files?.[0]) return;
    const fd = new FormData();
    fd.append("file", fileRef.current.files[0]);
    fd.append("type", artifactType);
    await fetch(`/api/submissions/${uploadSubId}/artifacts`, { method: "POST", body: fd });
    setUploadSubId(null);
    load();
  };

  return (
    <div>
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-3xl font-bold">作品管理</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary btn-sm">
            <Plus className="h-4 w-4 mr-1" />新建作品
          </button>
        </div>

        {showForm && (
          <div className="card p-6 mb-8">
            <h2 className="font-heading font-bold text-lg mb-4">新建 / 更新作品</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="label mb-1 block">赛题</label>
                <select className="select" value={selectedChallenge} onChange={e => setSelectedChallenge(e.target.value)}>
                  <option value="">选择赛题...</option>
                  {challenges.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="label mb-1 block">Phase</label>
                <select className="select" value={form.challenge_phase_id} onChange={e => setForm({...form, challenge_phase_id: e.target.value})}>
                  <option value="">选择 Phase...</option>
                  {phases.map(p => <option key={p.id} value={p.id}>{p.phase_label}</option>)}
                </select>
              </div>
              <div>
                <label className="label mb-1 block">模型版本</label>
                <select className="select" value={form.model_variant_id} onChange={e => setForm({...form, model_variant_id: e.target.value})}>
                  <option value="">选择模型...</option>
                  {variants.map(v => <option key={v.id} value={v.id}>{v.vendor_name} / {v.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label mb-1 block">渠道</label>
                <select className="select" value={form.channel_id} onChange={e => setForm({...form, channel_id: e.target.value})}>
                  <option value="">选择渠道...</option>
                  {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label mb-1 block">迭代次数</label>
                <input className="input" type="number" value={form.iteration_count} onChange={e => setForm({...form, iteration_count: e.target.value})} />
              </div>
              <div>
                <label className="label mb-1 block">耗时 (ms)</label>
                <input className="input" type="number" value={form.duration_ms} onChange={e => setForm({...form, duration_ms: e.target.value})} />
              </div>
              <div>
                <label className="label mb-1 block">计时方式</label>
                <select className="select" value={form.timing_method} onChange={e => setForm({...form, timing_method: e.target.value})}>
                  <option value="">无</option>
                  <option value="manual">手动</option>
                  <option value="measured">测量</option>
                  <option value="estimated">估算</option>
                </select>
              </div>
              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_published} onChange={e => setForm({...form, is_published: e.target.checked})} className="h-4 w-4" />
                  公开发布
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.manual_touched} onChange={e => setForm({...form, manual_touched: e.target.checked})} className="h-4 w-4" />
                  人工修订
                </label>
              </div>
              <div className="md:col-span-3">
                <label className="label mb-1 block">备注</label>
                <textarea className="textarea" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleSave} className="btn-primary btn-sm">保存</button>
              <button onClick={() => setShowForm(false)} className="btn-ghost btn-sm">取消</button>
            </div>
          </div>
        )}

        {uploadSubId && (
          <div className="card p-6 mb-8">
            <h2 className="font-heading font-bold text-lg mb-4">上传 Artifact</h2>
            <div className="flex gap-4 items-end">
              <div>
                <label className="label mb-1 block">类型</label>
                <select className="select" value={artifactType} onChange={e => setArtifactType(e.target.value)}>
                  <option value="html">HTML</option>
                  <option value="prd">PRD</option>
                  <option value="screenshot">Screenshot</option>
                </select>
              </div>
              <div>
                <label className="label mb-1 block">文件</label>
                <input type="file" ref={fileRef} className="input !py-2" />
              </div>
              <button onClick={handleUpload} className="btn-primary btn-sm">
                <Upload className="h-4 w-4 mr-1" />上传
              </button>
              <button onClick={() => setUploadSubId(null)} className="btn-ghost btn-sm">取消</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {submissions.map(s => (
            <div key={s.submission_id} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold">{s.model_variant_name}</h3>
                    {s.manual_touched && <span className="badge-destructive text-xs flex items-center gap-1"><AlertTriangle className="h-3 w-3" />人工修订</span>}
                    {s.submission_is_published ? <span className="badge-primary text-xs">已发布</span> : <span className="badge-muted text-xs">草稿</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {s.challenge_title} · {s.phase_label} · {s.vendor_name} · {s.channel_name}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {s.has_html && <span className="badge-primary text-xs">HTML</span>}
                    {s.has_prd && <span className="badge-secondary text-xs">PRD</span>}
                    {s.has_screenshot && <span className="badge-muted text-xs">截图</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setUploadSubId(s.submission_id)} className="btn-ghost btn-sm !h-8 !px-3" title="上传 Artifact">
                    <Upload className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleToggle(s)} className="btn-ghost btn-sm !h-8 !px-3" title={s.submission_is_published ? "取消发布" : "发布"}>
                    {s.submission_is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button onClick={() => handleDelete(s.submission_id)} className="btn-ghost btn-sm !h-8 !px-3 text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {submissions.length === 0 && <div className="card p-8 text-center text-muted-foreground">暂无作品</div>}
        </div>
      </div>
    </div>
  );
}
