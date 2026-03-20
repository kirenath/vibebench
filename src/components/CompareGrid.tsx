"use client";

import SandboxIframe from "./SandboxIframe";
import ManualTouchedBadge from "./ManualTouchedBadge";
import type { SubmissionOverview } from "@/types";

export default function CompareGrid({ submissions }: { submissions: SubmissionOverview[] }) {
  const count = submissions.length;
  const gridClass =
    count <= 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2";

  return (
    <div className={`grid ${gridClass} gap-6 h-full`}>
      {submissions.map((sub) => (
        <div key={sub.submission_id} className="flex flex-col min-h-[500px]">
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="font-heading font-semibold text-sm text-organic-fg">{sub.model_variant_name}</span>
            <span className="text-xs px-3 py-1 rounded-full bg-organic-accent text-organic-accent-fg font-medium">
              {sub.channel_name}
            </span>
            {sub.manual_touched && <ManualTouchedBadge notes={sub.manual_notes} />}
          </div>
          <div className="flex-1">
            <SandboxIframe
              submissionId={sub.submission_id}
              title={`${sub.model_variant_name} (${sub.channel_name})`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
