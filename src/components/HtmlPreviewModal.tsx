"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ExternalLink } from "lucide-react";

interface Props {
  url: string;
  title: string;
  onClose: () => void;
}

export default function HtmlPreviewModal({ url, title, onClose }: Props) {
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

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-[95vw] h-[90vh] bg-card rounded-3xl shadow-2xl border border-border/50 flex flex-col overflow-hidden"
        style={{ animation: "scaleIn 0.2s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 shrink-0">
          <h3 className="font-heading font-bold text-lg truncate pr-4">
            {title}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={url}
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

        {/* iframe */}
        <div className="flex-1 bg-white">
          <iframe
            src={url}
            className="w-full h-full border-0"
            title={title}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
