"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Drawer from "@/components/Drawer";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";
import { Trash2, Eye, EyeOff, Upload, AlertTriangle, FileCode2, ClipboardPaste, File as FileIcon, Pencil } from "lucide-react";
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
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<string | null>(null);
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

  const [editForm, setEditForm] = useState({
    is_published: false, manual_touched: false, manual_notes: "",
    iteration_count: "", duration_ms: "", timing_method: "", notes: "",
  });

  const [selectedChallenge, setSelectedChallenge] = useState("");
  const [artifactType, setArtifactType] = useState("html");
  const [uploadMode, setUploadMode] = useState<"paste" | "file">("paste");
  const [pasteContent, setPasteContent] = useState("");
  const [pasteFileName, setPasteFileName] = useState("index.html");
  const [filePickerKey, setFilePickerKey] = useState(0); // force re-render on file change

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

  const openEdit = async (subId: string) => {
    try {
      const res = await fetch(`/api/submissions/${subId}`);
      const json = await res.json();
      if (!json.success) return;
      const d = json.data;
      setEditForm({
        is_published: d.submission_is_published ?? d.is_published ?? false,
        manual_touched: d.manual_touched ?? false,
        manual_notes: d.manual_notes ?? "",
        iteration_count: d.iteration_count != null ? String(d.iteration_count) : "",
        duration_ms: d.duration_ms != null ? String(d.duration_ms) : "",
        timing_method: d.timing_method ?? "",
        notes: d.notes ?? "",
      });
      setEditTarget(subId);
      setEditDrawerOpen(true);
    } catch {
      toast("加载作品信息失败", "error");
    }
  };

  const handleUpdate = async () => {
    if (!editTarget) return;
    const body = {
      ...editForm,
      iteration_count: editForm.iteration_count ? parseInt(editForm.iteration_count) : null,
      duration_ms: editForm.duration_ms ? parseInt(editForm.duration_ms) : null,
      timing_method: editForm.timing_method || null,
    };
    const res = await fetch(`/api/submissions/${editTarget}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) toast("作品已更新", "success");
    else toast("更新失败", "error");
    setEditDrawerOpen(false);
    setEditTarget(null);
    load();
  };

  // --- Parse HTML from pasted input ---
  function parseHtmlFromInput(raw: string): { html: string; source: "codeblock" | "raw" } | null {
    const codeBlockMatch = raw.match(/```(?:html)?\s*\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      return { html: codeBlockMatch[1].trim(), source: "codeblock" };
    }
    const trimmed = raw.trim();
    if (trimmed.includes("<") && trimmed.includes(">")) {
      return { html: trimmed, source: "raw" };
    }
    return null;
  }

  const parseResult = useMemo(() => {
    if (!pasteContent.trim()) return null;
    return parseHtmlFromInput(pasteContent);
  }, [pasteContent]);

  const openUpload = (subId: string) => {
    setUploadSubId(subId);
    setUploadDrawerOpen(true);
    setPasteContent("");
    setPasteFileName("index.html");
    setUploadMode("paste");
  };

  const handleUpload = async () => {
    if (!uploadSubId) return;

    let fileToUpload: File | null = null;

    if (uploadMode === "file") {
      if (!fileRef.current?.files?.[0]) return;
      fileToUpload = fileRef.current.files[0];
    } else {
      // paste mode
      if (!parseResult) {
        toast("未检测到有效的 HTML 内容", "error");
        return;
      }
      const fileName = pasteFileName.trim() || "index.html";
      fileToUpload = new File([parseResult.html], fileName, { type: "text/html" });
    }

    const fd = new FormData();
    fd.append("file", fileToUpload);
    fd.append("type", artifactType);
    const res = await fetch(`/api/submissions/${uploadSubId}/artifacts`, { method: "POST", body: fd });
    if (res.ok) toast("Artifact 上传成功", "success");
    else toast("上传失败", "error");
    setUploadDrawerOpen(false);
    setUploadSubId(null);
    setPasteContent("");
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
                        <button onClick={() => openEdit(s.submission_id)} className="btn-ghost btn-sm !h-8 !px-2" title="编辑">
                          <Pencil className="h-4 w-4" />
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
          {/* Type selector */}
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

          {/* Mode segmented control */}
          <div>
            <label className="label mb-1 block">输入方式</label>
            <div className="flex rounded-full bg-muted/60 p-1 gap-1">
              {(["paste", "file"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setUploadMode(mode)}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-full h-9 text-sm font-bold
                    transition-all duration-300 cursor-pointer
                    ${uploadMode === mode
                      ? "bg-white text-primary shadow-soft"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {mode === "paste" ? <ClipboardPaste className="h-4 w-4" /> : <FileIcon className="h-4 w-4" />}
                  {mode === "paste" ? "粘贴代码" : "文件上传"}
                </button>
              ))}
            </div>
          </div>

          {/* === Paste mode === */}
          {uploadMode === "paste" && (
            <>
              <div>
                <label className="label mb-1 block">文件名</label>
                <input
                  className="input"
                  value={pasteFileName}
                  onChange={(e) => setPasteFileName(e.target.value)}
                  placeholder="index.html"
                />
              </div>
              <div>
                <label className="label mb-1 block">HTML 代码</label>
                <textarea
                  className="textarea !min-h-[180px] font-mono text-xs leading-relaxed"
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder="粘贴 HTML 代码..."
                />
              </div>
              {/* Parse preview */}
              {pasteContent.trim() && (
                <div className="rounded-2xl border border-border/50 bg-muted/30 p-4 space-y-2">
                  {parseResult ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="badge-primary text-xs">
                          {parseResult.source === "codeblock" ? "已提取代码块中的 HTML" : "裸 HTML"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {(new Blob([parseResult.html]).size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap break-all leading-relaxed max-h-24 overflow-hidden">
                        {parseResult.html.split("\n").slice(0, 5).join("\n")}
                        {parseResult.html.split("\n").length > 5 && "\n..."}
                      </pre>
                    </>
                  ) : (
                    <p className="text-xs text-destructive font-semibold">未检测到有效的 HTML 内容</p>
                  )}
                </div>
              )}
            </>
          )}

          {/* === File mode === */}
          {uploadMode === "file" && (
            <div>
              <label className="label mb-1 block">文件</label>
              <input type="file" ref={fileRef} className="hidden" onChange={() => setFilePickerKey(k => k + 1)} />
              <div
                className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border
                           bg-muted/30 px-6 py-6 cursor-pointer transition-all duration-300
                           hover:border-primary/50 hover:bg-primary/5"
                onClick={() => fileRef.current?.click()}
              >
                {fileRef.current?.files?.[0] ? (
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 shrink-0">
                      <FileCode2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-heading font-bold text-foreground truncate">
                        {fileRef.current.files[0].name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(fileRef.current.files[0].size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center
                                 text-muted-foreground hover:text-destructive hover:bg-destructive/10
                                 transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (fileRef.current) { fileRef.current.value = ""; setFilePickerKey(k => k + 1); }
                      }}
                      title="移除文件"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10
                                    group-hover:bg-primary/15 transition-colors duration-300">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground
                                       font-bold px-5 h-9 text-sm shadow-soft cursor-pointer
                                       hover:scale-105 hover:brightness-110 active:scale-95
                                       transition-all duration-300">
                        选择文件
                      </span>
                      <p className="text-xs text-muted-foreground mt-2">或将文件拖放到此处</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-4 border-t border-border/50">
            <button onClick={handleUpload} className="btn-primary btn-sm">
              <Upload className="h-4 w-4 mr-1" />上传
            </button>
            <button onClick={() => { setUploadDrawerOpen(false); setUploadSubId(null); setPasteContent(""); }} className="btn-ghost btn-sm">取消</button>
          </div>
        </div>
      </Drawer>

      {/* Edit submission drawer */}
      <Drawer open={editDrawerOpen} onClose={() => { setEditDrawerOpen(false); setEditTarget(null); }} title="编辑作品">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label mb-1 block">迭代次数</label>
              <input className="input" type="number" value={editForm.iteration_count} onChange={e => setEditForm({...editForm, iteration_count: e.target.value})} />
            </div>
            <div>
              <label className="label mb-1 block">耗时 (ms)</label>
              <input className="input" type="number" value={editForm.duration_ms} onChange={e => setEditForm({...editForm, duration_ms: e.target.value})} />
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
              value={editForm.timing_method}
              onChange={v => setEditForm({...editForm, timing_method: v})}
              placeholder="选择计时方式..."
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editForm.is_published} onChange={e => setEditForm({...editForm, is_published: e.target.checked})} className="h-4 w-4" />
              公开发布
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editForm.manual_touched} onChange={e => setEditForm({...editForm, manual_touched: e.target.checked})} className="h-4 w-4" />
              人工修订
            </label>
          </div>
          <div>
            <label className="label mb-1 block">人工修订说明</label>
            <textarea className="textarea" value={editForm.manual_notes} onChange={e => setEditForm({...editForm, manual_notes: e.target.value})} placeholder="描述修订内容..." />
          </div>
          <div>
            <label className="label mb-1 block">备注</label>
            <textarea className="textarea" value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} />
          </div>
          <div className="flex gap-2 pt-4 border-t border-border/50">
            <button onClick={handleUpdate} className="btn-primary btn-sm">保存修改</button>
            <button onClick={() => { setEditDrawerOpen(false); setEditTarget(null); }} className="btn-ghost btn-sm">取消</button>
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
