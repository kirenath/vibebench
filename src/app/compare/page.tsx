"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CompareGrid from "@/components/CompareGrid";
import type { SubmissionOverview, Challenge, ChallengePhase } from "@/types";

export default function ComparePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [phases, setPhases] = useState<ChallengePhase[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionOverview[]>([]);
  const [selected, setSelected] = useState<SubmissionOverview[]>([]);

  const challengeId = searchParams.get("challenge") || "";
  const phaseKey = searchParams.get("phase") || "";
  const entries = searchParams.get("entries")?.split(",").filter(Boolean) || [];

  useEffect(() => {
    fetch("/api/challenges")
      .then((r) => r.json())
      .then((d) => setChallenges(d.data || []));
  }, []);

  useEffect(() => {
    if (!challengeId) return;
    fetch(`/api/challenges/${challengeId}/phases`)
      .then((r) => r.json())
      .then((d) => setPhases(d.data || []));
    fetch(`/api/submissions?challenge=${challengeId}`)
      .then((r) => r.json())
      .then((d) => setSubmissions(d.data || []));
  }, [challengeId]);

  useEffect(() => {
    if (entries.length === 0 || submissions.length === 0) {
      setSelected([]);
      return;
    }
    const filtered = submissions.filter(
      (s) =>
        s.phase_key === phaseKey &&
        s.has_html &&
        entries.includes(`${s.model_variant_id}@${s.channel_id}`)
    );
    setSelected(filtered);
  }, [submissions, phaseKey, searchParams]);

  const filteredByPhase = submissions.filter((s) => s.phase_key === phaseKey && s.has_html);

  function updateUrl(params: Record<string, string>) {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(params)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    router.push(`/compare?${sp.toString()}`);
  }

  function toggleEntry(variantId: string, channelId: string) {
    const key = `${variantId}@${channelId}`;
    let current = entries.slice();
    if (current.includes(key)) {
      current = current.filter((e) => e !== key);
    } else if (current.length < 4) {
      current.push(key);
    }
    updateUrl({ entries: current.join(",") });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Compare</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Challenge</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={challengeId}
            onChange={(e) => updateUrl({ challenge: e.target.value, phase: "", entries: "" })}
          >
            <option value="">Select challenge...</option>
            {challenges.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phase</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={phaseKey}
            onChange={(e) => updateUrl({ phase: e.target.value, entries: "" })}
          >
            <option value="">Select phase...</option>
            {phases.map((p) => (
              <option key={p.phase_key} value={p.phase_key}>{p.phase_label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Entries ({entries.length}/4)
          </label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {filteredByPhase.map((s) => {
              const key = `${s.model_variant_id}@${s.channel_id}`;
              const isSelected = entries.includes(key);
              return (
                <button
                  key={s.submission_id}
                  onClick={() => toggleEntry(s.model_variant_id, s.channel_id)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    isSelected
                      ? "bg-brand-500 text-white border-brand-500"
                      : "bg-white text-gray-600 border-gray-300 hover:border-brand-300"
                  }`}
                >
                  {s.model_variant_name} ({s.channel_name})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selected.length >= 2 ? (
        <div className="min-h-[600px]">
          <CompareGrid submissions={selected} />
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          {entries.length < 2
            ? "Select at least 2 entries to start comparing."
            : "Loading comparison..."}
        </div>
      )}
    </div>
  );
}
