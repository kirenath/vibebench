"use client";

import { useState, useEffect, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Types (inline to avoid extra imports, mirrors src/types)          */
/* ------------------------------------------------------------------ */

interface Challenge {
  id: string;
  title: string;
  is_published: boolean;
  [key: string]: unknown;
}

interface ChallengePhase {
  id: string;
  challenge_id: string;
  phase_key: string;
  phase_label: string;
  sort_order: number;
  [key: string]: unknown;
}

interface ModelVariant {
  id: string;
  family_id: string;
  name: string;
  [key: string]: unknown;
}

interface Channel {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface SubmissionOverview {
  submission_id: string;
  challenge_id: string;
  challenge_title: string;
  challenge_phase_id: string;
  phase_key: string;
  phase_label: string;
  model_variant_id: string;
  model_variant_name: string;
  channel_id: string;
  channel_name: string;
  submission_is_published: boolean;
  manual_touched: boolean;
  manual_notes: string | null;
  iteration_count: number | null;
  duration_ms: number | null;
  timing_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  has_html: boolean;
  has_prd: boolean;
  has_screenshot: boolean;
  [key: string]: unknown;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Request failed");
  return json.data as T;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString();
}

function fmtDuration(ms: number | null): string {
  if (ms == null) return "-";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/* ------------------------------------------------------------------ */
/*  Shared style classes                                              */
/* ------------------------------------------------------------------ */

const selectCls =
  "h-12 w-full rounded-2xl border border-timber bg-white/50 px-4 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none";
const inputCls =
  "h-12 w-full rounded-2xl border border-timber bg-white/50 px-4 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none";
const btnPrimary =
  "rounded-full bg-moss px-6 py-2.5 text-sm font-semibold text-pale-mist shadow-soft transition-all duration-300 hover:scale-105 hover:shadow-[0_6px_24px_-4px_rgba(93,112,82,0.25)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";
const btnSecondary =
  "rounded-full border border-timber bg-white/50 px-4 py-2 text-sm font-medium text-dried-grass transition-all hover:border-moss hover:text-moss";
const btnDanger =
  "rounded-full bg-burnt-sienna px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95";

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function SubmissionsAdminPage() {
  // ---- master data ----
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [modelVariants, setModelVariants] = useState<ModelVariant[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionOverview[]>([]);

  // ---- filter state ----
  const [filterChallengeId, setFilterChallengeId] = useState("");
  const [filterPhaseId, setFilterPhaseId] = useState("");
  const [filterModelVariantId, setFilterModelVariantId] = useState("");
  const [filterChannelId, setFilterChannelId] = useState("");
  const [filterPhases, setFilterPhases] = useState<ChallengePhase[]>([]);

  // ---- view toggle ----
  const [viewMode, setViewMode] = useState<"table" | "matrix">("table");

  // ---- create form ----
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [createChallengeId, setCreateChallengeId] = useState("");
  const [createPhases, setCreatePhases] = useState<ChallengePhase[]>([]);
  const [createPhaseId, setCreatePhaseId] = useState("");
  const [createModelVariantId, setCreateModelVariantId] = useState("");
  const [createChannelId, setCreateChannelId] = useState("");
  const [createIsPublished, setCreateIsPublished] = useState(false);
  const [createManualTouched, setCreateManualTouched] = useState(false);
  const [createManualNotes, setCreateManualNotes] = useState("");
  const [createIterationCount, setCreateIterationCount] = useState("");
  const [createDurationMs, setCreateDurationMs] = useState("");
  const [createTimingMethod, setCreateTimingMethod] = useState("");
  const [createNotes, setCreateNotes] = useState("");
  const [createHtml, setCreateHtml] = useState<File | null>(null);
  const [createPrd, setCreatePrd] = useState<File | null>(null);
  const [createScreenshot, setCreateScreenshot] = useState<File | null>(null);

  // ---- edit modal ----
  const [editingSubmission, setEditingSubmission] = useState<SubmissionOverview | null>(null);
  const [editIsPublished, setEditIsPublished] = useState(false);
  const [editManualTouched, setEditManualTouched] = useState(false);
  const [editManualNotes, setEditManualNotes] = useState("");
  const [editIterationCount, setEditIterationCount] = useState("");
  const [editDurationMs, setEditDurationMs] = useState("");
  const [editTimingMethod, setEditTimingMethod] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // ---- artifact upload for a row ----
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  // ---- status messages ----
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // ---- matrix state ----
  const [matrixChallengeId, setMatrixChallengeId] = useState("");

  /* ---------------------------------------------------------------- */
  /*  Initial data fetch                                              */
  /* ---------------------------------------------------------------- */

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [c, ch, mv, s] = await Promise.all([
        api<Challenge[]>("/api/challenges?all=true"),
        api<Channel[]>("/api/channels"),
        api<ModelVariant[]>("/api/model-variants?all=true"),
        api<SubmissionOverview[]>("/api/submissions?all=true"),
      ]);
      setChallenges(c);
      setChannels(ch);
      setModelVariants(mv);
      setSubmissions(s);
    } catch (e) {
      setMessage({ type: "err", text: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  /* ---------------------------------------------------------------- */
  /*  Fetch phases when filter challenge changes                      */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (!filterChallengeId) {
      setFilterPhases([]);
      setFilterPhaseId("");
      return;
    }
    api<ChallengePhase[]>(`/api/challenges/${filterChallengeId}/phases`)
      .then(setFilterPhases)
      .catch(() => setFilterPhases([]));
  }, [filterChallengeId]);

  /* ---------------------------------------------------------------- */
  /*  Fetch phases when create-form challenge changes                 */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (!createChallengeId) {
      setCreatePhases([]);
      setCreatePhaseId("");
      return;
    }
    api<ChallengePhase[]>(`/api/challenges/${createChallengeId}/phases`)
      .then(setCreatePhases)
      .catch(() => setCreatePhases([]));
  }, [createChallengeId]);

  /* ---------------------------------------------------------------- */
  /*  Message auto-clear                                              */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  /* ---------------------------------------------------------------- */
  /*  Filtered submissions                                            */
  /* ---------------------------------------------------------------- */

  const filtered = submissions.filter((s) => {
    if (filterChallengeId && s.challenge_id !== filterChallengeId) return false;
    if (filterPhaseId && s.challenge_phase_id !== filterPhaseId) return false;
    if (filterModelVariantId && s.model_variant_id !== filterModelVariantId) return false;
    if (filterChannelId && s.channel_id !== filterChannelId) return false;
    return true;
  });

  /* ---------------------------------------------------------------- */
  /*  Actions                                                         */
  /* ---------------------------------------------------------------- */

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("challenge_phase_id", createPhaseId);
      fd.append("model_variant_id", createModelVariantId);
      fd.append("channel_id", createChannelId);
      fd.append("is_published", String(createIsPublished));
      fd.append("manual_touched", String(createManualTouched));
      if (createManualNotes) fd.append("manual_notes", createManualNotes);
      if (createIterationCount) fd.append("iteration_count", createIterationCount);
      if (createDurationMs) fd.append("duration_ms", createDurationMs);
      if (createTimingMethod) fd.append("timing_method", createTimingMethod);
      if (createNotes) fd.append("notes", createNotes);
      if (createHtml) fd.append("html", createHtml);
      if (createPrd) fd.append("prd", createPrd);
      if (createScreenshot) fd.append("screenshot", createScreenshot);

      await api("/api/submissions", { method: "POST", body: fd });
      setMessage({ type: "ok", text: "Submission created" });
      resetCreateForm();
      await loadAll();
    } catch (e) {
      setMessage({ type: "err", text: (e as Error).message });
    }
  }

  function resetCreateForm() {
    setCreateFormOpen(false);
    setCreateChallengeId("");
    setCreatePhases([]);
    setCreatePhaseId("");
    setCreateModelVariantId("");
    setCreateChannelId("");
    setCreateIsPublished(false);
    setCreateManualTouched(false);
    setCreateManualNotes("");
    setCreateIterationCount("");
    setCreateDurationMs("");
    setCreateTimingMethod("");
    setCreateNotes("");
    setCreateHtml(null);
    setCreatePrd(null);
    setCreateScreenshot(null);
  }

  function openEditModal(s: SubmissionOverview) {
    setEditingSubmission(s);
    setEditIsPublished(s.submission_is_published);
    setEditManualTouched(s.manual_touched);
    setEditManualNotes(s.manual_notes || "");
    setEditIterationCount(s.iteration_count != null ? String(s.iteration_count) : "");
    setEditDurationMs(s.duration_ms != null ? String(s.duration_ms) : "");
    setEditTimingMethod(s.timing_method || "");
    setEditNotes(s.notes || "");
  }

  async function handleEditSave() {
    if (!editingSubmission) return;
    try {
      const body: Record<string, unknown> = {};
      body.is_published = editIsPublished;
      body.manual_touched = editManualTouched;
      body.manual_notes = editManualNotes || null;
      body.iteration_count = editIterationCount ? parseInt(editIterationCount, 10) : null;
      body.duration_ms = editDurationMs ? parseInt(editDurationMs, 10) : null;
      body.timing_method = editTimingMethod || null;
      body.notes = editNotes || null;

      await api(`/api/submissions/${editingSubmission.submission_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setMessage({ type: "ok", text: "Submission updated" });
      setEditingSubmission(null);
      await loadAll();
    } catch (e) {
      setMessage({ type: "err", text: (e as Error).message });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this submission and all its artifacts?")) return;
    try {
      await api(`/api/submissions/${id}`, { method: "DELETE" });
      setMessage({ type: "ok", text: "Submission deleted" });
      await loadAll();
    } catch (e) {
      setMessage({ type: "err", text: (e as Error).message });
    }
  }

  async function handleArtifactUpload(submissionId: string, type: string, file: File) {
    try {
      const fd = new FormData();
      fd.append("file", file);
      await api(`/api/submissions/${submissionId}/artifacts/${type}`, {
        method: "POST",
        body: fd,
      });
      setMessage({ type: "ok", text: `${type} uploaded` });
      setUploadingFor(null);
      await loadAll();
    } catch (e) {
      setMessage({ type: "err", text: (e as Error).message });
    }
  }

  async function handleArtifactDelete(submissionId: string, type: string) {
    if (!confirm(`Delete ${type} artifact?`)) return;
    try {
      await api(`/api/submissions/${submissionId}/artifacts/${type}`, {
        method: "DELETE",
      });
      setMessage({ type: "ok", text: `${type} deleted` });
      await loadAll();
    } catch (e) {
      setMessage({ type: "err", text: (e as Error).message });
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Matrix data                                                     */
  /* ---------------------------------------------------------------- */

  const matrixChallenge = matrixChallengeId || filterChallengeId || (challenges[0]?.id ?? "");
  const matrixPhases = filterChallengeId === matrixChallenge ? filterPhases : challenges.find((c) => c.id === matrixChallenge) ? (() => {
    const phaseIds = new Set<string>();
    const result: ChallengePhase[] = [];
    for (const s of submissions) {
      if (s.challenge_id === matrixChallenge && !phaseIds.has(s.challenge_phase_id)) {
        phaseIds.add(s.challenge_phase_id);
        result.push({
          id: s.challenge_phase_id,
          challenge_id: matrixChallenge,
          phase_key: s.phase_key,
          phase_label: s.phase_label,
          sort_order: 0,
        });
      }
    }
    return result;
  })() : [];

  const submissionMap = new Map<string, boolean>();
  for (const s of submissions) {
    if (s.challenge_id === matrixChallenge) {
      const key = `${s.challenge_phase_id}|${s.model_variant_id}|${s.channel_id}`;
      submissionMap.set(key, true);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                          */
  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-dried-grass">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2
          className="text-2xl font-semibold text-deep-loam"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Submissions
        </h2>
        <div className="flex gap-2">
          <button
            className={btnPrimary}
            onClick={() => setCreateFormOpen(!createFormOpen)}
          >
            {createFormOpen ? "Cancel" : "Create Submission"}
          </button>
          <button
            className={btnSecondary}
            onClick={() => setViewMode(viewMode === "table" ? "matrix" : "table")}
          >
            {viewMode === "table" ? "Matrix View" : "Table View"}
          </button>
        </div>
      </div>

      {/* Message banner */}
      {message && (
        <div
          className={`rounded-[2rem] px-5 py-3 text-sm font-medium ${
            message.type === "ok"
              ? "bg-moss/10 text-moss"
              : "bg-burnt-sienna/10 text-burnt-sienna"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ============================================================ */}
      {/*  CREATE FORM                                                 */}
      {/* ============================================================ */}

      {createFormOpen && (
        <form
          onSubmit={handleCreate}
          className="rounded-[2rem] border border-timber/50 bg-card p-6 space-y-5 shadow-soft"
        >
          <h3
            className="text-lg font-semibold text-deep-loam"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            New Submission
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-dried-grass">Challenge</label>
              <select
                className={selectCls}
                value={createChallengeId}
                onChange={(e) => setCreateChallengeId(e.target.value)}
                required
              >
                <option value="">-- select --</option>
                {challenges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-dried-grass">Phase</label>
              <select
                className={selectCls}
                value={createPhaseId}
                onChange={(e) => setCreatePhaseId(e.target.value)}
                required
                disabled={!createPhases.length}
              >
                <option value="">-- select --</option>
                {createPhases.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.phase_label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-dried-grass">Model Variant</label>
              <select
                className={selectCls}
                value={createModelVariantId}
                onChange={(e) => setCreateModelVariantId(e.target.value)}
                required
              >
                <option value="">-- select --</option>
                {modelVariants.map((mv) => (
                  <option key={mv.id} value={mv.id}>
                    {mv.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-dried-grass">Channel</label>
              <select
                className={selectCls}
                value={createChannelId}
                onChange={(e) => setCreateChannelId(e.target.value)}
                required
              >
                <option value="">-- select --</option>
                {channels.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-dried-grass">Timing Method</label>
              <select
                className={selectCls}
                value={createTimingMethod}
                onChange={(e) => setCreateTimingMethod(e.target.value)}
              >
                <option value="">-- none --</option>
                <option value="manual">Manual</option>
                <option value="measured">Measured</option>
                <option value="estimated">Estimated</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-dried-grass">Duration (ms)</label>
              <input
                type="number"
                className={inputCls}
                value={createDurationMs}
                onChange={(e) => setCreateDurationMs(e.target.value)}
                placeholder="e.g. 120000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-dried-grass">Iteration Count</label>
              <input
                type="number"
                className={inputCls}
                value={createIterationCount}
                onChange={(e) => setCreateIterationCount(e.target.value)}
                placeholder="e.g. 3"
              />
            </div>
            <div className="flex items-end gap-6">
              <label className="flex items-center gap-2 text-sm text-bark">
                <input
                  type="checkbox"
                  checked={createIsPublished}
                  onChange={(e) => setCreateIsPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-timber bg-white/50 text-moss focus:ring-moss/30"
                />
                Published
              </label>
              <label className="flex items-center gap-2 text-sm text-bark">
                <input
                  type="checkbox"
                  checked={createManualTouched}
                  onChange={(e) => setCreateManualTouched(e.target.checked)}
                  className="h-4 w-4 rounded border-timber bg-white/50 text-moss focus:ring-moss/30"
                />
                Manual Touched
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-dried-grass">Notes</label>
            <textarea
              className="w-full rounded-2xl border border-timber bg-white/50 px-4 py-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none"
              rows={2}
              value={createNotes}
              onChange={(e) => setCreateNotes(e.target.value)}
              placeholder="Optional notes..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-dried-grass">Manual Notes</label>
            <textarea
              className="w-full rounded-2xl border border-timber bg-white/50 px-4 py-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none"
              rows={2}
              value={createManualNotes}
              onChange={(e) => setCreateManualNotes(e.target.value)}
              placeholder="Notes about manual editing..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-dried-grass">HTML file</label>
              <input
                type="file"
                accept=".html,.htm"
                onChange={(e) => setCreateHtml(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-dried-grass file:mr-3 file:rounded-full file:border-0 file:bg-moss/10 file:px-4 file:py-1.5 file:text-sm file:font-medium file:text-moss hover:file:bg-moss/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-dried-grass">PRD file</label>
              <input
                type="file"
                accept=".md,.txt,.pdf"
                onChange={(e) => setCreatePrd(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-dried-grass file:mr-3 file:rounded-full file:border-0 file:bg-moss/10 file:px-4 file:py-1.5 file:text-sm file:font-medium file:text-moss hover:file:bg-moss/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-dried-grass">Screenshot</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCreateScreenshot(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-dried-grass file:mr-3 file:rounded-full file:border-0 file:bg-moss/10 file:px-4 file:py-1.5 file:text-sm file:font-medium file:text-moss hover:file:bg-moss/20"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className={btnPrimary}>
              Submit
            </button>
            <button type="button" className={btnSecondary} onClick={resetCreateForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ============================================================ */}
      {/*  FILTERS                                                     */}
      {/* ============================================================ */}

      <div className="rounded-[2rem] border border-timber/50 bg-card p-5 shadow-soft">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-dried-grass">Challenge</label>
            <select
              className={selectCls}
              value={filterChallengeId}
              onChange={(e) => {
                setFilterChallengeId(e.target.value);
                setFilterPhaseId("");
              }}
            >
              <option value="">All Challenges</option>
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-dried-grass">Phase</label>
            <select
              className={selectCls}
              value={filterPhaseId}
              onChange={(e) => setFilterPhaseId(e.target.value)}
              disabled={!filterPhases.length}
            >
              <option value="">All Phases</option>
              {filterPhases.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.phase_label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-dried-grass">Model Variant</label>
            <select
              className={selectCls}
              value={filterModelVariantId}
              onChange={(e) => setFilterModelVariantId(e.target.value)}
            >
              <option value="">All Models</option>
              {modelVariants.map((mv) => (
                <option key={mv.id} value={mv.id}>
                  {mv.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-dried-grass">Channel</label>
            <select
              className={selectCls}
              value={filterChannelId}
              onChange={(e) => setFilterChannelId(e.target.value)}
            >
              <option value="">All Channels</option>
              {channels.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  TABLE VIEW                                                  */}
      {/* ============================================================ */}

      {viewMode === "table" && (
        <div className="overflow-hidden rounded-[2rem] border border-timber/50 shadow-soft">
          <table className="min-w-full divide-y divide-timber/20 text-sm">
            <thead className="bg-stone/30">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dried-grass">
                  Model Variant
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dried-grass">
                  Channel
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dried-grass">
                  Phase
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dried-grass">
                  Published
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dried-grass">
                  Manual
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dried-grass">
                  Duration
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dried-grass">
                  Artifacts
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dried-grass">
                  Created
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-dried-grass">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-timber/20 bg-card/50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-dried-grass">
                    No submissions found
                  </td>
                </tr>
              )}
              {filtered.map((s) => (
                <tr key={s.submission_id} className="transition-colors hover:bg-moss/5">
                  <td className="whitespace-nowrap px-5 py-3 font-semibold text-deep-loam">
                    {s.model_variant_name}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-dried-grass">
                    {s.channel_name}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-dried-grass">
                    {s.phase_label}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        s.submission_is_published
                          ? "bg-moss/10 text-moss"
                          : "bg-stone/60 text-dried-grass"
                      }`}
                    >
                      {s.submission_is_published ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        s.manual_touched
                          ? "bg-terracotta/10 text-terracotta"
                          : "bg-stone/60 text-dried-grass"
                      }`}
                    >
                      {s.manual_touched ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-dried-grass">
                    {fmtDuration(s.duration_ms)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <div className="flex gap-1">
                      {(["html", "prd", "screenshot"] as const).map((type) => {
                        const has = s[`has_${type}`];
                        return (
                          <span
                            key={type}
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                              has
                                ? "bg-moss/10 text-moss"
                                : "bg-stone/40 text-dried-grass/50"
                            }`}
                          >
                            {type}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-dried-grass text-xs">
                    {fmtDate(s.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className={btnSecondary}
                        onClick={() => openEditModal(s)}
                        title="Edit"
                      >
                        Edit
                      </button>

                      <span className="relative">
                        <button
                          className={btnSecondary}
                          onClick={() =>
                            setUploadingFor(
                              uploadingFor === s.submission_id ? null : s.submission_id
                            )
                          }
                          title="Upload Artifact"
                        >
                          Upload
                        </button>
                        {uploadingFor === s.submission_id && (
                          <div className="absolute right-0 top-full z-10 mt-1 w-52 rounded-[1.5rem] border border-timber/50 bg-card p-3 shadow-float">
                            {(["html", "prd", "screenshot"] as const).map((type) => (
                              <div key={type} className="mb-2 last:mb-0">
                                <label className="mb-1 block text-xs font-medium text-dried-grass">
                                  {type}
                                </label>
                                <input
                                  type="file"
                                  className="block w-full text-xs text-dried-grass file:mr-2 file:rounded-full file:border-0 file:bg-moss/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-moss"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleArtifactUpload(s.submission_id, type, f);
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </span>

                      {(["html", "prd", "screenshot"] as const).map(
                        (type) =>
                          s[`has_${type}`] && (
                            <button
                              key={`del-${type}`}
                              className="rounded-full border border-timber/50 bg-white/50 px-3 py-1.5 text-xs font-medium text-dried-grass transition-all hover:border-burnt-sienna hover:text-burnt-sienna"
                              onClick={() => handleArtifactDelete(s.submission_id, type)}
                              title={`Delete ${type}`}
                            >
                              Del {type}
                            </button>
                          )
                      )}

                      <button
                        className={btnDanger}
                        onClick={() => handleDelete(s.submission_id)}
                        title="Delete submission"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================ */}
      {/*  MATRIX VIEW                                                 */}
      {/* ============================================================ */}

      {viewMode === "matrix" && (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-dried-grass">
              Matrix Challenge
            </label>
            <select
              className={selectCls + " max-w-xs"}
              value={matrixChallengeId}
              onChange={(e) => setMatrixChallengeId(e.target.value)}
            >
              <option value="">Use filter challenge</option>
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {!matrixChallenge ? (
            <p className="text-dried-grass text-sm">Select a challenge to view matrix.</p>
          ) : (
            <div className="overflow-hidden rounded-[2rem] border border-timber/50 bg-card p-5 shadow-soft">
              {(() => {
                const phaseList = matrixPhases;
                const mvList = modelVariants;
                const chList = channels;

                if (!phaseList.length || !mvList.length || !chList.length) {
                  return (
                    <p className="text-dried-grass text-sm">
                      Not enough data to build matrix.
                    </p>
                  );
                }

                return (
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr>
                        <th className="px-2 py-2 text-left font-medium text-dried-grass">Phase</th>
                        <th className="px-2 py-2 text-left font-medium text-dried-grass">Model</th>
                        {chList.map((ch) => (
                          <th
                            key={ch.id}
                            className="px-2 py-2 text-center font-medium text-dried-grass"
                          >
                            {ch.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {phaseList.map((phase) =>
                        mvList.map((mv, mvIdx) => (
                          <tr key={`${phase.id}-${mv.id}`} className="border-t border-timber/20">
                            {mvIdx === 0 && (
                              <td
                                className="px-2 py-2 font-semibold text-deep-loam align-top border-r border-timber/20"
                                rowSpan={mvList.length}
                              >
                                {phase.phase_label}
                              </td>
                            )}
                            <td className="px-2 py-2 text-dried-grass whitespace-nowrap">
                              {mv.name}
                            </td>
                            {chList.map((ch) => {
                              const key = `${phase.id}|${mv.id}|${ch.id}`;
                              const exists = submissionMap.get(key) || false;
                              return (
                                <td
                                  key={ch.id}
                                  className="px-2 py-2 text-center"
                                >
                                  <span
                                    className={`inline-block h-5 w-5 rounded-full ${
                                      exists
                                        ? "bg-moss"
                                        : "bg-burnt-sienna/20"
                                    }`}
                                    title={exists ? "Submitted" : "Missing"}
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/*  EDIT MODAL                                                  */}
      {/* ============================================================ */}

      {editingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-loam/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-timber/50 bg-card p-8 shadow-float space-y-5">
            <h3
              className="text-xl font-semibold text-deep-loam"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Edit Submission
            </h3>
            <p className="text-xs text-dried-grass">
              {editingSubmission.model_variant_name} / {editingSubmission.channel_name} /{" "}
              {editingSubmission.phase_label}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 text-sm text-bark">
                <input
                  type="checkbox"
                  checked={editIsPublished}
                  onChange={(e) => setEditIsPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-timber bg-white/50 text-moss focus:ring-moss/30"
                />
                Published
              </label>
              <label className="flex items-center gap-2 text-sm text-bark">
                <input
                  type="checkbox"
                  checked={editManualTouched}
                  onChange={(e) => setEditManualTouched(e.target.checked)}
                  className="h-4 w-4 rounded border-timber bg-white/50 text-moss focus:ring-moss/30"
                />
                Manual Touched
              </label>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-dried-grass">Iteration Count</label>
              <input
                type="number"
                className={inputCls}
                value={editIterationCount}
                onChange={(e) => setEditIterationCount(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-dried-grass">Duration (ms)</label>
              <input
                type="number"
                className={inputCls}
                value={editDurationMs}
                onChange={(e) => setEditDurationMs(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-dried-grass">Timing Method</label>
              <select
                className={selectCls}
                value={editTimingMethod}
                onChange={(e) => setEditTimingMethod(e.target.value)}
              >
                <option value="">-- none --</option>
                <option value="manual">Manual</option>
                <option value="measured">Measured</option>
                <option value="estimated">Estimated</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-dried-grass">Manual Notes</label>
              <textarea
                className="w-full rounded-2xl border border-timber bg-white/50 px-4 py-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none"
                rows={2}
                value={editManualNotes}
                onChange={(e) => setEditManualNotes(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-dried-grass">Notes</label>
              <textarea
                className="w-full rounded-2xl border border-timber bg-white/50 px-4 py-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none"
                rows={2}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                className={btnSecondary}
                onClick={() => setEditingSubmission(null)}
              >
                Cancel
              </button>
              <button className={btnPrimary} onClick={handleEditSave}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="text-xs text-dried-grass">
        Showing {filtered.length} of {submissions.length} submissions
      </div>
    </div>
  );
}
