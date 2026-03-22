"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Columns2 } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";
import Link from "next/link";

interface Challenge {
  id: string;
  title: string;
}

interface Phase {
  id: string;
  phase_key: string;
  phase_label: string;
}

interface Entry {
  submission_id: string;
  model_variant_id: string;
  model_variant_name: string;
  vendor_name: string;
  channel_id: string;
  channel_name: string;
  manual_touched: boolean;
  has_html: boolean;
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="section pt-12 text-center text-muted-foreground">加载中...</div>}>
      <CompareContent />
    </Suspense>
  );
}

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState(
    searchParams.get("challenge") || ""
  );
  const [selectedPhase, setSelectedPhase] = useState(
    searchParams.get("phase") || ""
  );
  const [selectedEntries, setSelectedEntries] = useState<string[]>(
    searchParams.get("entries")?.split(",").filter(Boolean) || []
  );

  useEffect(() => {
    fetch("/api/challenges")
      .then((r) => r.json())
      .then((d) => setChallenges(d.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedChallenge) return;
    fetch(`/api/challenges/${selectedChallenge}/phases`)
      .then((r) => r.json())
      .then((d) => {
        setPhases(d.data || []);
        if (!selectedPhase && d.data?.length) {
          const def = d.data.find((p: Phase) => p.phase_key) || d.data[0];
          setSelectedPhase(def.phase_key);
        }
      })
      .catch(() => {});
  }, [selectedChallenge, selectedPhase]);

  const loadEntries = useCallback(() => {
    if (!selectedChallenge || !selectedPhase) return;
    const phase = phases.find((p) => p.phase_key === selectedPhase);
    if (!phase) return;
    fetch(
      `/api/submissions?challenge_phase_id=${phase.id}&is_published=true`
    )
      .then((r) => r.json())
      .then((d) => setEntries(d.data || []))
      .catch(() => {});
  }, [selectedChallenge, selectedPhase, phases]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedChallenge) params.set("challenge", selectedChallenge);
    if (selectedPhase) params.set("phase", selectedPhase);
    if (selectedEntries.length)
      params.set("entries", selectedEntries.join(","));
    router.replace(`/compare/manual?${params.toString()}`, { scroll: false });
  }, [selectedChallenge, selectedPhase, selectedEntries, router]);

  const toggleEntry = (entryKey: string) => {
    setSelectedEntries((prev) => {
      if (prev.includes(entryKey)) return prev.filter((e) => e !== entryKey);
      if (prev.length >= 2) return [...prev.slice(1), entryKey];
      return [...prev, entryKey];
    });
  };

  const comparedSubmissions = entries.filter((e) =>
    selectedEntries.includes(`${e.model_variant_id}@${e.channel_id}`)
  );

  return (
    <div className="section pt-12">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          返回对比
        </Link>

        <div className="mb-12">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4 flex items-center gap-3">
            <Columns2 className="h-10 w-10 text-primary" />
            展示对比
          </h1>
          <p className="text-muted-foreground text-lg">
            选择一个赛题，挑选 2 个作品进行 1v1 并排对比
          </p>
        </div>

        {/* Selectors */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="label mb-2 block">赛题</label>
            <CustomSelect
              options={challenges.map((c) => ({ value: c.id, label: c.title }))}
              value={selectedChallenge}
              onChange={(v) => {
                setSelectedChallenge(v);
                setSelectedPhase("");
                setSelectedEntries([]);
              }}
              placeholder="选择赛题..."
            />
          </div>
          <div>
            <label className="label mb-2 block">Phase</label>
            <CustomSelect
              options={phases.map((p) => ({ value: p.phase_key, label: p.phase_label }))}
              value={selectedPhase}
              onChange={(v) => {
                setSelectedPhase(v);
                setSelectedEntries([]);
              }}
              placeholder="选择 Phase..."
            />
          </div>
          <div>
            <label className="label mb-2 block">
              参赛项（点击选择，最多 2 个）
            </label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {entries
                .filter((e) => e.has_html)
                .map((e) => {
                  const key = `${e.model_variant_id}@${e.channel_id}`;
                  const isSelected = selectedEntries.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleEntry(key)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300 ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-soft"
                          : "bg-muted text-muted-foreground hover:bg-primary/10"
                      }`}
                    >
                      {e.model_variant_name} · {e.channel_name}
                      {e.manual_touched && " ⚠️"}
                    </button>
                  );
                })}
              {entries.filter((e) => e.has_html).length === 0 &&
                selectedChallenge &&
                selectedPhase && (
                  <span className="text-sm text-muted-foreground">
                    暂无可对比作品
                  </span>
                )}
            </div>
          </div>
        </div>

        {/* Compare view */}
        {comparedSubmissions.length === 2 && (
          <div className="grid md:grid-cols-2 gap-4">
            {comparedSubmissions.map((s) => (
              <div key={s.submission_id} className="card overflow-hidden">
                <div className="p-4 border-b border-border/50 flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-bold">
                      {s.model_variant_name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {s.vendor_name} · {s.channel_name}
                    </p>
                  </div>
                  {s.manual_touched && (
                    <span className="badge-destructive flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      人工修订
                    </span>
                  )}
                </div>
                <iframe
                  src={`/s/${s.submission_id}/index.html`}
                  sandbox="allow-scripts"
                  className="w-full h-[600px] border-0"
                  title={s.model_variant_name}
                />
              </div>
            ))}
          </div>
        )}

        {comparedSubmissions.length === 1 && (
          <div className="card p-12 text-center">
            <p className="text-muted-foreground">请再选择 1 个作品进行对比</p>
          </div>
        )}

        {comparedSubmissions.length === 0 && selectedChallenge && (
          <div className="card p-12 text-center">
            <p className="text-muted-foreground">
              请选择 2 个作品开始对比
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
