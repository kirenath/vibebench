import type { SubmissionOverview } from "@/types";
import ManualTouchedBadge from "./ManualTouchedBadge";

export default function SubmissionCard({ submission }: { submission: SubmissionOverview }) {
  return (
    <div className="rounded-organic border border-organic-border/50 bg-organic-card p-6 shadow-soft hover:-translate-y-1 hover:shadow-soft-hover transition-all duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-heading font-semibold text-organic-fg">{submission.model_variant_name}</span>
            <span className="text-xs px-3 py-1 rounded-full bg-organic-accent text-organic-accent-fg font-medium">
              {submission.channel_name}
            </span>
            {submission.manual_touched && <ManualTouchedBadge notes={submission.manual_notes} />}
          </div>
          <p className="text-xs text-organic-muted-fg mt-1.5">
            {submission.vendor_name} / {submission.model_family_name}
          </p>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          {submission.has_html && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-organic-primary/10 text-organic-primary font-medium">HTML</span>
          )}
          {submission.has_prd && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-organic-secondary/10 text-organic-secondary font-medium">PRD</span>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-organic-muted-fg">
        {submission.duration_ms != null && (
          <span>Duration: {(submission.duration_ms / 1000).toFixed(1)}s</span>
        )}
        {submission.iteration_count != null && (
          <span>Iterations: {submission.iteration_count}</span>
        )}
        <span>Updated: {new Date(submission.updated_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
