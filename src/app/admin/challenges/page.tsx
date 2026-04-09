"use client";

import { useState, useEffect, useCallback } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Drawer from "@/components/Drawer";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";
import { Pencil, Trash2, Eye, EyeOff, ChevronDown, ChevronUp, Trophy, X, Search } from "lucide-react";
import ChallengeIcon from "@/components/ChallengeIcon";
import { PRESET_ICONS } from "@/components/ChallengeIcon";
import { icons as allLucideIcons } from "lucide-react";
import { TAG_DEFINITIONS } from "@/lib/tags";

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  rules_markdown: string | null;
  prompt_markdown: string | null;
  is_published: boolean;
  sort_order: number;
  submission_count: string;
  metadata: Record<string, unknown> | null;
}

interface Phase {
  id: string;
  phase_key: string;
  phase_label: string;
  sort_order: number;
  is_default: boolean;
}

const emptyForm = {
  id: "", title: "", description: "", rules_markdown: "",
  prompt_markdown: "", is_published: true, sort_order: 0, icon: "",
  tags: [] as string[],
};

const emptyPhaseForm = {
  phase_key: "", phase_label: "", sort_order: 0, is_default: false,
};

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [phaseForm, setPhaseForm] = useState(emptyPhaseForm);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { toast } = useToast();

  const load = useCallback(() => {
    fetch("/api/challenges?all=true")
      .then((r) => r.json())
      .then((d) => setChallenges(d.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadPhases = (challengeId: string) => {
    fetch(`/api/challenges/${challengeId}/phases`)
      .then((r) => r.json())
      .then((d) => setPhases(d.data || []))
      .catch(() => {});
  };

  const handleSave = async () => {
    const method = editId ? "PUT" : "POST";
    const url = editId ? `/api/challenges/${editId}` : "/api/challenges";
    const { icon, tags, ...rest } = form;
    const metadata: Record<string, unknown> = {};
    if (icon) metadata.icon = icon;
    if (tags.length > 0) metadata.tags = tags;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...rest, metadata }),
    });
    if (res.ok) {
      toast(editId ? "赛题已更新" : "赛题已创建", "success");
    } else {
      toast("操作失败，请重试", "error");
    }
    setDrawerOpen(false);
    setEditId(null);
    setForm(emptyForm);
    load();
  };

  const requestDelete = (id: string) => {
    setDeleteTarget(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/challenges/${deleteTarget}`, { method: "DELETE" });
    if (res.ok) toast("赛题已删除", "success");
    else toast("删除失败", "error");
    setConfirmOpen(false);
    setDeleteTarget(null);
    load();
  };

  const handleTogglePublish = async (c: Challenge) => {
    await fetch(`/api/challenges/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !c.is_published }),
    });
    toast(c.is_published ? "已取消发布" : "已发布", "success");
    load();
  };

  const handleEdit = (c: Challenge) => {
    setEditId(c.id);
    const meta = c.metadata as Record<string, unknown> | null;
    setForm({
      id: c.id, title: c.title, description: c.description || "",
      rules_markdown: c.rules_markdown || "", prompt_markdown: c.prompt_markdown || "",
      is_published: c.is_published, sort_order: c.sort_order,
      icon: (meta?.icon as string) || "",
      tags: (Array.isArray(meta?.tags) ? meta.tags : []) as string[],
    });
    setDrawerOpen(true);
  };

  const handleAddPhase = async (challengeId: string) => {
    if (!phaseForm.phase_key || !phaseForm.phase_label) return;
    const res = await fetch(`/api/challenges/${challengeId}/phases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(phaseForm),
    });
    if (res.ok) toast("Phase 已添加", "success");
    else toast("添加失败", "error");
    setPhaseForm(emptyPhaseForm);
    loadPhases(challengeId);
  };

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  };

  return (
    <>
      <AdminPageHeader title="赛题管理" onAdd={openNew} addLabel="新建赛题" />

      {/* Empty state */}
      {challenges.length === 0 && (
        <div className="card p-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-heading font-bold text-lg mb-2">暂无赛题</h3>
          <p className="text-sm text-muted-foreground mb-6">创建第一个赛题开始管理</p>
          <button onClick={openNew} className="btn-primary btn-sm mx-auto">
            新建赛题
          </button>
        </div>
      )}

      {/* Challenge list */}
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
                <button onClick={() => requestDelete(c.id)} className="btn-ghost btn-sm !h-8 !px-3 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {expandedId === c.id && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <h4 className="font-heading font-semibold text-sm mb-3">Phases</h4>
                <div className="space-y-2 mb-4">
                  {phases.map((p) => (
                    <PhaseRow
                      key={p.id}
                      phase={p}
                      challengeId={c.id}
                      onUpdate={() => loadPhases(c.id)}
                      toast={toast}
                    />
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

      {/* Drawer for create/edit */}
      <Drawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditId(null); setForm(emptyForm); }}
        title={editId ? "编辑赛题" : "新建赛题"}
      >
        <div className="space-y-4">
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
          <div>
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
          <div>
            <label className="label mb-1 block">图标</label>
            <IconPicker value={form.icon} onChange={(v) => setForm({ ...form, icon: v })} />
          </div>
          <div>
            <label className="label mb-1 block">标签</label>
            <TagPicker value={form.tags} onChange={(tags) => setForm({ ...form, tags })} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="published" checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="h-4 w-4" />
            <label htmlFor="published" className="label">公开发布</label>
          </div>
          <div className="flex gap-2 pt-4 border-t border-border/50">
            <button onClick={handleSave} className="btn-primary btn-sm">保存</button>
            <button onClick={() => { setDrawerOpen(false); setEditId(null); setForm(emptyForm); }} className="btn-ghost btn-sm">取消</button>
          </div>
        </div>
      </Drawer>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onConfirm={handleDelete}
        onCancel={() => { setConfirmOpen(false); setDeleteTarget(null); }}
        title="确认删除赛题"
        description="删除后无法恢复，关联的作品数据也将受到影响。确定要删除吗？"
        confirmLabel="删除"
        variant="danger"
      />
    </>
  );
}

function PhaseRow({ phase, challengeId, onUpdate, toast }: {
  phase: Phase;
  challengeId: string;
  onUpdate: () => void;
  toast: (msg: string, type: "success" | "error") => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    phase_key: phase.phase_key,
    phase_label: phase.phase_label,
    sort_order: phase.sort_order,
    is_default: phase.is_default,
  });

  const handleSave = async () => {
    const res = await fetch(`/api/challenges/${challengeId}/phases/${phase.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    if (res.ok) toast("Phase 已更新", "success");
    else toast("更新失败", "error");
    setEditing(false);
    onUpdate();
  };

  const handleDelete = async () => {
    if (!confirm("确定删除此 Phase？关联的作品可能受到影响。")) return;
    const res = await fetch(`/api/challenges/${challengeId}/phases/${phase.id}`, { method: "DELETE" });
    if (res.ok) toast("Phase 已删除", "success");
    else toast("删除失败", "error");
    onUpdate();
  };

  if (editing) {
    return (
      <div className="flex gap-2 items-end bg-primary/5 rounded-2xl px-4 py-2">
        <div>
          <label className="label text-xs mb-1 block">Key</label>
          <input className="input !h-8 text-sm" value={editData.phase_key}
            onChange={(e) => setEditData({ ...editData, phase_key: e.target.value })} />
        </div>
        <div>
          <label className="label text-xs mb-1 block">显示名</label>
          <input className="input !h-8 text-sm" value={editData.phase_label}
            onChange={(e) => setEditData({ ...editData, phase_label: e.target.value })} />
        </div>
        <div>
          <label className="label text-xs mb-1 block">排序</label>
          <input className="input !h-8 text-sm w-16" type="number" value={editData.sort_order}
            onChange={(e) => setEditData({ ...editData, sort_order: parseInt(e.target.value) || 0 })} />
        </div>
        <div className="flex items-center gap-1 pb-1">
          <input type="checkbox" checked={editData.is_default}
            onChange={(e) => setEditData({ ...editData, is_default: e.target.checked })} className="h-3 w-3" />
          <label className="text-xs">默认</label>
        </div>
        <button onClick={handleSave} className="btn-primary btn-sm !h-8 !px-3 text-xs">保存</button>
        <button onClick={() => setEditing(false)} className="btn-ghost btn-sm !h-8 !px-3 text-xs">取消</button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between bg-muted/50 rounded-2xl px-4 py-2 text-sm">
      <span>{phase.phase_label} <span className="text-muted-foreground">({phase.phase_key})</span></span>
      <div className="flex items-center gap-2">
        {phase.is_default && <span className="badge-primary text-xs">默认</span>}
        <span className="text-muted-foreground text-xs">排序: {phase.sort_order}</span>
        <button onClick={() => setEditing(true)} className="btn-ghost btn-sm !h-7 !px-1.5" title="编辑">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button onClick={handleDelete} className="btn-ghost btn-sm !h-7 !px-1.5 text-destructive" title="删除">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const isValid = !value || value in allLucideIcons;

  const filteredPresets = search
    ? PRESET_ICONS.filter((n) => n.toLowerCase().includes(search.toLowerCase()))
    : PRESET_ICONS;

  // Also search full lucide icon list when user types something not in presets
  const extraMatches = search
    ? Object.keys(allLucideIcons)
        .filter(
          (n) =>
            n.toLowerCase().includes(search.toLowerCase()) &&
            !PRESET_ICONS.includes(n as (typeof PRESET_ICONS)[number])
        )
        .slice(0, 30)
    : [];

  return (
    <div className="relative">
      {/* Input with preview */}
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <ChallengeIcon iconName={value || null} className="h-5 w-5 text-primary" />
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            className="input !pl-9"
            value={value}
            onChange={(e) => { onChange(e.target.value); setShowDropdown(true); setSearch(e.target.value); }}
            onFocus={() => { setShowDropdown(true); setSearch(value); }}
            placeholder="输入 lucide 图标名，如 Clock"
          />
          {value && (
            <button
              onClick={() => { onChange(""); setSearch(""); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      {!isValid && value && (
        <p className="text-xs text-destructive mt-1">未找到图标 &quot;{value}&quot;，将使用默认图标</p>
      )}

      {/* Dropdown */}
      {showDropdown && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
          <div className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto bg-card border border-border rounded-xl shadow-lg p-2">
            {filteredPresets.length > 0 && (
              <>
                <p className="text-xs text-muted-foreground px-2 py-1">常用图标</p>
                <div className="grid grid-cols-6 gap-1">
                  {filteredPresets.map((name) => (
                    <button
                      key={name}
                      onClick={() => { onChange(name); setShowDropdown(false); setSearch(""); }}
                      className={`flex flex-col items-center gap-0.5 p-2 rounded-lg hover:bg-primary/10 transition-colors ${
                        value === name ? "bg-primary/15 ring-1 ring-primary/30" : ""
                      }`}
                      title={name}
                    >
                      <ChallengeIcon iconName={name} className="h-5 w-5 text-foreground" />
                      <span className="text-[10px] text-muted-foreground truncate w-full text-center">{name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {extraMatches.length > 0 && (
              <>
                <p className="text-xs text-muted-foreground px-2 py-1 mt-2">更多匹配</p>
                <div className="grid grid-cols-6 gap-1">
                  {extraMatches.map((name) => (
                    <button
                      key={name}
                      onClick={() => { onChange(name); setShowDropdown(false); setSearch(""); }}
                      className={`flex flex-col items-center gap-0.5 p-2 rounded-lg hover:bg-primary/10 transition-colors ${
                        value === name ? "bg-primary/15 ring-1 ring-primary/30" : ""
                      }`}
                      title={name}
                    >
                      <ChallengeIcon iconName={name} className="h-5 w-5 text-foreground" />
                      <span className="text-[10px] text-muted-foreground truncate w-full text-center">{name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {filteredPresets.length === 0 && extraMatches.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">未找到匹配的图标</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function TagPicker({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) {
  const toggle = (key: string) => {
    onChange(
      value.includes(key)
        ? value.filter((t) => t !== key)
        : [...value, key]
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {TAG_DEFINITIONS.map((tag) => (
        <button
          key={tag.key}
          type="button"
          onClick={() => toggle(tag.key)}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            value.includes(tag.key)
              ? "bg-primary/15 text-primary ring-1 ring-primary/30"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          }`}
        >
          {tag.emoji} {tag.label}
        </button>
      ))}
    </div>
  );
}
