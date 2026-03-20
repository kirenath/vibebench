import type { SubmissionOverview } from "@/types";
import ManualTouchedBadge from "./ManualTouchedBadge";

export default function SubmissionCard({ submission }: { submission: SubmissionOverview }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900">{submission.model_variant_name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              {submission.channel_name}
            </span>
            {submission.manual_touched && <ManualTouchedBadge notes={submission.manual_notes} />}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {submission.vendor_name} / {submission.model_family_name}
          </p>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          {submission.has_html && (
            <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-600">HTML</span>
          )}
          {submission.has_prd && (
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-600">PRD</span>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
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
