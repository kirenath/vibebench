"use client";

import { useRef, useState, useCallback } from "react";
import { toPng } from "html-to-image";
import { X, Download, Copy, Link2, Share2, Check } from "lucide-react";
import ShareCard from "./ShareCard";
import type { ShareTemplate, ShareHighlight } from "@/lib/guessRank";
import type { GuessDifficulty } from "@/lib/guessToken";

interface ShareCardModalProps {
  open: boolean;
  onClose: () => void;
  nickname: string;
  difficulty: GuessDifficulty;
  correct: number;
  total: number;
  authorRate?: number;
  highlight?: ShareHighlight;
  sessionId: string;
  playerToken: string;
}

const TEMPLATES: { value: ShareTemplate; label: string }[] = [
  { value: "scoreboard", label: "成绩单" },
  { value: "rank", label: "段位称号" },
  { value: "vs_author", label: "挑战作者" },
  { value: "highlight", label: "高光时刻" },
];

export default function ShareCardModal({
  open,
  onClose,
  nickname,
  difficulty,
  correct,
  total,
  authorRate,
  highlight,
  sessionId,
  playerToken,
}: ShareCardModalProps) {
  const [template, setTemplate] = useState<ShareTemplate>("scoreboard");
  const [copiedImg, setCopiedImg] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const available = TEMPLATES.filter(
    (t) => t.value !== "highlight" || highlight
  );

  const renderPng = useCallback(async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    const dataUrl = await toPng(cardRef.current, {
      pixelRatio: 2,
      cacheBust: true,
    });
    const res = await fetch(dataUrl);
    return res.blob();
  }, []);

  const handleDownload = async () => {
    setBusy(true);
    try {
      const blob = await renderPng();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vibebench-guess-${template}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const handleCopyImage = async () => {
    setBusy(true);
    try {
      const blob = await renderPng();
      if (!blob) return;
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopiedImg(true);
      setTimeout(() => setCopiedImg(false), 2000);
    } catch (e) {
      console.error(e);
      alert("复制图片失败，请改用下载");
    } finally {
      setBusy(false);
    }
  };

  const fetchShareUrl = useCallback(async (): Promise<string | null> => {
    const res = await fetch("/api/guess/share", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Player-Token": playerToken,
      },
      body: JSON.stringify({ session_id: sessionId, tpl: template }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) return null;
    return json.data.share_url as string;
  }, [playerToken, sessionId, template]);

  const handleCopyLink = async () => {
    setBusy(true);
    try {
      const url = await fetchShareUrl();
      if (!url) {
        alert("生成链接失败");
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const handleWebShare = async () => {
    setBusy(true);
    try {
      const blob = await renderPng();
      const url = await fetchShareUrl();
      const file = blob
        ? new File([blob], "vibebench-guess.png", { type: "image/png" })
        : null;
      const shareData: ShareData = {
        title: "VibeBench · 看作品猜模型",
        text: `我在 VibeBench 猜模型拿到了 ${correct}/${total}！`,
        url: url ?? undefined,
      };
      if (file && navigator.canShare?.({ files: [file] })) {
        shareData.files = [file];
      }
      await navigator.share(shareData);
    } catch (e) {
      // user cancelled or unsupported
      console.debug(e);
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  const canWebShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl p-6 my-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-xl font-bold">分享战绩卡片</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted/40 transition-colors"
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Template tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {available.map((t) => (
            <button
              key={t.value}
              onClick={() => setTemplate(t.value)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                template === t.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Card preview (scaled on small screens) */}
        <div className="flex justify-center mb-5 overflow-x-auto">
          <div className="rounded-xl overflow-hidden border border-border/50 shadow-lg">
            <div ref={cardRef}>
              <ShareCard
                nickname={nickname}
                difficulty={difficulty}
                correct={correct}
                total={total}
                authorRate={authorRate}
                template={template}
                highlight={highlight}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={handleDownload}
            disabled={busy}
            className="btn-primary !rounded-full px-4 inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> 下载 PNG
          </button>
          <button
            onClick={handleCopyImage}
            disabled={busy}
            className="btn-secondary !rounded-full px-4 inline-flex items-center gap-2"
          >
            {copiedImg ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copiedImg ? "已复制" : "复制图片"}
          </button>
          <button
            onClick={handleCopyLink}
            disabled={busy}
            className="btn-secondary !rounded-full px-4 inline-flex items-center gap-2"
          >
            {copiedLink ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Link2 className="h-4 w-4" />
            )}
            {copiedLink ? "已复制" : "复制链接"}
          </button>
          {canWebShare && (
            <button
              onClick={handleWebShare}
              disabled={busy}
              className="btn-secondary !rounded-full px-4 inline-flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" /> 系统分享
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
