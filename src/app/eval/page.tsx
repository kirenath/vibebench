"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, RefreshCw, AlertTriangle, Sparkles, Maximize2, ExternalLink, Equal, SkipForward, PartyPopper, Code2 } from "lucide-react";
import Link from "next/link";
import CustomSelect from "@/components/CustomSelect";
import HtmlPreviewModal from "@/components/HtmlPreviewModal";
import SourceCodePreviewModal from "@/components/SourceCodePreviewModal";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

interface EvalData {
  challenge_phase_id: string;
  challenge_title: string;
  phase_label: string;
  left: { submission_id: string };
  right: { submission_id: string };
}

interface RevealData {
  submission_id: string;
  model_variant_name: string;
  vendor_name: string;
  channel_name: string;
  manual_touched: boolean;
}

interface Challenges {
  id: string;
  title: string;
}

interface Phase {
  id: string;
  phase_key: string;
  phase_label: string;
}

export default function EvalPage() {
  const [challenges, setChallenges] = useState<Challenges[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState("");
  const [selectedPhase, setSelectedPhase] = useState("");
  
  const [data, setData] = useState<EvalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);
  const [voted, setVoted] = useState(false);
  const [revealLeft, setRevealLeft] = useState<RevealData | null>(null);
  const [revealRight, setRevealRight] = useState<RevealData | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [voteLoading, setVoteLoading] = useState(false);
  const [iframeKeyLeft, setIframeKeyLeft] = useState(0);
  const [iframeKeyRight, setIframeKeyRight] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sourceCodeId, setSourceCodeId] = useState<string | null>(null);
  const [fingerprint, setFingerprint] = useState("");

  // Initialize FingerprintJS on mount
  useEffect(() => {
    FingerprintJS.load().then(fp => fp.get()).then(result => {
      setFingerprint(result.visitorId);
    });
  }, []);

  useEffect(() => {
    fetch("/api/challenges")
      .then((r) => r.json())
      .then((d) => setChallenges(d.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedChallenge) {
      setPhases([]);
      return;
    }
    fetch(`/api/challenges/${selectedChallenge}/phases`)
      .then((r) => r.json())
      .then((d) => {
        setPhases(d.data || []);
      })
      .catch(() => {});
  }, [selectedChallenge]);

  const fetchPair = useCallback(async () => {
    if (!fingerprint) return; // Wait for fingerprint to be ready
    setLoading(true);
    setError("");
    setCompleted(false);
    setVoted(false);
    setRevealLeft(null);
    setRevealRight(null);
    
    try {
      let url = "/api/eval/random";
      const params = new URLSearchParams();
      if (selectedChallenge) params.append("challenge", selectedChallenge);
      if (selectedPhase) params.append("phase", selectedPhase);
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url, {
        headers: { "X-Voter-Token": fingerprint },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to fetch pair");
      }
      if (json.completed) {
        setCompleted(true);
        setData(null);
        return;
      }
      setData(json.data);
      setStartTime(Date.now());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedChallenge, selectedPhase, fingerprint]);

  useEffect(() => {
    fetchPair();
  }, [fetchPair]);

  const handleVote = async (winner: string) => {
    if (!data || voted || voteLoading) return;
    setVoteLoading(true);
    
    try {
      const duration_ms = Date.now() - startTime;
      const res = await fetch("/api/eval/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Voter-Token": fingerprint,
        },
        body: JSON.stringify({
          challenge_phase_id: data.challenge_phase_id,
          left_submission_id: data.left.submission_id,
          right_submission_id: data.right.submission_id,
          winner,
          duration_ms
        })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Vote failed");
      }
      
      setRevealLeft(json.data.left);
      setRevealRight(json.data.right);
      setVoted(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setVoteLoading(false);
    }
  };

  const handleSkip = async () => {
    if (voteLoading) return;
    setVoteLoading(true);
    try {
      await fetch("/api/eval/skip", { method: "POST" });
      await fetchPair();
    } catch (err) {
      console.error(err);
    } finally {
      setVoteLoading(false);
    }
  };

  const handleNext = () => {
    fetchPair();
  };

  return (
    <div className="relative section pt-24 pb-24">
      {/* Background wash that extends behind navbar to eliminate the dividing line */}
      <div
        className="absolute inset-0 -top-24 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 30%, rgba(93,112,82,0.08) 0%, transparent 70%)",
        }}
      />
      <div className="max-w-7xl mx-auto px-4">
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          返回选择模式
        </Link>

        {/* Header / Mode Selectors */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 bg-card border border-border/50 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="font-heading text-3xl font-bold flex items-center gap-2 mb-2">
              <Sparkles className="h-6 w-6 text-primary" />
              盲评挑战
            </h1>
            <p className="text-muted-foreground text-sm">
              {data ? `当前赛题：${data.challenge_title} (${data.phase_label})` : "正在获取赛题..."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="w-full sm:w-48">
              <label className="text-xs text-muted-foreground mb-1 block">指定赛题（可选）</label>
              <CustomSelect
                options={[{value: "", label: "随机赛题"}, ...challenges.map(c => ({value: c.id, label: c.title}))]}
                value={selectedChallenge}
                onChange={(v) => { setSelectedChallenge(v); setSelectedPhase(""); }}
                placeholder="随机赛题"
              />
            </div>
            {selectedChallenge && phases.length > 0 && (
              <div className="w-full sm:w-48">
                <label className="text-xs text-muted-foreground mb-1 block">Phase</label>
                <CustomSelect
                  options={[{value: "", label: "所有 Phase"}, ...phases.map(p => ({value: p.phase_key, label: p.phase_label}))]}
                  value={selectedPhase}
                  onChange={setSelectedPhase}
                  placeholder="所有 Phase"
                />
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="h-[600px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-2xl border border-border/50">
            <RefreshCw className="h-8 w-8 animate-spin mr-3 text-primary" /> 正在准备比赛...
          </div>
        ) : completed ? (
          <div className="h-[400px] flex flex-col items-center justify-center bg-primary/5 rounded-2xl border border-primary/20 p-8 text-center">
            <PartyPopper className="h-12 w-12 text-primary mb-4" />
            <h2 className="font-heading text-2xl font-bold mb-2">全部投票完成！</h2>
            <p className="text-muted-foreground mb-6">感谢你的参与，你已经对所有可用赛题完成了评审。</p>
            <Link href="/compare" className="btn-primary">返回选择模式</Link>
          </div>
        ) : error ? (
          <div className="h-[400px] flex flex-col items-center justify-center text-destructive bg-destructive/10 rounded-2xl border border-destructive/20 p-8 text-center">
            <p className="text-lg font-semibold mb-4">{error}</p>
            <button onClick={fetchPair} className="btn-primary">重试</button>
          </div>
        ) : data ? (
          <div className="flex flex-col gap-6">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Left Side */}
              <div className="card overflow-hidden border-2 transition-colors duration-300 relative group">
                <div className="p-3 border-b border-border/50 bg-muted/20 flex justify-between items-center h-14">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-lg">作品 A</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setIframeKeyLeft(k => k + 1)} className="p-1 rounded-md hover:bg-primary/10 transition-colors" title="刷新">
                        <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                      <button onClick={() => setPreviewUrl(`/api/submissions/${data.left.submission_id}/artifacts/html`)} className="p-1 rounded-md hover:bg-primary/10 transition-colors" title="预览">
                        <Maximize2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                      <button onClick={() => setSourceCodeId(data.left.submission_id)} className="p-1 rounded-md hover:bg-primary/10 transition-colors" title="查看源码">
                        <Code2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                      <a href={`/api/submissions/${data.left.submission_id}/artifacts/html`} target="_blank" rel="noopener noreferrer" className="p-1 rounded-md hover:bg-primary/10 transition-colors" title="新窗口打开">
                        <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </a>
                    </div>
                  </div>
                  {revealLeft && (
                    <div className="text-right flex items-center gap-2">
                      {revealLeft.manual_touched && <span title="人工干预" className="flex items-center"><AlertTriangle className="h-4 w-4 text-destructive" /></span>}
                      <div className="text-sm">
                        <span className="font-bold text-primary">{revealLeft.model_variant_name}</span>
                        <span className="text-xs text-muted-foreground block">{revealLeft.vendor_name} · {revealLeft.channel_name}</span>
                      </div>
                    </div>
                  )}
                </div>
                <iframe
                  key={iframeKeyLeft}
                  src={`/api/submissions/${data.left.submission_id}/artifacts/html`}
                  sandbox="allow-scripts allow-same-origin allow-modals"
                  className="w-full h-[600px] border-0 bg-white"
                />
              </div>

              {/* Right Side */}
              <div className="card overflow-hidden border-2 transition-colors duration-300 relative group">
                <div className="p-3 border-b border-border/50 bg-muted/20 flex justify-between items-center h-14">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-lg">作品 B</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setIframeKeyRight(k => k + 1)} className="p-1 rounded-md hover:bg-primary/10 transition-colors" title="刷新">
                        <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                      <button onClick={() => setPreviewUrl(`/api/submissions/${data.right.submission_id}/artifacts/html`)} className="p-1 rounded-md hover:bg-primary/10 transition-colors" title="预览">
                        <Maximize2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                      <button onClick={() => setSourceCodeId(data.right.submission_id)} className="p-1 rounded-md hover:bg-primary/10 transition-colors" title="查看源码">
                        <Code2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                      <a href={`/api/submissions/${data.right.submission_id}/artifacts/html`} target="_blank" rel="noopener noreferrer" className="p-1 rounded-md hover:bg-primary/10 transition-colors" title="新窗口打开">
                        <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </a>
                    </div>
                  </div>
                  {revealRight && (
                    <div className="text-right flex items-center gap-2">
                      {revealRight.manual_touched && <span title="人工干预" className="flex items-center"><AlertTriangle className="h-4 w-4 text-destructive" /></span>}
                      <div className="text-sm">
                        <span className="font-bold text-primary">{revealRight.model_variant_name}</span>
                        <span className="text-xs text-muted-foreground block">{revealRight.vendor_name} · {revealRight.channel_name}</span>
                      </div>
                    </div>
                  )}
                </div>
                <iframe
                  key={iframeKeyRight}
                  src={`/api/submissions/${data.right.submission_id}/artifacts/html`}
                  sandbox="allow-scripts allow-same-origin allow-modals"
                  className="w-full h-[600px] border-0 bg-white"
                />
              </div>
            </div>

            {/* Voting Controls */}
            <div className="sticky bottom-6 z-40 max-w-3xl mx-auto w-full">
              <div className="bg-card/90 backdrop-blur-md border border-border shadow-xl rounded-full p-2 flex flex-wrap sm:flex-nowrap justify-center gap-2 items-center">
                {!voted ? (
                  <>
                    <button onClick={() => handleVote('left')} disabled={voteLoading} className="btn-primary flex-1 py-3 text-sm sm:text-base md:text-lg !rounded-full hover:scale-105 transition-transform min-w-[100px]">
                      👈 A 更好
                    </button>
                    <button onClick={() => handleVote('both_good')} disabled={voteLoading} className="btn-secondary !rounded-full px-3 sm:px-6 hover:bg-success/20 hover:text-success transition-colors text-sm sm:text-base">
                      都好
                    </button>
                    <button onClick={handleSkip} disabled={voteLoading} className="btn-secondary !rounded-full px-3 sm:px-6 border border-border hover:text-foreground transition-colors text-sm sm:text-base">
                      跳过
                    </button>
                    <button onClick={() => handleVote('both_bad')} disabled={voteLoading} className="btn-secondary !rounded-full px-3 sm:px-6 hover:bg-destructive/20 hover:text-destructive transition-colors text-sm sm:text-base">
                      都差
                    </button>
                    <button onClick={() => handleVote('right')} disabled={voteLoading} className="btn-primary flex-1 py-3 text-sm sm:text-base md:text-lg !rounded-full hover:scale-105 transition-transform min-w-[100px]">
                      B 更好 👉
                    </button>
                  </>
                ) : (
                  <button onClick={handleNext} className="btn-primary w-full max-w-md py-3 text-lg !rounded-full animate-in fade-in zoom-in duration-300">
                    下一轮比赛 ✨
                  </button>
                )}
              </div>
            </div>

            {/* Preview Modal */}
            {previewUrl && (
              <HtmlPreviewModal
                url={previewUrl}
                title="作品预览"
                onClose={() => setPreviewUrl(null)}
              />
            )}

            {/* Source Code Modal */}
            {sourceCodeId && (
              <SourceCodePreviewModal
                submissionId={sourceCodeId}
                title="作品源码"
                onClose={() => setSourceCodeId(null)}
              />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
