"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { toPng } from "html-to-image";
import { X, Download, Copy, Link2, Share2, Check } from "lucide-react";
import ShareCard from "./ShareCard";
import { getShareStyleList } from "./share/registry";
import { CARD_WIDTH, CARD_HEIGHT } from "./share/types";
import { DEFAULT_SHARE_STYLE, type ShareStyleId } from "@/lib/shareStyles";
import type { GuessDifficulty } from "@/lib/guessToken";

const STYLE_LIST = getShareStyleList();

// Clean short link for the "复制链接" button. The result itself lives in the
// shared image (which prints this URL), so the copied link only needs to send
// people to the game. (The signed share-token landing page is still used by
// the system-level Web Share flow for rich link previews.)
const SHORT_GUESS_URL = "https://vibebench.app/guess";

// Robust text copy. `navigator.clipboard.writeText` rejects with
// "Document is not focused" when focus is elsewhere (e.g. DevTools open) at
// the time of the async write. Fall back to a hidden <textarea> + execCommand,
// which is not subject to the focus requirement.
async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof window !== "undefined") window.focus();
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy path
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

interface ShareCardModalProps {
  open: boolean;
  onClose: () => void;
  nickname: string;
  difficulty: GuessDifficulty;
  correct: number;
  total: number;
  authorRate?: number;
  sessionId: string;
  playerToken: string;
}

export default function ShareCardModal({
  open,
  onClose,
  nickname,
  difficulty,
  correct,
  total,
  authorRate,
  sessionId,
  playerToken,
}: ShareCardModalProps) {
  const [styleId, setStyleId] = useState<ShareStyleId>(DEFAULT_SHARE_STYLE);
  const [copiedImg, setCopiedImg] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Fit the fixed-size card into the available preview width so portrait /
  // narrow screens scale it down instead of cropping it. The off-screen
  // cardRef stays at full CARD_WIDTH for a crisp PNG export.
  useEffect(() => {
    if (!open) return;
    const el = previewRef.current;
    if (!el) return;
    const update = () => {
      const avail = el.clientWidth;
      setScale(Math.min(1, avail / CARD_WIDTH));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

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
      a.download = "vibebench-guess.png";
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
      body: JSON.stringify({ session_id: sessionId, style: styleId }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) return null;
    return json.data.share_url as string;
  }, [playerToken, sessionId, styleId]);

  const handleCopyLink = async () => {
    setBusy(true);
    try {
      const ok = await copyText(SHORT_GUESS_URL);
      if (ok) {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        // Last resort: surface the link so the user can copy manually.
        window.prompt("复制此链接：", SHORT_GUESS_URL);
      }
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

        {/* Style switcher */}
        <div className="flex flex-wrap gap-2 mb-4">
          {STYLE_LIST.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyleId(s.id)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors inline-flex items-center gap-1 ${
                styleId === s.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
              }`}
            >
              {s.label}
              {!s.ready && (
                <span className="text-[10px] opacity-70">制作中</span>
              )}
            </button>
          ))}
        </div>

        {/* Card preview (scaled to fit narrow / portrait screens) */}
        <div ref={previewRef} className="flex justify-center mb-5">
          <div
            style={{
              width: CARD_WIDTH * scale,
              height: CARD_HEIGHT * scale,
            }}
          >
            <div
              className="rounded-xl overflow-hidden border border-border/50 shadow-lg"
              style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <div ref={cardRef}>
                <ShareCard
                  styleId={styleId}
                  nickname={nickname}
                  difficulty={difficulty}
                  correct={correct}
                  total={total}
                  authorRate={authorRate}
                />
              </div>
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
