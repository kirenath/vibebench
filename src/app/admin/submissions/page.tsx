"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Drawer from "@/components/Drawer";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";
import { Trash2, Eye, EyeOff, Upload, AlertTriangle, FileCode2 } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [uploadDrawerOpen, setUploadDrawerOpen] = useState(false);
  const [uploadSubId, setUploadSubId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({
    challenge_phase_id: "", model_variant_id: "", channel_id: "",
    is_published: false, manual_touched: false, manual_notes: "",
    iteration_count: "", duration_ms: "", timing_method: "", notes: "",
  });

  const [selectedChallenge, setSelectedChallenge] = useState("");
  const [artifactType, setArtifactType] = useState("html");

  const load = useCallback(() => {
    fetch("/api/submissions").then(r => r.json()).then(d => setSubmissions(d.data || [])).catch(() => {});
    fetch("/api/challenges?all=true").then(r => r.json()).then(d => setChallenges(d.data || [])).catch(() => {});
    fetch("/api/model-variants").then(r => r.json()).then(d => setVariants(d.data || [])).catch(() => {});
    fetch("/api/channels").then(r => r.json()).then(d => setChannels(d.data || [])).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

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
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) toast("作品已创建", "success");
    else toast("创建失败", "error");
    setDrawerOpen(false);
    setForm({ challenge_phase_id: "", model_variant_id: "", channel_id: "", is_published: false, manual_touched: false, manual_notes: "", iteration_count: "", duration_ms: "", timing_method: "", notes: "" });
    load();
  };

  const requestDelete = (id: string) => {
    setDeleteTarget(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/submissions/${deleteTarget}`, { method: "DELETE" });
    if (res.ok) toast("作品已删除", "success");
    else toast("删除失败", "error");
    setConfirmOpen(false);
    setDeleteTarget(null);
    load();
  };

  const handleToggle = async (s: Submission) => {
    await fetch(`/api/submissions/${s.submission_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !s.submission_is_published }),
    });
    toast(s.submission_is_published ? "已取消发布" : "已发布", "success");
    load();
  };

  const openUpload = (subId: string) => {
    setUploadSubId(subId);
    setUploadDrawerOpen(true);
  };

  const handleUpload = async () => {
    if (!uploadSubId || !fileRef.current?.files?.[0]) return;
    const fd = new FormData();
    fd.append("file", fileRef.current.files[0]);
    fd.append("type", artifactType);
    const res = await fetch(`/api/submissions/${uploadSubId}/artifacts`, { method: "POST", body: fd });
    if (res.ok) toast("Artifact 上传成功", "success");
    else toast("上传失败", "error");
    setUploadDrawerOpen(false);
    setUploadSubId(null);
    load();
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("zh-CN", {
        month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
      });
    } catch { return dateStr; }
  };

  return (
    <>
      <AdminPageHeader title="作品管理" onAdd={() => setDrawerOpen(true)} addLabel="新建作品" />

      {/* Empty state */}
      {submissions.length === 0 && (
        <div className="card p-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FileCode2 className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-heading font-bold text-lg mb-2">暂无作品</h3>
          <p className="text-sm text-muted-foreground mb-6">创建第一个作品开始管理</p>
          <button onClick={() => setDrawerOpen(true)} className="btn-primary btn-sm mx-auto">
            新建作品
          </button>
        </div>
      )}

      {/* Table view */}
      {submissions.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>模型</th>
                  <th>赛题</th>
                  <th>Phase</th>
                  <th>渠道</th>
                  <th>状态</th>
                  <th>Artifacts</th>
                  <th>时间</th>
                  <th className="text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(s => (
                  <tr key={s.submission_id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-sm">{s.model_variant_name}</span>
                        {s.manual_touched && (
                          <span className="badge-destructive text-[10px] flex items-center gap-0.5">
                            <AlertTriangle className="h-3 w-3" />修订
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{s.vendor_name}</p>
                    </td>
                    <td className="text-sm">{s.challenge_title}</td>
                    <td className="text-sm">{s.phase_label}</td>
                    <td className="text-sm">{s.channel_name}</td>
                    <td>
                      {s.submission_is_published
                        ? <span className="badge-primary text-xs">已发布</span>
                        : <span className="badge-muted text-xs">草稿</span>
                      }
                    </td>
                    <td>
                      <div className="flex gap-1">
                        {s.has_html && <span className="badge-primary text-[10px]">HTML</span>}
                        {s.has_prd && <span className="badge-secondary text-[10px]">PRD</span>}
                        {s.has_screenshot && <span className="badge-muted text-[10px]">截图</span>}
                        {!s.has_html && !s.has_prd && !s.has_screenshot && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>
                    <td className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(s.created_at)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openUpload(s.submission_id)} className="btn-ghost btn-sm !h-8 !px-2" title="上传 Artifact">
                          <Upload className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleToggle(s)} className="btn-ghost btn-sm !h-8 !px-2" title={s.submission_is_published ? "取消发布" : "发布"}>
                          {s.submission_is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button onClick={() => requestDelete(s.submission_id)} className="btn-ghost btn-sm !h-8 !px-2 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New submission drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="新建作品">
        <div className="space-y-4">
          <div>
            <label className="label mb-1 block">赛题</label>
            <CustomSelect
              options={challenges.map(c => ({ value: c.id, label: c.title }))}
              value={selectedChallenge}
              onChange={setSelectedChallenge}
              placeholder="选择赛题..."
            />
          </div>
          <div>
            <label className="label mb-1 block">Phase</label>
            <CustomSelect
              options={phases.map(p => ({ value: p.id, label: p.phase_label }))}
              value={form.challenge_phase_id}
              onChange={v => setForm({...form, challenge_phase_id: v})}
              placeholder="选择 Phase..."
            />
          </div>
          <div>
            <label className="label mb-1 block">模型版本</label>
            <CustomSelect
              options={variants.map(v => ({ value: v.id, label: `${v.vendor_name} / ${v.name}` }))}
              value={form.model_variant_id}
              onChange={v => setForm({...form, model_variant_id: v})}
              placeholder="选择模型..."
            />
          </div>
          <div>
            <label className="label mb-1 block">渠道</label>
            <CustomSelect
              options={channels.map(c => ({ value: c.id, label: c.name }))}
              value={form.channel_id}
              onChange={v => setForm({...form, channel_id: v})}
              placeholder="选择渠道..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label mb-1 block">迭代次数</label>
              <input className="input" type="number" value={form.iteration_count} onChange={e => setForm({...form, iteration_count: e.target.value})} />
            </div>
            <div>
              <label className="label mb-1 block">耗时 (ms)</label>
              <input className="input" type="number" value={form.duration_ms} onChange={e => setForm({...form, duration_ms: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="label mb-1 block">计时方式</label>
            <CustomSelect
              options={[
                { value: "", label: "无" },
                { value: "manual", label: "手动" },
                { value: "measured", label: "测量" },
                { value: "estimated", label: "估算" },
              ]}
              value={form.timing_method}
              onChange={v => setForm({...form, timing_method: v})}
              placeholder="选择计时方式..."
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_published} onChange={e => setForm({...form, is_published: e.target.checked})} className="h-4 w-4" />
              公开发布
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.manual_touched} onChange={e => setForm({...form, manual_touched: e.target.checked})} className="h-4 w-4" />
              人工修订
            </label>
          </div>
          <div>
            <label className="label mb-1 block">备注</label>
            <textarea className="textarea" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          </div>
          <div className="flex gap-2 pt-4 border-t border-border/50">
            <button onClick={handleSave} className="btn-primary btn-sm">保存</button>
            <button onClick={() => setDrawerOpen(false)} className="btn-ghost btn-sm">取消</button>
          </div>
        </div>
      </Drawer>

      {/* Upload drawer */}
      <Drawer open={uploadDrawerOpen} onClose={() => { setUploadDrawerOpen(false); setUploadSubId(null); }} title="上传 Artifact">
        <div className="space-y-4">
          <div>
            <label className="label mb-1 block">类型</label>
            <CustomSelect
              options={[
                { value: "html", label: "HTML" },
                { value: "prd", label: "PRD" },
                { value: "screenshot", label: "Screenshot" },
              ]}
              value={artifactType}
              onChange={setArtifactType}
              placeholder="选择类型..."
            />
          </div>
          <div>
            <label className="label mb-1 block">文件</label>
            <input type="file" ref={fileRef} className="input !py-2" />
          </div>
          <div className="flex gap-2 pt-4 border-t border-border/50">
            <button onClick={handleUpload} className="btn-primary btn-sm">
              <Upload className="h-4 w-4 mr-1" />上传
            </button>
            <button onClick={() => { setUploadDrawerOpen(false); setUploadSubId(null); }} className="btn-ghost btn-sm">取消</button>
          </div>
        </div>
      </Drawer>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onConfirm={handleDelete}
        onCancel={() => { setConfirmOpen(false); setDeleteTarget(null); }}
        title="确认删除作品"
        description="删除后无法恢复，关联的 Artifact 也将被清除。确定要删除吗？"
        confirmLabel="删除"
        variant="danger"
      />
    </>
  );
}
