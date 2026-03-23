"use client";

import { useState } from "react";
import { Clock, RefreshCw, ExternalLink, AlertTriangle, Code2 } from "lucide-react";
import Link from "next/link";
import HtmlPreviewModal from "./HtmlPreviewModal";
import PrdPreviewModal from "./PrdPreviewModal";
import SourceCodePreviewModal from "./SourceCodePreviewModal";

export interface PhaseSubmission {
  submission_id: string;
  duration_ms: string | null;
  iteration_count: number | null;
  has_html: boolean;
  has_prd: boolean;
  manual_touched: boolean;
  manual_notes: string | null;
}

interface Props {
  challengeId: string;
  challengeTitle: string;
  channelName: string;
  phase1: PhaseSubmission | null;
  phase2: PhaseSubmission | null;
}

function PhaseRow({
  label,
  data,
  challengeTitle,
  showPrd,
}: {
  label: string;
  data: PhaseSubmission | null;
  challengeTitle: string;
  showPrd: boolean;
}) {
  const [htmlModal, setHtmlModal] = useState(false);
  const [prdModal, setPrdModal] = useState(false);
  const [sourceModal, setSourceModal] = useState(false);

  if (!data) {
    return (
      <div className="flex items-center gap-3 py-2">
        <span className="text-xs font-semibold text-muted-foreground w-8 shrink-0">
          {label}
        </span>
        <span className="text-xs text-muted-foreground italic">暂无</span>
      </div>
    );
  }

  const htmlUrl = `/api/submissions/${data.submission_id}/artifacts/html`;
  const prdApiUrl = `/api/submissions/${data.submission_id}/artifacts/prd`;

  return (
    <>
      <div className="flex items-center gap-3 py-2 flex-wrap">
        <span className="text-xs font-semibold text-muted-foreground w-8 shrink-0">
          {label}
        </span>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {data.duration_ms && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {(parseInt(data.duration_ms) / 1000).toFixed(1)}s
            </span>
          )}
          {data.iteration_count != null && (
            <span className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              {data.iteration_count} 次迭代
            </span>
          )}
        </div>

        {/* Button groups */}
        <div className="flex items-center gap-2 ml-auto">
          {data.has_html && (
            <span className="inline-flex items-center rounded-full border border-border/50 overflow-hidden">
              <button
                onClick={() => setHtmlModal(true)}
                className="px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
              >
                查看效果
              </button>
              <a
                href={htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1.5 border-l border-border/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                title="在新标签页中打开"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </span>
          )}

          {data.has_html && (
            <button
              onClick={() => setSourceModal(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <Code2 className="h-3 w-3" />
              源码
            </button>
          )}

          {showPrd && data.has_prd && (
            <span className="inline-flex items-center rounded-full border border-border/50 overflow-hidden">
              <button
                onClick={() => setPrdModal(true)}
                className="px-3 py-1.5 text-xs font-semibold text-secondary hover:bg-secondary/10 transition-colors"
              >
                PRD
              </button>
              <a
                href={prdApiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1.5 border-l border-border/50 text-muted-foreground hover:text-secondary hover:bg-secondary/10 transition-colors"
                title="在新标签页中打开"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </span>
          )}

          {!data.has_html && (
            <span className="text-xs text-muted-foreground italic">
              暂无作品
            </span>
          )}
        </div>

        {data.manual_touched && (
          <span
            className="badge-destructive flex items-center gap-1 text-[10px]"
            title={data.manual_notes || "人工修订"}
          >
            <AlertTriangle className="h-3 w-3" />
            人工修订
          </span>
        )}
      </div>

      {/* Modals */}
      {htmlModal && (
        <HtmlPreviewModal
          url={htmlUrl}
          title={challengeTitle}
          submissionId={data.submission_id}
          onClose={() => setHtmlModal(false)}
        />
      )}
      {prdModal && (
        <PrdPreviewModal
          submissionId={data.submission_id}
          title={challengeTitle}
          onClose={() => setPrdModal(false)}
        />
      )}
      {sourceModal && (
        <SourceCodePreviewModal
          submissionId={data.submission_id}
          title={challengeTitle}
          onClose={() => setSourceModal(false)}
        />
      )}
    </>
  );
}

export default function ModelSubmissionCard({
  challengeId,
  challengeTitle,
  channelName,
  phase1,
  phase2,
}: Props) {
  return (
    <div className="card p-6 card-hover group relative flex flex-col h-full">
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-heading font-bold text-lg">{challengeTitle}</h3>
        <p className="text-sm text-muted-foreground">
          {channelName}
        </p>
      </div>

      {/* Phase rows */}
      <div className="space-y-1 border-t border-border/30 pt-3 flex-grow">
        <PhaseRow
          label="初版"
          data={phase1}
          challengeTitle={challengeTitle}
          showPrd={false}
        />
        <PhaseRow
          label="改版"
          data={phase2}
          challengeTitle={challengeTitle}
          showPrd={true}
        />
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-border/30">
        <Link
          href={`/challenges/${challengeId}`}
          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1 w-full"
        >
          赛题详情
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
