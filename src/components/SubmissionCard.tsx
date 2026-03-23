"use client";

import { useState } from "react";
import { Clock, RefreshCw, ExternalLink, AlertTriangle, Code2 } from "lucide-react";
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

export interface PhaseData {
  phase_key: string;
  phase_label: string;
  submission: PhaseSubmission | null;
}

interface Props {
  modelName: string;
  vendorName: string;
  channelName: string;
  phases: PhaseData[];
}

function PhaseRow({
  label,
  data,
  modelName,
  showPrd,
}: {
  label: string;
  data: PhaseSubmission | null;
  modelName: string;
  showPrd: boolean;
}) {
  const [htmlModal, setHtmlModal] = useState(false);
  const [prdModal, setPrdModal] = useState(false);
  const [sourceModal, setSourceModal] = useState(false);

  if (!data) {
    return (
      <div className="flex items-center gap-3 py-2">
        <span className="text-xs font-semibold text-muted-foreground w-20 shrink-0 truncate" title={label}>
          {label}
        </span>
        <span className="text-xs text-muted-foreground italic">暂无</span>
      </div>
    );
  }

  const htmlUrl = `/s/${data.submission_id}/index.html`;
  const prdApiUrl = `/api/submissions/${data.submission_id}/artifacts/prd`;

  return (
    <>
      <div className="flex items-center gap-3 py-2 flex-wrap">
        <span className="text-xs font-semibold text-muted-foreground w-20 shrink-0 truncate" title={label}>
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
          title={modelName}
          submissionId={data.submission_id}
          onClose={() => setHtmlModal(false)}
        />
      )}
      {prdModal && (
        <PrdPreviewModal
          submissionId={data.submission_id}
          title={modelName}
          onClose={() => setPrdModal(false)}
        />
      )}
      {sourceModal && (
        <SourceCodePreviewModal
          submissionId={data.submission_id}
          title={modelName}
          onClose={() => setSourceModal(false)}
        />
      )}
    </>
  );
}

export default function SubmissionCard({
  modelName,
  vendorName,
  channelName,
  phases,
}: Props) {
  return (
    <div className="card p-6 card-hover group relative">
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-heading font-bold text-lg">{modelName}</h3>
        <p className="text-sm text-muted-foreground">
          {vendorName} · {channelName}
        </p>
      </div>

      {/* Phase rows */}
      <div className="space-y-1 border-t border-border/30 pt-3">
        {phases.map((p) => (
          <PhaseRow
            key={p.phase_key}
            label={p.phase_label}
            data={p.submission}
            modelName={modelName}
            showPrd={true}
          />
        ))}
      </div>
    </div>
  );
}
