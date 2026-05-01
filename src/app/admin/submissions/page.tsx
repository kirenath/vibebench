"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Drawer from "@/components/Drawer";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";
import {
  Trash2, Eye, EyeOff, Upload, AlertTriangle, FileCode2,
  ClipboardPaste, File as FileIcon, Pencil, Search, X,
  ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, ChevronRight,
  LayoutList, FolderOpen, Layers,
} from "lucide-react";
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

type SortField = "model" | "challenge" | "time" | "";
type SortDir = "asc" | "desc";
type ViewMode = "table" | "groupByChallenge" | "groupByModel";

const PAGE_SIZE = 20;

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

  // --- Filter / Search / Sort / Pagination state ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterChallenge, setFilterChallenge] = useState("");
  const [filterModel, setFilterModel] = useState("");
  const [filterChannel, setFilterChannel] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortField, setSortField] = useState<SortField>("time");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const [form, setForm] = useState({
    challenge_phase_id: "", model_variant_id: "", channel_id: "",
    is_published: true, manual_touched: false, manual_notes: "",
    iteration_count: "1", duration_min: "", duration_sec: "", timing_method: "", notes: "",
  });

  const [editForm, setEditForm] = useState({
    is_published: false, manual_touched: false, manual_notes: "",
    iteration_count: "", duration_min: "", duration_sec: "", timing_method: "", notes: "",
  });

  const toDurationMs = (min: string, sec: string): number | null => {
    const m = parseInt(min) || 0;
    const s = parseFloat(sec) || 0;
    if (m === 0 && s === 0) return null;
    return Math.round((m * 60 + s) * 1000);
  };

  const fromDurationMs = (ms: number | null | string): { min: string; sec: string } => {
    if (ms == null) return { min: "", sec: "" };
    const total = Number(ms) / 1000;
    const m = Math.floor(total / 60);
    const s = +(total % 60).toFixed(1);
    return { min: m > 0 ? String(m) : "", sec: s > 0 ? String(s) : "" };
  };

  const [selectedChallenge, setSelectedChallenge] = useState("");
  const [artifactType, setArtifactType] = useState("html");
  const defaultFileNames: Record<string, string> = { html: "index.html", prd: "prd.md", screenshot: "screenshot.png" };
  const handleArtifactTypeChange = (v: string) => {
    if (Object.values(defaultFileNames).includes(pasteFileName)) {
      setPasteFileName(defaultFileNames[v] || "index.html");
    }
    setArtifactType(v);
  };
  const [uploadMode, setUploadMode] = useState<"paste" | "file">("paste");
  const [pasteContent, setPasteContent] = useState("");
  const [pasteFileName, setPasteFileName] = useState("index.html");
  const [pastedImage, setPastedImage] = useState<File | null>(null);
  const [pastedImageUrl, setPastedImageUrl] = useState<string | null>(null);
  const [filePickerKey, setFilePickerKey] = useState(0);

  const handleImagePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          setPastedImage(file);
          setPastedImageUrl(URL.createObjectURL(file));
          const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
          if (Object.values(defaultFileNames).includes(pasteFileName)) {
            setPasteFileName(`screenshot.${ext}`);
          }
        }
        break;
      }
    }
  };

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

  // --- Filtered + Sorted submissions ---
  const filteredSubmissions = useMemo(() => {
    let result = [...submissions];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(s =>
        s.model_variant_name.toLowerCase().includes(q) ||
        s.vendor_name.toLowerCase().includes(q) ||
        s.challenge_title.toLowerCase().includes(q) ||
        s.channel_name.toLowerCase().includes(q)
      );
    }

    // Filters
    if (filterChallenge) {
      result = result.filter(s => s.challenge_title === filterChallenge);
    }
    if (filterModel) {
      result = result.filter(s => s.model_variant_name === filterModel);
    }
    if (filterChannel) {
      result = result.filter(s => s.channel_name === filterChannel);
    }
    if (filterStatus === "published") {
      result = result.filter(s => s.submission_is_published);
    } else if (filterStatus === "draft") {
      result = result.filter(s => !s.submission_is_published);
    }

    // Sort
    if (sortField) {
      result.sort((a, b) => {
        let cmp = 0;
        if (sortField === "model") {
          cmp = a.model_variant_name.localeCompare(b.model_variant_name);
        } else if (sortField === "challenge") {
          cmp = a.challenge_title.localeCompare(b.challenge_title);
        } else if (sortField === "time") {
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        return sortDir === "desc" ? -cmp : cmp;
      });
    }

    return result;
  }, [submissions, searchQuery, filterChallenge, filterModel, filterChannel, filterStatus, sortField, sortDir]);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterChallenge, filterModel, filterChannel, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredSubmissions.length;
    const published = filteredSubmissions.filter(s => s.submission_is_published).length;
    return { total, published, draft: total - published };
  }, [filteredSubmissions]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / PAGE_SIZE));
  const paginatedSubmissions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredSubmissions.slice(start, start + PAGE_SIZE);
  }, [filteredSubmissions, currentPage]);

  // Grouped views
  const groupedByChallenge = useMemo(() => {
    const map = new Map<string, Submission[]>();
    filteredSubmissions.forEach(s => {
      const key = s.challenge_title;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredSubmissions]);

  const groupedByModel = useMemo(() => {
    const map = new Map<string, Submission[]>();
    filteredSubmissions.forEach(s => {
      const key = `${s.vendor_name} / ${s.model_variant_name}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredSubmissions]);

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const expandAllGroups = (groups: [string, Submission[]][]) => {
    setExpandedGroups(new Set(groups.map(([key]) => key)));
  };

  const collapseAllGroups = () => {
    setExpandedGroups(new Set());
  };

  // Unique filter options from data
  const challengeOptions = useMemo(() => {
    const set = new Set(submissions.map(s => s.challenge_title));
    return [{ value: "", label: "全部赛题" }, ...Array.from(set).sort().map(v => ({ value: v, label: v }))];
  }, [submissions]);

  const modelOptions = useMemo(() => {
    const set = new Set(submissions.map(s => s.model_variant_name));
    return [{ value: "", label: "全部模型" }, ...Array.from(set).sort().map(v => ({ value: v, label: v }))];
  }, [submissions]);

  const channelOptions = useMemo(() => {
    const set = new Set(submissions.map(s => s.channel_name));
    return [{ value: "", label: "全部渠道" }, ...Array.from(set).sort().map(v => ({ value: v, label: v }))];
  }, [submissions]);

  const statusOptions = [
    { value: "", label: "全部状态" },
    { value: "published", label: "已发布" },
    { value: "draft", label: "草稿" },
  ];

  // Sort handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDir === "asc") setSortDir("desc");
      else { setSortField(""); setSortDir("asc"); }
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDir === "asc"
      ? <ArrowUp className="h-3 w-3 ml-1 text-primary" />
      : <ArrowDown className="h-3 w-3 ml-1 text-primary" />;
  };

  // Clear all filters
  const hasActiveFilters = searchQuery || filterChallenge || filterModel || filterChannel || filterStatus;
  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterChallenge("");
    setFilterModel("");
    setFilterChannel("");
    setFilterStatus("");
  };

  // --- Original handlers (unchanged) ---
  const handleSave = async () => {
    const { duration_min, duration_sec, ...rest } = form;
    const body = {
      ...rest,
      iteration_count: form.iteration_count ? parseInt(form.iteration_count) : null,
      duration_ms: toDurationMs(duration_min, duration_sec),
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
    setForm({ challenge_phase_id: "", model_variant_id: "", channel_id: "", is_published: true, manual_touched: false, manual_notes: "", iteration_count: "1", duration_min: "", duration_sec: "", timing_method: "", notes: "" });
    setSelectedChallenge("");
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
      if (!res.ok || !json.data) return;
      const d = json.data;
      const dur = fromDurationMs(d.duration_ms);
      setEditForm({
        is_published: d.submission_is_published ?? d.is_published ?? false,
        manual_touched: d.manual_touched ?? false,
        manual_notes: d.manual_notes ?? "",
        iteration_count: d.iteration_count != null ? String(d.iteration_count) : "",
        duration_min: dur.min,
        duration_sec: dur.sec,
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
    const { duration_min, duration_sec, ...rest } = editForm;
    const body = {
      ...rest,
      iteration_count: editForm.iteration_count ? parseInt(editForm.iteration_count) : null,
      duration_ms: toDurationMs(duration_min, duration_sec),
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
    setArtifactType("html");
    setPasteContent("");
    setPasteFileName(defaultFileNames.html);
    setUploadMode("paste");
    setPastedImage(null);
    setPastedImageUrl(null);
  };

  const handleUpload = async () => {
    if (!uploadSubId) return;

    let fileToUpload: File | null = null;

    if (uploadMode === "file") {
      if (!fileRef.current?.files?.[0]) return;
      fileToUpload = fileRef.current.files[0];
    } else {
      if (artifactType === "screenshot") {
        if (!pastedImage) {
          toast("请粘贴截图", "error");
          return;
        }
        const fileName = pasteFileName.trim() || "screenshot.png";
        fileToUpload = new File([pastedImage], fileName, { type: pastedImage.type });
      } else if (artifactType === "prd") {
        if (!pasteContent.trim()) {
          toast("请输入 PRD 文本", "error");
          return;
        }
        const fileName = pasteFileName.trim() || "prd.md";
        fileToUpload = new File([pasteContent], fileName, { type: "text/markdown" });
      } else {
        if (!parseResult) {
          toast("未检测到有效的 HTML 内容", "error");
          return;
        }
        const fileName = pasteFileName.trim() || "index.html";
        fileToUpload = new File([parseResult.html], fileName, { type: "text/html" });
      }
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

  // --- Shared row renderer ---
  const renderRow = (s: Submission) => (
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
  );

  // --- Shared table head ---
  const renderTableHead = () => (
    <thead>
      <tr>
        <th className="cursor-pointer select-none" onClick={() => handleSort("model")}>
          <span className="inline-flex items-center">模型<SortIcon field="model" /></span>
        </th>
        <th className="cursor-pointer select-none" onClick={() => handleSort("challenge")}>
          <span className="inline-flex items-center">赛题<SortIcon field="challenge" /></span>
        </th>
        <th>Phase</th>
        <th>渠道</th>
        <th>状态</th>
        <th>Artifacts</th>
        <th className="cursor-pointer select-none" onClick={() => handleSort("time")}>
          <span className="inline-flex items-center">时间<SortIcon field="time" /></span>
        </th>
        <th className="text-right">操作</th>
      </tr>
    </thead>
  );

  // --- Grouped view renderer ---
  const renderGroupedView = (groups: [string, Submission[]][]) => (
    <div className="space-y-3">
      {/* Expand / Collapse all */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => expandAllGroups(groups)}
          className="btn-ghost btn-sm !h-8 !px-3 text-xs"
        >
          全部展开
        </button>
        <button
          onClick={collapseAllGroups}
          className="btn-ghost btn-sm !h-8 !px-3 text-xs"
        >
          全部折叠
        </button>
      </div>
      {groups.map(([groupName, items]) => {
        const isExpanded = expandedGroups.has(groupName);
        const publishedCount = items.filter(s => s.submission_is_published).length;
        return (
          <div key={groupName} className="card overflow-hidden">
            {/* Group header */}
            <button
              onClick={() => toggleGroup(groupName)}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {isExpanded
                  ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                }
                <span className="font-heading font-bold text-sm">{groupName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge-primary text-[10px]">{publishedCount} 已发布</span>
                <span className="badge-muted text-[10px]">{items.length - publishedCount} 草稿</span>
                <span className="text-xs text-muted-foreground ml-1">共 {items.length}</span>
              </div>
            </button>
            {/* Group body */}
            {isExpanded && (
              <div className="border-t border-border/30 overflow-x-auto">
                <table className="admin-table">
                  {renderTableHead()}
                  <tbody>{items.map(renderRow)}</tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
      {groups.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-sm text-muted-foreground">无匹配结果</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <AdminPageHeader title="作品管理" onAdd={() => setDrawerOpen(true)} addLabel="新建作品" />

      {/* Toolbar: Search + Filters + View switcher */}
      {submissions.length > 0 && (
        <div className="space-y-3 mb-6">
          {/* Search + View switcher row */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                className="input !pl-11 !pr-9"
                placeholder="搜索模型、赛题、渠道..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full flex items-center justify-center
                             text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex rounded-full bg-muted/60 p-1 gap-0.5">
              {([
                { mode: "table" as ViewMode, icon: LayoutList, label: "表格" },
                { mode: "groupByChallenge" as ViewMode, icon: FolderOpen, label: "按赛题" },
                { mode: "groupByModel" as ViewMode, icon: Layers, label: "按模型" },
              ]).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => { setViewMode(mode); setExpandedGroups(new Set()); }}
                  className={`flex items-center gap-1.5 rounded-full h-9 px-4 text-sm font-bold
                    transition-all duration-300 cursor-pointer
                    ${viewMode === mode
                      ? "bg-white text-primary shadow-soft"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter row */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-44">
              <CustomSelect options={challengeOptions} value={filterChallenge} onChange={setFilterChallenge} placeholder="全部赛题" />
            </div>
            <div className="w-44">
              <CustomSelect options={modelOptions} value={filterModel} onChange={setFilterModel} placeholder="全部模型" />
            </div>
            <div className="w-40">
              <CustomSelect options={channelOptions} value={filterChannel} onChange={setFilterChannel} placeholder="全部渠道" />
            </div>
            <div className="w-36">
              <CustomSelect options={statusOptions} value={filterStatus} onChange={setFilterStatus} placeholder="全部状态" />
            </div>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="btn-ghost btn-sm !h-10 !px-4 text-xs text-muted-foreground">
                <X className="h-3.5 w-3.5 mr-1" />清除筛选
              </button>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>共 <strong className="text-foreground">{stats.total}</strong> 条</span>
            <span>已发布 <strong className="text-primary">{stats.published}</strong></span>
            <span>草稿 <strong className="text-muted-foreground">{stats.draft}</strong></span>
            {hasActiveFilters && submissions.length !== filteredSubmissions.length && (
              <span className="text-xs">(全部 {submissions.length} 条中筛选)</span>
            )}
          </div>
        </div>
      )}

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
      {submissions.length > 0 && viewMode === "table" && (
        <>
          {filteredSubmissions.length > 0 ? (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="admin-table">
                  {renderTableHead()}
                  <tbody>{paginatedSubmissions.map(renderRow)}</tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center">
              <p className="text-sm text-muted-foreground mb-3">无匹配结果</p>
              <button onClick={clearAllFilters} className="btn-ghost btn-sm text-xs">清除筛选</button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="btn-ghost btn-sm !h-9 !px-4 text-sm disabled:opacity-30"
              >
                上一页
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1]) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={`dot-${i}`} className="px-2 text-muted-foreground text-sm">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p as number)}
                        className={`h-9 w-9 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer
                          ${currentPage === p
                            ? "bg-primary text-primary-foreground shadow-soft"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          }`}
                      >
                        {p}
                      </button>
                    )
                  )}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="btn-ghost btn-sm !h-9 !px-4 text-sm disabled:opacity-30"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}

      {/* Grouped by challenge */}
      {submissions.length > 0 && viewMode === "groupByChallenge" && renderGroupedView(groupedByChallenge)}

      {/* Grouped by model */}
      {submissions.length > 0 && viewMode === "groupByModel" && renderGroupedView(groupedByModel)}

      {/* New submission drawer */}
      <Drawer open={drawerOpen} onClose={() => {
        setDrawerOpen(false);
        setForm({ challenge_phase_id: "", model_variant_id: "", channel_id: "", is_published: true, manual_touched: false, manual_notes: "", iteration_count: "1", duration_min: "", duration_sec: "", timing_method: "", notes: "" });
        setSelectedChallenge("");
      }} title="新建作品">
        <div className="space-y-4">
          <div>
            <label className="label mb-1 block">赛题</label>
            <CustomSelect
              searchable
              pinyinSearch
              options={challenges.map(c => ({ value: c.id, label: c.title }))}
              value={selectedChallenge}
              onChange={setSelectedChallenge}
              placeholder="搜索赛题（支持拼音/首字母）..."
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
              searchable
              options={variants.map(v => ({ value: v.id, label: `${v.vendor_name} / ${v.name}` }))}
              value={form.model_variant_id}
              onChange={v => setForm({...form, model_variant_id: v})}
              placeholder="选择模型..."
            />
          </div>
          <div>
            <label className="label mb-1 block">渠道</label>
            <CustomSelect
              searchable
              options={channels.map(c => ({ value: c.id, label: c.name }))}
              value={form.channel_id}
              onChange={v => setForm({...form, channel_id: v})}
              placeholder="选择渠道..."
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label mb-1 block">迭代次数</label>
              <input className="input" type="number" value={form.iteration_count} onChange={e => setForm({...form, iteration_count: e.target.value})} />
            </div>
            <div>
              <label className="label mb-1 block">耗时 (分)</label>
              <input className="input" type="number" min="0" value={form.duration_min} onChange={e => setForm({...form, duration_min: e.target.value})} placeholder="0" />
            </div>
            <div>
              <label className="label mb-1 block">耗时 (秒)</label>
              <input className="input" type="number" min="0" step="0.1" value={form.duration_sec} onChange={e => setForm({...form, duration_sec: e.target.value})} placeholder="0" />
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
              onChange={handleArtifactTypeChange}
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
                  {mode === "paste" ? (artifactType === "screenshot" ? "粘贴截图" : artifactType === "prd" ? "粘贴文本" : "粘贴代码") : "文件上传"}
                </button>
              ))}
            </div>
          </div>

          {/* === Paste mode === */}
          {uploadMode === "paste" && artifactType === "screenshot" && (
            /* Screenshot paste mode */
            <div
              className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border
                         bg-muted/30 px-6 py-8 cursor-pointer transition-all duration-300
                         hover:border-primary/50 hover:bg-primary/5 focus-within:border-primary/50"
              onPaste={handleImagePaste}
              tabIndex={0}
            >
              {pastedImageUrl ? (
                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="badge-primary text-xs">已粘贴</span>
                      <span className="text-xs text-muted-foreground">
                        {(pastedImage!.size / 1024).toFixed(1)} KB · {pastedImage!.type}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="h-7 w-7 rounded-full flex items-center justify-center
                                 text-muted-foreground hover:text-destructive hover:bg-destructive/10
                                 transition-all duration-200"
                      onClick={() => { setPastedImage(null); setPastedImageUrl(null); }}
                      title="移除"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <img src={pastedImageUrl} alt="粘贴的截图" className="rounded-xl max-h-48 w-full object-contain bg-muted/50" />
                  <div>
                    <label className="label text-xs mb-1 block">文件名</label>
                    <input
                      className="input !h-8 text-sm"
                      value={pasteFileName}
                      onChange={(e) => setPasteFileName(e.target.value)}
                      placeholder="screenshot.png"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10
                                  group-hover:bg-primary/15 transition-colors duration-300">
                    <ClipboardPaste className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-heading font-bold text-foreground">点击此处后按 Ctrl+V 粘贴截图</p>
                    <p className="text-xs text-muted-foreground mt-1">支持 PNG、JPG、WebP</p>
                  </div>
                </>
              )}
            </div>
          )}

          {uploadMode === "paste" && artifactType !== "screenshot" && (
            <>
              <div>
                <label className="label mb-1 block">文件名</label>
                <input
                  className="input"
                  value={pasteFileName}
                  onChange={(e) => setPasteFileName(e.target.value)}
                  placeholder={artifactType === "prd" ? "prd.md" : "index.html"}
                />
              </div>
              <div>
                <label className="label mb-1 block">{artifactType === "prd" ? "PRD 文本" : "HTML 代码"}</label>
                <textarea
                  className="textarea !min-h-[180px] font-mono text-xs leading-relaxed"
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder={artifactType === "prd" ? "粘贴 PRD 文本（Markdown / 纯文本）..." : "粘贴 HTML 代码..."}
                />
              </div>
              {/* Parse preview */}
              {pasteContent.trim() && (
                <div className="rounded-2xl border border-border/50 bg-muted/30 p-4 space-y-2">
                  {artifactType === "prd" ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="badge-primary text-xs">文本预览</span>
                        <span className="text-xs text-muted-foreground">
                          {(new Blob([pasteContent]).size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap break-all leading-relaxed max-h-24 overflow-hidden">
                        {pasteContent.split("\n").slice(0, 5).join("\n")}
                        {pasteContent.split("\n").length > 5 && "\n..."}
                      </pre>
                    </>
                  ) : parseResult ? (
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
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label mb-1 block">迭代次数</label>
              <input className="input" type="number" value={editForm.iteration_count} onChange={e => setEditForm({...editForm, iteration_count: e.target.value})} />
            </div>
            <div>
              <label className="label mb-1 block">耗时 (分)</label>
              <input className="input" type="number" min="0" value={editForm.duration_min} onChange={e => setEditForm({...editForm, duration_min: e.target.value})} placeholder="0" />
            </div>
            <div>
              <label className="label mb-1 block">耗时 (秒)</label>
              <input className="input" type="number" min="0" step="0.1" value={editForm.duration_sec} onChange={e => setEditForm({...editForm, duration_sec: e.target.value})} placeholder="0" />
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
