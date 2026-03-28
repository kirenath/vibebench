"use client";

import { useState, useEffect, useCallback } from "react";

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  rules_markdown: string | null;
  prompt_markdown: string | null;
  cover_image: string | null;
  is_published: boolean;
  sort_order: number;
  metadata: Record<string, unknown>;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Phase {
  id: string;
  challenge_id: string;
  phase_key: string;
  phase_label: string;
  description: string | null;
  sort_order: number;
  is_default: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface ChallengeFormData {
  id: string;
  title: string;
  description: string;
  rules_markdown: string;
  prompt_markdown: string;
  is_published: boolean;
  sort_order: number;
}

interface PhaseFormData {
  phase_key: string;
  phase_label: string;
  description: string;
  sort_order: number;
  is_default: boolean;
}

const EMPTY_CHALLENGE_FORM: ChallengeFormData = {
  id: "",
  title: "",
  description: "",
  rules_markdown: "",
  prompt_markdown: "",
  is_published: false,
  sort_order: 0,
};

const EMPTY_PHASE_FORM: PhaseFormData = {
  phase_key: "",
  phase_label: "",
  description: "",
  sort_order: 0,
  is_default: false,
};

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<ChallengeFormData>({ ...EMPTY_CHALLENGE_FORM });
  const [creating, setCreating] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ChallengeFormData>({ ...EMPTY_CHALLENGE_FORM });
  const [saving, setSaving] = useState(false);

  // Phase management state
  const [expandedChallengeId, setExpandedChallengeId] = useState<string | null>(null);
  const [phases, setPhases] = useState<Record<string, Phase[]>>({});
  const [phasesLoading, setPhasesLoading] = useState<Record<string, boolean>>({});
  const [showPhaseForm, setShowPhaseForm] = useState(false);
  const [phaseForm, setPhaseForm] = useState<PhaseFormData>({ ...EMPTY_PHASE_FORM });
  const [creatingPhase, setCreatingPhase] = useState(false);

  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/challenges?all=true");
      const data = await res.json();
      if (data.success) {
        setChallenges(data.data);
      } else {
        setError(data.error || "Failed to fetch challenges");
      }
    } catch {
      setError("Network error fetching challenges");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const fetchPhases = useCallback(async (challengeId: string) => {
    setPhasesLoading((prev) => ({ ...prev, [challengeId]: true }));
    try {
      const res = await fetch(`/api/challenges/${challengeId}/phases`);
      const data = await res.json();
      if (data.success) {
        setPhases((prev) => ({ ...prev, [challengeId]: data.data }));
      }
    } catch {
      // silently fail
    } finally {
      setPhasesLoading((prev) => ({ ...prev, [challengeId]: false }));
    }
  }, []);

  const handleToggleExpand = useCallback(
    (challengeId: string) => {
      if (expandedChallengeId === challengeId) {
        setExpandedChallengeId(null);
        setShowPhaseForm(false);
      } else {
        setExpandedChallengeId(challengeId);
        setShowPhaseForm(false);
        setPhaseForm({ ...EMPTY_PHASE_FORM });
        fetchPhases(challengeId);
      }
    },
    [expandedChallengeId, fetchPhases]
  );

  const handleCreate = async () => {
    if (!createForm.id.trim() || !createForm.title.trim()) return;
    try {
      setCreating(true);
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: createForm.id.trim(),
          title: createForm.title.trim(),
          description: createForm.description || null,
          rules_markdown: createForm.rules_markdown || null,
          prompt_markdown: createForm.prompt_markdown || null,
          is_published: createForm.is_published,
          sort_order: createForm.sort_order,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCreateForm({ ...EMPTY_CHALLENGE_FORM });
        setShowCreateForm(false);
        await fetchChallenges();
      } else {
        alert(data.error || "Failed to create challenge");
      }
    } catch {
      alert("Network error creating challenge");
    } finally {
      setCreating(false);
    }
  };

  const handleStartEdit = (challenge: Challenge) => {
    setEditingId(challenge.id);
    setEditForm({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description || "",
      rules_markdown: challenge.rules_markdown || "",
      prompt_markdown: challenge.prompt_markdown || "",
      is_published: challenge.is_published,
      sort_order: challenge.sort_order,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ ...EMPTY_CHALLENGE_FORM });
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editForm.title.trim()) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/challenges/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title.trim(),
          description: editForm.description || null,
          rules_markdown: editForm.rules_markdown || null,
          prompt_markdown: editForm.prompt_markdown || null,
          is_published: editForm.is_published,
          sort_order: editForm.sort_order,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingId(null);
        await fetchChallenges();
      } else {
        alert(data.error || "Failed to update challenge");
      }
    } catch {
      alert("Network error updating challenge");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete challenge "${title}" (${id})? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/challenges/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        if (expandedChallengeId === id) {
          setExpandedChallengeId(null);
        }
        await fetchChallenges();
      } else {
        alert(data.error || "Failed to delete challenge");
      }
    } catch {
      alert("Network error deleting challenge");
    }
  };

  const handleCreatePhase = async () => {
    if (!expandedChallengeId || !phaseForm.phase_key.trim() || !phaseForm.phase_label.trim()) return;
    try {
      setCreatingPhase(true);
      const res = await fetch(`/api/challenges/${expandedChallengeId}/phases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase_key: phaseForm.phase_key.trim(),
          phase_label: phaseForm.phase_label.trim(),
          description: phaseForm.description || null,
          sort_order: phaseForm.sort_order,
          is_default: phaseForm.is_default,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPhaseForm({ ...EMPTY_PHASE_FORM });
        setShowPhaseForm(false);
        await fetchPhases(expandedChallengeId);
      } else {
        alert(data.error || "Failed to create phase");
      }
    } catch {
      alert("Network error creating phase");
    } finally {
      setCreatingPhase(false);
    }
  };

  const handleDeletePhase = async (phaseId: string, phaseLabel: string) => {
    if (!expandedChallengeId) return;
    if (!confirm(`Delete phase "${phaseLabel}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/challenge-phases/${phaseId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        await fetchPhases(expandedChallengeId);
      } else {
        alert(data.error || "Failed to delete phase");
      }
    } catch {
      alert("Network error deleting phase");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-dried-grass">Loading challenges...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2
          className="text-2xl font-semibold text-deep-loam"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Challenge Management
        </h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="rounded-full bg-moss px-6 py-2.5 text-sm font-semibold text-pale-mist shadow-soft transition-all duration-300 hover:scale-105 hover:shadow-[0_6px_24px_-4px_rgba(93,112,82,0.25)] active:scale-95"
        >
          {showCreateForm ? "Cancel" : "Create Challenge"}
        </button>
      </div>

      {error && (
        <div className="rounded-[2rem] border border-burnt-sienna/30 bg-burnt-sienna/5 p-5 text-sm font-medium text-burnt-sienna">
          {error}
        </div>
      )}

      {/* Create Challenge Form */}
      {showCreateForm && (
        <div className="rounded-[2rem] border border-timber/50 bg-card p-6 space-y-5 shadow-soft">
          <h3
            className="text-lg font-semibold text-deep-loam"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            New Challenge
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-bark">ID *</label>
              <input
                type="text"
                value={createForm.id}
                onChange={(e) => setCreateForm((f) => ({ ...f, id: e.target.value }))}
                className="h-12 w-full rounded-2xl border border-timber bg-white/50 px-4 text-sm text-foreground placeholder-dried-grass/50 transition-all focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none"
                placeholder="e.g. my-challenge"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-bark">Title *</label>
              <input
                type="text"
                value={createForm.title}
                onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                className="h-12 w-full rounded-2xl border border-timber bg-white/50 px-4 text-sm text-foreground placeholder-dried-grass/50 transition-all focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none"
                placeholder="Challenge title"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-bark">Description</label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full rounded-2xl border border-timber bg-white/50 px-4 py-3 text-sm text-foreground placeholder-dried-grass/50 transition-all focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none"
              placeholder="Challenge description"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-bark">Rules (Markdown)</label>
            <textarea
              value={createForm.rules_markdown}
              onChange={(e) => setCreateForm((f) => ({ ...f, rules_markdown: e.target.value }))}
              rows={4}
              className="w-full rounded-2xl border border-timber bg-white/50 px-4 py-3 font-mono text-sm text-foreground placeholder-dried-grass/50 transition-all focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none"
              placeholder="Rules in markdown format"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-bark">Prompt (Markdown)</label>
            <textarea
              value={createForm.prompt_markdown}
              onChange={(e) => setCreateForm((f) => ({ ...f, prompt_markdown: e.target.value }))}
              rows={4}
              className="w-full rounded-2xl border border-timber bg-white/50 px-4 py-3 font-mono text-sm text-foreground placeholder-dried-grass/50 transition-all focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none"
              placeholder="Prompt template in markdown format"
            />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={createForm.is_published}
                onChange={(e) => setCreateForm((f) => ({ ...f, is_published: e.target.checked }))}
                className="h-4 w-4 rounded border-timber bg-white/50 text-moss focus:ring-moss/30"
              />
              <span className="text-sm text-bark">Published</span>
            </label>
            <div className="flex items-center gap-2">
              <label className="text-sm text-bark">Sort Order</label>
              <input
                type="number"
                value={createForm.sort_order}
                onChange={(e) => setCreateForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                className="h-10 w-20 rounded-2xl border border-timber bg-white/50 px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none"
              />
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating || !createForm.id.trim() || !createForm.title.trim()}
            className="rounded-full bg-moss px-8 py-2.5 text-sm font-semibold text-pale-mist shadow-soft transition-all duration-300 hover:scale-105 hover:shadow-[0_6px_24px_-4px_rgba(93,112,82,0.25)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
      )}

      {/* Challenges List */}
      {challenges.length === 0 && !loading ? (
        <div className="grain-overlay rounded-[2rem] border border-timber/50 bg-card p-16 text-center shadow-soft">
          <p className="text-dried-grass">No challenges found. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="overflow-hidden rounded-[2rem] border border-timber/50 bg-card shadow-soft">
              {/* Challenge Row */}
              {editingId === challenge.id ? (
                /* Inline Edit Form */
                <div className="p-6 space-y-4">
                  <h3 className="text-sm font-medium text-dried-grass">
                    Editing: <span className="font-semibold text-deep-loam">{challenge.id}</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-bark">Title *</label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                        className="h-12 w-full rounded-2xl border border-timber bg-white/50 px-4 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none"
                      />
                    </div>
                    <div className="flex items-end gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editForm.is_published}
                          onChange={(e) => setEditForm((f) => ({ ...f, is_published: e.target.checked }))}
                          className="h-4 w-4 rounded border-timber bg-white/50 text-moss focus:ring-moss/30"
                        />
                        <span className="text-sm text-bark">Published</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-bark">Sort</label>
                        <input
                          type="number"
                          value={editForm.sort_order}
                          onChange={(e) => setEditForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                          className="h-10 w-20 rounded-2xl border border-timber bg-white/50 px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-bark">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                      rows={2}
                      className="w-full rounded-2xl border border-timber bg-white/50 px-4 py-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-bark">Rules (Markdown)</label>
                      <textarea
                        value={editForm.rules_markdown}
                        onChange={(e) => setEditForm((f) => ({ ...f, rules_markdown: e.target.value }))}
                        rows={3}
                        className="w-full rounded-2xl border border-timber bg-white/50 px-4 py-3 font-mono text-sm text-foreground focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-bark">Prompt (Markdown)</label>
                      <textarea
                        value={editForm.prompt_markdown}
                        onChange={(e) => setEditForm((f) => ({ ...f, prompt_markdown: e.target.value }))}
                        rows={3}
                        className="w-full rounded-2xl border border-timber bg-white/50 px-4 py-3 font-mono text-sm text-foreground focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving || !editForm.title.trim()}
                      className="rounded-full bg-moss px-6 py-2 text-sm font-semibold text-pale-mist shadow-soft transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="rounded-full border border-timber px-6 py-2 text-sm font-medium text-dried-grass transition-all hover:border-moss hover:text-moss"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Display Row */
                <div className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          challenge.is_published
                            ? "bg-moss/10 text-moss"
                            : "bg-stone/60 text-dried-grass"
                        }`}
                      >
                        {challenge.is_published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-dried-grass/60">{challenge.id}</span>
                      </div>
                      <p className="truncate text-sm font-semibold text-deep-loam">{challenge.title}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-dried-grass/60">Sort: {challenge.sort_order}</p>
                      <p className="text-xs text-dried-grass/60">{formatDate(challenge.created_at)}</p>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleExpand(challenge.id)}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 ${
                        expandedChallengeId === challenge.id
                          ? "bg-moss text-pale-mist"
                          : "border border-timber text-dried-grass hover:border-moss hover:text-moss"
                      }`}
                    >
                      Phases
                    </button>
                    <button
                      onClick={() => handleStartEdit(challenge)}
                      className="rounded-full border border-timber px-4 py-1.5 text-xs font-semibold text-dried-grass transition-all hover:border-terracotta hover:text-terracotta"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(challenge.id, challenge.title)}
                      className="rounded-full bg-burnt-sienna px-4 py-1.5 text-xs font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {/* Phase Management Section */}
              {expandedChallengeId === challenge.id && editingId !== challenge.id && (
                <div className="border-t border-timber/30 bg-stone/20 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-bark">Phases</h4>
                    <button
                      onClick={() => {
                        setShowPhaseForm(!showPhaseForm);
                        setPhaseForm({ ...EMPTY_PHASE_FORM });
                      }}
                      className="rounded-full bg-moss px-4 py-1.5 text-xs font-semibold text-pale-mist transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      {showPhaseForm ? "Cancel" : "Add Phase"}
                    </button>
                  </div>

                  {phasesLoading[challenge.id] ? (
                    <p className="text-xs text-dried-grass py-2">Loading phases...</p>
                  ) : (phases[challenge.id] || []).length === 0 ? (
                    <p className="text-xs text-dried-grass py-2">No phases configured for this challenge.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-timber/30 text-left text-xs font-medium text-dried-grass">
                            <th className="pb-2 pr-4">Phase Key</th>
                            <th className="pb-2 pr-4">Label</th>
                            <th className="pb-2 pr-4">Description</th>
                            <th className="pb-2 pr-4">Sort</th>
                            <th className="pb-2 pr-4">Default</th>
                            <th className="pb-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(phases[challenge.id] || []).map((phase) => (
                            <tr key={phase.id} className="border-b border-timber/20">
                              <td className="py-2.5 pr-4 font-mono text-xs text-dried-grass">{phase.phase_key}</td>
                              <td className="py-2.5 pr-4 font-medium text-deep-loam">{phase.phase_label}</td>
                              <td className="py-2.5 pr-4 max-w-xs truncate text-dried-grass">
                                {phase.description || "\u2014"}
                              </td>
                              <td className="py-2.5 pr-4 text-dried-grass">{phase.sort_order}</td>
                              <td className="py-2.5 pr-4">
                                {phase.is_default ? (
                                  <span className="text-xs font-semibold text-moss">Yes</span>
                                ) : (
                                  <span className="text-xs text-dried-grass/50">No</span>
                                )}
                              </td>
                              <td className="py-2.5">
                                <button
                                  onClick={() => handleDeletePhase(phase.id, phase.phase_label)}
                                  className="rounded-full bg-burnt-sienna px-3 py-1 text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Add Phase Form */}
                  {showPhaseForm && (
                    <div className="rounded-[2rem] border border-timber/50 bg-card p-4 space-y-3">
                      <h5 className="text-sm font-semibold text-bark">New Phase</h5>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-dried-grass">Phase Key *</label>
                          <input
                            type="text"
                            value={phaseForm.phase_key}
                            onChange={(e) => setPhaseForm((f) => ({ ...f, phase_key: e.target.value }))}
                            className="h-10 w-full rounded-2xl border border-timber bg-white/50 px-3 text-sm text-foreground placeholder-dried-grass/50 focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none"
                            placeholder="e.g. round-1"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-dried-grass">Phase Label *</label>
                          <input
                            type="text"
                            value={phaseForm.phase_label}
                            onChange={(e) => setPhaseForm((f) => ({ ...f, phase_label: e.target.value }))}
                            className="h-10 w-full rounded-2xl border border-timber bg-white/50 px-3 text-sm text-foreground placeholder-dried-grass/50 focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none"
                            placeholder="e.g. Round 1"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-dried-grass">Description</label>
                        <input
                          type="text"
                          value={phaseForm.description}
                          onChange={(e) => setPhaseForm((f) => ({ ...f, description: e.target.value }))}
                          className="h-10 w-full rounded-2xl border border-timber bg-white/50 px-3 text-sm text-foreground placeholder-dried-grass/50 focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none"
                          placeholder="Optional phase description"
                        />
                      </div>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={phaseForm.is_default}
                            onChange={(e) => setPhaseForm((f) => ({ ...f, is_default: e.target.checked }))}
                            className="h-4 w-4 rounded border-timber bg-white/50 text-moss focus:ring-moss/30"
                          />
                          <span className="text-xs text-bark">Default Phase</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-dried-grass">Sort Order</label>
                          <input
                            type="number"
                            value={phaseForm.sort_order}
                            onChange={(e) => setPhaseForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                            className="h-10 w-20 rounded-2xl border border-timber bg-white/50 px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleCreatePhase}
                        disabled={creatingPhase || !phaseForm.phase_key.trim() || !phaseForm.phase_label.trim()}
                        className="rounded-full bg-moss px-6 py-2 text-xs font-semibold text-pale-mist transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {creatingPhase ? "Creating..." : "Add Phase"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
