"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ExternalLink, Copy, Check, Download, Loader2 } from "lucide-react";

interface Props {
  submissionId: string;
  title: string;
  onClose: () => void;
}

/* ── Minimal HTML syntax highlighter (zero deps) ── */

interface Token {
  type: "tag" | "attr-name" | "attr-value" | "comment" | "doctype" | "entity" | "text";
  value: string;
}

function tokenizeHtml(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < src.length) {
    // HTML comment
    if (src.startsWith("<!--", i)) {
      const end = src.indexOf("-->", i + 4);
      const slice = end === -1 ? src.slice(i) : src.slice(i, end + 3);
      tokens.push({ type: "comment", value: slice });
      i += slice.length;
      continue;
    }

    // DOCTYPE
    if (src.startsWith("<!", i) && /^<!doctype\b/i.test(src.slice(i))) {
      const end = src.indexOf(">", i);
      const slice = end === -1 ? src.slice(i) : src.slice(i, end + 1);
      tokens.push({ type: "doctype", value: slice });
      i += slice.length;
      continue;
    }

    // Tag (opening or closing)
    if (src[i] === "<" && (src[i + 1] === "/" || /[a-zA-Z]/.test(src[i + 1] || ""))) {
      const end = src.indexOf(">", i);
      const slice = end === -1 ? src.slice(i) : src.slice(i, end + 1);
      // Break tag into sub-tokens
      const tagMatch = slice.match(/^(<\/?)([\w-]+)/);
      if (tagMatch) {
        tokens.push({ type: "tag", value: tagMatch[1] });
        tokens.push({ type: "tag", value: tagMatch[2] });
        let rest = slice.slice(tagMatch[0].length);
        // Parse attributes
        const attrRe = /([\w\-:@.]+)(=)("[^"]*"|'[^']*'|[^\s>]+)?/g;
        let lastIdx = 0;
        let m: RegExpExecArray | null;
        while ((m = attrRe.exec(rest)) !== null) {
          // text between attrs
          if (m.index > lastIdx) {
            const gap = rest.slice(lastIdx, m.index);
            if (gap.trim()) tokens.push({ type: "text", value: gap });
          }
          tokens.push({ type: "text", value: " " });
          tokens.push({ type: "attr-name", value: m[1] });
          tokens.push({ type: "text", value: "=" });
          if (m[3]) tokens.push({ type: "attr-value", value: m[3] });
          lastIdx = m.index + m[0].length;
        }
        // remaining (e.g. "/>", ">")
        const tail = rest.slice(lastIdx);
        if (tail) tokens.push({ type: "tag", value: tail });
      } else {
        tokens.push({ type: "tag", value: slice });
      }
      i += slice.length;
      continue;
    }

    // HTML entity
    if (src[i] === "&") {
      const end = src.indexOf(";", i);
      if (end !== -1 && end - i < 12) {
        const entity = src.slice(i, end + 1);
        tokens.push({ type: "entity", value: entity });
        i += entity.length;
        continue;
      }
    }

    // Plain text
    let next = src.indexOf("<", i + 1);
    if (next === -1) next = src.length;
    const ampIdx = src.indexOf("&", i + 1);
    if (ampIdx !== -1 && ampIdx < next) next = ampIdx;
    tokens.push({ type: "text", value: src.slice(i, next) });
    i = next;
  }

  return tokens;
}

const TOKEN_COLORS: Record<Token["type"], string> = {
  tag: "#22863a",
  "attr-name": "#6f42c1",
  "attr-value": "#032f62",
  comment: "#6a737d",
  doctype: "#22863a",
  entity: "#e36209",
  text: "#24292e",
};

function HighlightedCode({ code }: { code: string }) {
  const lines = code.split("\n");

  return (
    <div className="flex text-[13px] leading-6 font-mono">
      {/* Line numbers */}
      <div
        className="select-none text-right pr-4 border-r border-border/30 shrink-0 sticky left-0 z-10"
        style={{ background: "#fafbfc" }}
      >
        {lines.map((_, i) => (
          <div key={i} className="px-3" style={{ color: "#bbb" }}>
            {i + 1}
          </div>
        ))}
      </div>

      {/* Code */}
      <div className="overflow-x-auto flex-1">
        <pre className="pl-4">
          {lines.map((line, i) => {
            const tokens = tokenizeHtml(line);
            return (
              <div key={i} className="hover:bg-black/[0.03] transition-colors pr-4">
                {tokens.length === 0 ? (
                  "\n"
                ) : (
                  tokens.map((t, j) => (
                    <span key={j} style={{ color: TOKEN_COLORS[t.type] }}>
                      {t.value}
                    </span>
                  ))
                )}
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}

/* ── Modal component ── */

export default function SourceCodePreviewModal({
  submissionId,
  title,
  onClose,
}: Props) {
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const apiUrl = `/api/submissions/${submissionId}/artifacts/html`;

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
      .then(setCode)
      .catch((e) => setError(e.message));
  }, [apiUrl]);

  const handleCopy = useCallback(async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [code]);

  const handleDownload = useCallback(() => {
    if (!code) return;
    const blob = new Blob([code], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [code, title]);

  const handleOpenPlainText = useCallback(() => {
    if (!code) return;
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }, [code]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-[95vw] h-[90vh] rounded-3xl shadow-2xl border border-border/50 flex flex-col overflow-hidden"
        style={{ animation: "scaleIn 0.2s ease-out", background: "#fafbfc" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 shrink-0" style={{ background: "#f6f8fa" }}>
          <h3 className="font-heading font-bold text-lg truncate pr-4" style={{ color: "#24292e" }}>
            {title} — 源码
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="p-2 rounded-full hover:bg-black/5 transition-colors"
              title={copied ? "已复制" : "复制代码"}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-gray-500 hover:text-gray-800" />
              )}
            </button>
            <button
              onClick={handleDownload}
              className="p-2 rounded-full hover:bg-black/5 transition-colors"
              title="下载源码"
            >
              <Download className="h-4 w-4 text-gray-500 hover:text-gray-800" />
            </button>
            <button
              onClick={handleOpenPlainText}
              className="p-2 rounded-full hover:bg-black/5 transition-colors"
              title="在新标签页中打开源码"
            >
              <ExternalLink className="h-4 w-4 text-gray-500 hover:text-gray-800" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-red-500/10 transition-colors"
              title="关闭"
            >
              <X className="h-4 w-4 text-gray-500 hover:text-red-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {error ? (
            <div className="text-red-600 text-center py-12">
              加载失败：{error}
            </div>
          ) : code === null ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              加载中…
            </div>
          ) : (
            <HighlightedCode code={code} />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
