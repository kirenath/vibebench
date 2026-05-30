"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Brain,
  RefreshCw,
  ExternalLink,
  Maximize2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  MessageSquareText,
  Pencil,
  Trophy,
  Share2,
  PartyPopper,
} from "lucide-react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import HtmlPreviewModal from "@/components/HtmlPreviewModal";
import ShareCardModal from "@/components/guess/ShareCardModal";
import type { GuessDifficulty, GuessOption } from "@/lib/guessToken";
import { DIFFICULTY_LABELS, rankTitle, winRateOf } from "@/lib/guessRank";

type Phase = "start" | "quiz" | "result";
type Count = number | "zen";

interface QuestionData {
  token: string;
  submission_id: string;
  challenge_title: string;
  phase_label: string;
  phase_prompt: string | null;
  difficulty: GuessDifficulty;
  options: GuessOption[];
}

interface Reveal {
  model_variant_name: string;
  model_family_name: string;
  vendor_name: string;
  channel_name: string;
  manual_touched: boolean;
}

interface HistoryItem {
  options: GuessOption[];
  guessed_value: string;
  correct_value: string;
  is_correct: boolean;
  reveal: Reveal;
  difficulty: GuessDifficulty;
}

const DIFFICULTIES: { value: GuessDifficulty; label: string; desc: string }[] = [
  { value: "easy", label: "简单", desc: "猜系列：GPT / Gemini / Claude" },
  { value: "medium", label: "中等", desc: "跨系列猜版本" },
  { value: "hard", label: "困难", desc: "同系列内猜版本" },
];

const COUNT_PRESETS = [5, 10, 20, 50];

