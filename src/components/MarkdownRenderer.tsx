"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

interface MarkdownRendererProps {
  /** Markdown 源文本 */
  content: string;
  /** 额外的 CSS 类名，用于覆盖或扩展默认 prose 样式 */
  className?: string;
}

const proseClasses = [
  "prose prose-sm max-w-none",
  "text-foreground/80",
  "prose-headings:font-heading prose-headings:text-foreground",
  "prose-p:text-foreground/80",
  "prose-li:text-foreground/80",
  "prose-strong:text-foreground",
  "prose-a:text-primary hover:prose-a:text-primary/80",
  "prose-blockquote:border-l-primary/30 prose-blockquote:bg-muted/30 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-4",
  "prose-code:bg-muted prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-foreground/90 prose-code:before:content-none prose-code:after:content-none",
  "prose-pre:bg-muted prose-pre:rounded-xl",
  "prose-table:text-sm",
  "prose-th:text-foreground prose-th:font-semibold",
  "prose-img:rounded-xl",
].join(" ");

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={className ? `${proseClasses} ${className}` : proseClasses}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{content}</ReactMarkdown>
    </div>
  );
}
