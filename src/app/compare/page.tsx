"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface Challenge { id: string; title: string; }
interface Phase { id: string; phase_key: string; phase_label: string; is_default: boolean; }
interface Submission {
  submission_id: string;
  model_variant_id: string;
  model_variant_name: string;
  channel_id: string;
  channel_name: string;
  vendor_name: string;
  manual_touched: boolean;
  has_html: boolean;
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="skeleton w-16 h-16 rounded-full"></div></div>}>
      <CompareContent />
    </Suspense>
  );
}

function CompareContent() {
  const searchParams = useSearchParams();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const [challengeId, setChallengeId] = useState(searchParams.get("challenge") || "");
  const [phaseKey, setPhaseKey] = useState(searchParams.get("phase") || "");
  const [leftId, setLeftId] = useState(searchParams.get("left") || "");
  const [rightId, setRightId] = useState(searchParams.get("right") || "");
  const [mobileTab, setMobileTab] = useState<"left" | "right">("left");

  useEffect(() => {
    fetch("/api/challenges").then(r => r.json()).then(setChallenges).catch(() => {});
  }, []);

  useEffect(() => {
    if (!challengeId) { setPhases([]); return; }
    fetch(`/api/challenges/${challengeId}/phases`).then(r => r.json()).then((p: Phase[]) => {
      setPhases(p);
      if (!phaseKey && p.length > 0) {
        const def = p.find(ph => ph.is_default) || p[0];
        setPhaseKey(def.phase_key);
      }
    }).catch(() => {});
  }, [challengeId, phaseKey]);

  const activePhase = phases.find(p => p.phase_key === phaseKey);

  useEffect(() => {
    if (!challengeId || !activePhase) { setSubmissions([]); return; }
    const url = new URL("/api/submissions", window.location.origin);
    url.searchParams.set("challenge", challengeId);
    url.searchParams.set("phase", activePhase.id);
    fetch(url.toString()).then(r => r.json()).then(setSubmissions).catch(() => {});
  }, [challengeId, activePhase]);

  const findSubmission = useCallback((key: string) => {
    // key format: "model_variant_id@channel_id"
    if (!key) return null;
    const [mvId, chId] = key.split("@");
    return submissions.find(s => s.model_variant_id === mvId && s.channel_id === chId) || null;
  }, [submissions]);

  const leftSub = findSubmission(leftId);
  const rightSub = findSubmission(rightId);

  const htmlSubmissions = submissions.filter(s => s.has_html);

  const renderIframe = (sub: Submission | null, side: string) => {
    if (!sub) {
      return (
        <div className="flex items-center justify-center h-full bg-cream-dark/30">
          <div className="text-center">
            <div className="text-4xl mb-3">👈</div>
            <p className="text-muted text-sm">请从上方选择{side === "left" ? "左侧" : "右侧"}作品</p>
          </div>
        </div>
      );
    }
    return (
      <div className="h-full flex flex-col">
        <div className="bg-parchment px-4 py-2 border-b border-sand-light flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-heading font-semibold text-sm text-bark-dark">{sub.model_variant_name}</span>
            <span className="text-xs text-stone">{sub.channel_name}</span>
            {sub.manual_touched && <span className="badge badge-warning text-xs">⚠ 修订</span>}
          </div>
          <Link href={`/submissions/${sub.submission_id}`} className="text-xs text-leaf-dark hover:text-leaf transition-colors">
            详情 →
          </Link>
        </div>
        <iframe
          src={`/s/${sub.submission_id}/index.html`}
          className="flex-1 w-full border-0"
          sandbox="allow-scripts"
          title={`${sub.model_variant_name} preview`}
        />
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col animate-fade-in">
      {/* Selector Bar */}
      <div className="bg-white border-b border-sand-light px-4 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">
          <select
            value={challengeId}
            onChange={(e) => { setChallengeId(e.target.value); setPhaseKey(""); setLeftId(""); setRightId(""); }}
            className="input-field max-w-[200px] text-sm"
          >
            <option value="">选择赛题</option>
            {challenges.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>

          {phases.length > 0 && (
            <select
              value={phaseKey}
              onChange={(e) => { setPhaseKey(e.target.value); setLeftId(""); setRightId(""); }}
              className="input-field max-w-[140px] text-sm"
            >
              {phases.map(p => <option key={p.id} value={p.phase_key}>{p.phase_label}</option>)}
            </select>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <select
              value={leftId}
              onChange={(e) => setLeftId(e.target.value)}
              className="input-field max-w-[220px] text-sm"
            >
              <option value="">左侧 — 选择模型</option>
              {htmlSubmissions.map(s => (
                <option key={s.submission_id} value={`${s.model_variant_id}@${s.channel_id}`} disabled={`${s.model_variant_id}@${s.channel_id}` === rightId}>
                  {s.model_variant_name} ({s.channel_name}){s.manual_touched ? " ⚠" : ""}
                </option>
              ))}
            </select>
            <span className="text-lg font-heading font-bold text-leaf">VS</span>
            <select
              value={rightId}
              onChange={(e) => setRightId(e.target.value)}
              className="input-field max-w-[220px] text-sm"
            >
              <option value="">右侧 — 选择模型</option>
              {htmlSubmissions.map(s => (
                <option key={s.submission_id} value={`${s.model_variant_id}@${s.channel_id}`} disabled={`${s.model_variant_id}@${s.channel_id}` === leftId}>
                  {s.model_variant_name} ({s.channel_name}){s.manual_touched ? " ⚠" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Tab Toggle */}
      <div className="lg:hidden flex border-b border-sand-light bg-cream-dark shrink-0">
        {(["left", "right"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              mobileTab === tab ? "bg-white text-bark-dark border-b-2 border-leaf" : "text-muted hover:text-bark"
            }`}
          >
            {tab === "left" ? (leftSub?.model_variant_name || "左侧") : (rightSub?.model_variant_name || "右侧")}
          </button>
        ))}
      </div>

      {/* Iframes */}
      <div className="flex-1 flex min-h-0">
        {/* Desktop: side by side */}
        <div className="hidden lg:flex flex-1">
          <div className="flex-1 border-r border-sand-light">{renderIframe(leftSub, "left")}</div>
          <div className="flex-1">{renderIframe(rightSub, "right")}</div>
        </div>
        {/* Mobile: tabbed */}
        <div className="lg:hidden flex-1">
          {mobileTab === "left" ? renderIframe(leftSub, "left") : renderIframe(rightSub, "right")}
        </div>
      </div>
    </div>
  );
}
