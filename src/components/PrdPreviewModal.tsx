"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ExternalLink, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  submissionId: string;
  title: string;
  onClose: () => void;
}

export default function PrdPreviewModal({ submissionId, title, onClose }: Props) {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = `/api/submissions/${submissionId}/artifacts/prd`;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(setContent)
      .catch((e) => setError(e.message));
  }, [apiUrl]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-[90vw] max-w-3xl h-[85vh] bg-card rounded-3xl shadow-2xl border border-border/50 flex flex-col overflow-hidden"
        style={{ animation: "scaleIn 0.2s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 shrink-0">
          <h3 className="font-heading font-bold text-lg truncate pr-4">
            {title} — PRD
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={apiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-primary/10 transition-colors"
              title="在新标签页中打开"
            >
              <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-destructive/10 transition-colors"
              title="关闭"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {error ? (
            <div className="text-destructive text-center py-12">
              加载失败：{error}
            </div>
          ) : content === null ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              加载中…
            </div>
          ) : (
            <div className="prose prose-sm max-w-none text-foreground/90">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