export default function GuessPage() {
  const [fingerprint, setFingerprint] = useState("");
  const [nickname, setNickname] = useState<string>("");

  const [phase, setPhase] = useState<Phase>("start");
  const [difficulty, setDifficulty] = useState<GuessDifficulty>("medium");
  const [count, setCount] = useState<Count>(10);
  const [customCount, setCustomCount] = useState("");

  const [sessionId, setSessionId] = useState("");
  const [questionNumber, setQuestionNumber] = useState(0);
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [correctValue, setCorrectValue] = useState<string | null>(null);
  const [answering, setAnswering] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const [promptOpen, setPromptOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [authorRate, setAuthorRate] = useState<number | undefined>(undefined);
  const [shareOpen, setShareOpen] = useState(false);

  // Nickname editing
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameError, setNameError] = useState("");
  const [nameSaving, setNameSaving] = useState(false);

  useEffect(() => {
    FingerprintJS.load()
      .then((fp) => fp.get())
      .then((r) => setFingerprint(r.visitorId));
  }, []);

  useEffect(() => {
    if (!fingerprint) return;
    fetch("/api/guess/profile", {
      headers: { "X-Player-Token": fingerprint },
    })
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setNickname(j.data.display_name || "");
      })
      .catch(() => {});
  }, [fingerprint]);

  const fetchQuestion = useCallback(
    async (excludeList: string[]) => {
      if (!fingerprint) return;
      setLoading(true);
      setError("");
      setSelectedValue(null);
      setReveal(null);
      setCorrectValue(null);
      try {
        const params = new URLSearchParams({
          difficulty,
          session: sessionId,
        });
        if (excludeList.length) params.set("exclude", excludeList.join(","));
        const res = await fetch(`/api/guess/question?${params.toString()}`, {
          headers: { "X-Player-Token": fingerprint },
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "获取题目失败");
        }
        if (json.completed || !json.data) {
          // No more questions — finish the session.
          setPhase("result");
          return;
        }
        setQuestion(json.data);
        setStartTime(Date.now());
        setIframeKey((k) => k + 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "未知错误");
      } finally {
        setLoading(false);
      }
    },
    [fingerprint, difficulty, sessionId]
  );

  const startGame = () => {
    const sid =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    setSessionId(sid);
    setQuestionNumber(1);
    setExcluded([]);
    setHistory([]);
    setQuestion(null);
    setAuthorRate(undefined);
    setPhase("quiz");
  };

  // Fetch a question whenever we (re)enter quiz with a new question number.
  useEffect(() => {
    if (phase !== "quiz" || !sessionId) return;
    fetchQuestion(excluded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, sessionId, questionNumber]);

  const handleAnswer = async (value: string) => {
    if (!question || selectedValue || answering) return;
    setSelectedValue(value);
    setAnswering(true);
    try {
      const res = await fetch("/api/guess/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Player-Token": fingerprint,
        },
        body: JSON.stringify({
          token: question.token,
          session_id: sessionId,
          guessed_value: value,
          duration_ms: Date.now() - startTime,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "提交失败");
      }
      setReveal(json.data.reveal);
      setCorrectValue(json.data.correct_value);
      setHistory((h) => [
        ...h,
        {
          options: question.options,
          guessed_value: value,
          correct_value: json.data.correct_value,
          is_correct: json.data.is_correct,
          reveal: json.data.reveal,
          difficulty: question.difficulty,
        },
      ]);
      setExcluded((e) => [...e, question.submission_id]);
    } catch (err) {
      setSelectedValue(null);
      alert(err instanceof Error ? err.message : "提交失败");
    } finally {
      setAnswering(false);
    }
  };

  const goToResult = useCallback(async () => {
    setPhase("result");
  }, []);

  const handleNext = () => {
    if (typeof count === "number" && questionNumber >= count) {
      goToResult();
      return;
    }
    setQuestion(null);
    setQuestionNumber((n) => n + 1);
  };

  // On entering result, fetch author baseline for the difficulty.
  useEffect(() => {
    if (phase !== "result") return;
    fetch("/api/guess/stats")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          const a = j.data.author?.[difficulty];
          setAuthorRate(a?.win_rate ?? undefined);
        }
      })
      .catch(() => {});
  }, [phase, difficulty]);

  const saveNickname = async () => {
    const name = nameInput.trim();
    if (name.length < 1 || name.length > 40) {
      setNameError("昵称长度需在 1–40 之间");
      return;
    }
    setNameSaving(true);
    setNameError("");
    try {
      const res = await fetch("/api/guess/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Player-Token": fingerprint,
        },
        body: JSON.stringify({ display_name: name }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "保存失败");
      }
      setNickname(name);
      setEditingName(false);
    } catch (err) {
      setNameError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setNameSaving(false);
    }
  };

  // ---- Derived result values ----
  const total = history.length;
  const correct = history.filter((h) => h.is_correct).length;
  const winRate = winRateOf(correct, total);
  const rank = rankTitle(winRate, difficulty);

  const showEndButton =
    phase === "quiz" && (count === "zen" || (typeof count === "number" && count > 10));
  const countLabel = count === "zen" ? "∞" : count;

  const labelOf = (value: string, options: GuessOption[]) =>
    options.find((o) => o.value === value)?.label ?? value;

  return (
    <div className="relative section pt-24 pb-24">
      <div
        className="absolute inset-0 -top-24 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 30%, var(--hero-primary-soft) 0%, transparent 70%)",
        }}
      />
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" />
            猜模型挑战
          </h1>
          <Link
            href="/guess/leaderboard"
            className="btn-ghost btn-sm inline-flex items-center gap-1"
          >
            <Trophy className="h-4 w-4" /> 排行榜
          </Link>
        </div>

        {/* ================= START ================= */}
        {phase === "start" && (
          <div className="card border border-border/50 p-6 sm:p-8 max-w-2xl mx-auto">
            <p className="text-muted-foreground mb-6">
              看一个作品，猜它出自哪个模型。答完得出你的胜率，并和作者对比。
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">难度</label>
              <div className="grid sm:grid-cols-3 gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    className={`text-left p-3 rounded-xl border transition-colors ${
                      difficulty === d.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-muted/30"
                    }`}
                  >
                    <div className="font-semibold">{d.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {d.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">题目数量</label>
              <div className="flex flex-wrap gap-2">
                {COUNT_PRESETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCount(c);
                      setCustomCount("");
                    }}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      count === c
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/40 hover:bg-muted/60"
                    }`}
                  >
                    {c} 题
                  </button>
                ))}
                <button
                  onClick={() => setCount("zen")}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    count === "zen"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/40 hover:bg-muted/60"
                  }`}
                >
                  ∞ Zen
                </button>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={customCount}
                  placeholder="自定义 5–100"
                  onChange={(e) => {
                    setCustomCount(e.target.value);
                    const n = parseInt(e.target.value, 10);
                    if (!isNaN(n)) setCount(Math.min(100, Math.max(5, n)));
                  }}
                  className="w-32 px-3 py-2 rounded-full bg-muted/40 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium mb-2">昵称</label>
              <div className="flex items-center gap-2">
                <span className="px-3 py-2 rounded-lg bg-muted/40 text-sm flex-1 truncate">
                  {nickname || "生成中…"}
                </span>
                <button
                  onClick={() => {
                    setNameInput(nickname);
                    setNameError("");
                    setEditingName(true);
                  }}
                  className="btn-secondary btn-sm inline-flex items-center gap-1"
                  disabled={!nickname}
                >
                  <Pencil className="h-3.5 w-3.5" /> 改名
                </button>
              </div>
            </div>

            <button
              onClick={startGame}
              disabled={!fingerprint}
              className="btn-primary w-full py-3 text-lg !rounded-full"
            >
              开始挑战
            </button>
          </div>
        )}

        {/* ================= QUIZ ================= */}
        {phase === "quiz" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                第 <span className="font-bold text-foreground">{questionNumber}</span>
                {count !== "zen" && ` / ${countLabel}`} 题
                {count === "zen" && "（Zen）"}
                <span className="ml-3">
                  当前 {correct}/{total} 正确
                </span>
              </div>
              {showEndButton && (
                <button
                  onClick={goToResult}
                  className="btn-secondary btn-sm"
                  disabled={total === 0}
                >
                  结束并结算
                </button>
              )}
            </div>

            {loading ? (
              <div className="h-[600px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-2xl border border-border/50">
                <RefreshCw className="h-8 w-8 animate-spin mr-3 text-primary" />
                正在出题…
              </div>
            ) : error ? (
              <div className="h-[400px] flex flex-col items-center justify-center text-destructive bg-destructive/10 rounded-2xl border border-destructive/20 p-8 text-center">
                <p className="text-lg font-semibold mb-4">{error}</p>
                <button onClick={() => fetchQuestion(excluded)} className="btn-primary">
                  重试
                </button>
              </div>
            ) : question ? (
              <>
                {question.phase_prompt && (
                  <div className="card border border-border/50 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setPromptOpen((v) => !v)}
                      className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-muted/20 transition-colors"
                    >
                      <MessageSquareText className="h-5 w-5 text-secondary shrink-0" />
                      <span className="font-heading font-semibold text-sm">本题提示词</span>
                      <span className="text-xs text-muted-foreground">
                        {question.challenge_title} · {question.phase_label}
                      </span>
                      <ChevronDown
                        className={`ml-auto h-4 w-4 text-muted-foreground transition-transform duration-300 ${
                          promptOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {promptOpen && (
                      <div className="border-t border-border/50 px-4 py-4 max-h-[280px] overflow-y-auto">
                        <MarkdownRenderer
                          content={question.phase_prompt}
                          className="[&_code]:text-sm [&_pre]:text-sm [&_pre]:whitespace-pre-wrap [&_pre]:break-words"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="card overflow-hidden border-2">
                  <div className="p-3 border-b border-border/50 bg-muted/20 flex justify-between items-center h-14">
                    <span className="font-heading font-bold text-lg">这是哪个模型的作品？</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setIframeKey((k) => k + 1)}
                        className="p-1 rounded-md hover:bg-primary/10 transition-colors"
                        title="刷新"
                      >
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() =>
                          setPreviewUrl(
                            `/api/submissions/${question.submission_id}/artifacts/html`
                          )
                        }
                        className="p-1 rounded-md hover:bg-primary/10 transition-colors"
                        title="放大预览"
                      >
                        <Maximize2 className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <a
                        href={`/api/submissions/${question.submission_id}/artifacts/html`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded-md hover:bg-primary/10 transition-colors"
                        title="新窗口打开"
                      >
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </a>
                    </div>
                  </div>
                  <iframe
                    key={iframeKey}
                    src={`/api/submissions/${question.submission_id}/artifacts/html`}
                    sandbox="allow-scripts allow-same-origin allow-modals allow-downloads allow-forms"
                    allow="clipboard-read; clipboard-write"
                    className="w-full h-[560px] border-0 bg-white"
                  />
                </div>

                {/* Options */}
                <div className="grid sm:grid-cols-2 gap-3">
                  {question.options.map((opt) => {
                    const isSelected = selectedValue === opt.value;
                    const isCorrectOpt = correctValue === opt.value;
                    let cls =
                      "border-border hover:border-primary hover:bg-primary/5";
                    if (reveal) {
                      if (isCorrectOpt)
                        cls = "border-success bg-success/10 text-success";
                      else if (isSelected)
                        cls = "border-destructive bg-destructive/10 text-destructive";
                      else cls = "border-border opacity-60";
                    }
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleAnswer(opt.value)}
                        disabled={!!selectedValue}
                        className={`p-4 rounded-xl border-2 text-left font-medium transition-colors flex items-center justify-between ${cls}`}
                      >
                        <span>{opt.label}</span>
                        {reveal && isCorrectOpt && (
                          <CheckCircle2 className="h-5 w-5" />
                        )}
                        {reveal && isSelected && !isCorrectOpt && (
                          <XCircle className="h-5 w-5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Reveal + Next */}
                {reveal && (
                  <div className="card border border-border/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-sm">
                      正确答案：
                      <span className="font-bold text-primary">
                        {reveal.model_variant_name}
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        （{reveal.vendor_name} · {reveal.channel_name}）
                      </span>
                      {reveal.manual_touched && (
                        <span
                          title="人工干预"
                          className="inline-flex items-center ml-2 text-destructive"
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleNext}
                      className="btn-primary !rounded-full px-6"
                    >
                      {typeof count === "number" && questionNumber >= count
                        ? "查看结算"
                        : "下一题 →"}
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}

        {/* ================= RESULT ================= */}
        {phase === "result" && (
          <div className="card border border-border/50 p-6 sm:p-8 max-w-2xl mx-auto text-center">
            <PartyPopper className="h-12 w-12 text-primary mx-auto mb-3" />
            <h2 className="font-heading text-2xl font-bold mb-1">本局结束！</h2>
            <div className="text-6xl font-black text-primary my-4">{winRate}%</div>
            <p className="text-muted-foreground mb-2">
              {correct} / {total} 正确 · {DIFFICULTY_LABELS[difficulty]}难度 · {rank.emoji}{" "}
              {rank.title}
            </p>
            {authorRate !== undefined && (
              <p className="text-sm mb-6">
                作者基准：{authorRate}% —{" "}
                {winRate > authorRate ? (
                  <span className="text-success font-semibold">你超过作者 👏</span>
                ) : winRate === authorRate ? (
                  <span className="text-primary font-semibold">与作者持平 🤝</span>
                ) : (
                  <span className="text-muted-foreground">再接再厉！</span>
                )}
              </p>
            )}

            {/* Review */}
            {total > 0 && (
              <div className="text-left bg-muted/20 rounded-xl p-4 mb-6 max-h-60 overflow-y-auto">
                <div className="text-sm font-semibold mb-2">逐题回顾</div>
                <ul className="space-y-1.5 text-sm">
                  {history.map((h, i) => (
                    <li key={i} className="flex items-center gap-2">
                      {h.is_correct ? (
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive shrink-0" />
                      )}
                      <span className="text-muted-foreground">
                        猜 {labelOf(h.guessed_value, h.options)}
                      </span>
                      {!h.is_correct && (
                        <>
                          <span className="text-muted-foreground">·</span>
                          <span>
                            实为 {labelOf(h.correct_value, h.options)}
                          </span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setShareOpen(true)}
                disabled={total === 0}
                className="btn-primary !rounded-full px-5 inline-flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" /> 生成分享卡片
              </button>
              <button
                onClick={() => setPhase("start")}
                className="btn-secondary !rounded-full px-5"
              >
                再来一局
              </button>
              <Link
                href="/guess/leaderboard"
                className="btn-secondary !rounded-full px-5 inline-flex items-center gap-2"
              >
                <Trophy className="h-4 w-4" /> 看排行榜
              </Link>
            </div>
          </div>
        )}

        {previewUrl && (
          <HtmlPreviewModal
            url={previewUrl}
            title="作品预览"
            onClose={() => setPreviewUrl(null)}
          />
        )}

        {shareOpen && (
          <ShareCardModal
            open={shareOpen}
            onClose={() => setShareOpen(false)}
            nickname={nickname || "匿名玩家"}
            difficulty={difficulty}
            correct={correct}
            total={total}
            authorRate={authorRate}
            sessionId={sessionId}
            playerToken={fingerprint}
          />
        )}

        {/* Nickname edit modal */}
        {editingName && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm p-6">
              <h3 className="font-heading text-lg font-bold mb-4">设置昵称</h3>
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={40}
                className="w-full px-3 py-2 rounded-lg bg-muted/40 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 mb-2"
                placeholder="输入昵称（1–40 字）"
              />
              {nameError && (
                <p className="text-destructive text-sm mb-2">{nameError}</p>
              )}
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => setEditingName(false)}
                  className="btn-secondary btn-sm"
                >
                  取消
                </button>
                <button
                  onClick={saveNickname}
                  disabled={nameSaving}
                  className="btn-primary btn-sm"
                >
                  {nameSaving ? "保存中…" : "保存"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
