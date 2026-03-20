"use client";

import { useState } from "react";
import PhaseSelector from "@/components/PhaseSelector";
import SubmissionCard from "@/components/SubmissionCard";
import SandboxIframe from "@/components/SandboxIframe";
import ManualTouchedBadge from "@/components/ManualTouchedBadge";
import type { Challenge, ChallengePhase, SubmissionOverview } from "@/types";

export default function ChallengeDetailClient({
  challenge,
  phases,
  submissions,
}: {
  challenge: Challenge;
  phases: ChallengePhase[];
  submissions: SubmissionOverview[];
}) {
  const defaultPhase = phases.find((p) => p.is_default)?.phase_key || phases[0]?.phase_key || "";
  const [activePhase, setActivePhase] = useState(defaultPhase);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const filtered = submissions.filter((s) => s.phase_key === activePhase);
  const previewSub = filtered.find((s) => s.submission_id === previewId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{challenge.title}</h1>
        {challenge.description && (
          <p className="text-lg text-gray-500">{challenge.description}</p>
        )}
      </header>

      {challenge.rules_markdown && (
        <section className="mb-8 p-6 rounded-xl bg-gray-50 border border-gray-200">
          <h3 className="font-medium text-gray-700 mb-2">Rules</h3>
          <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
            {challenge.rules_markdown}
          </div>
        </section>
      )}

      {challenge.prompt_markdown && (
        <section className="mb-8 p-6 rounded-xl bg-blue-50 border border-blue-200">
          <h3 className="font-medium text-blue-700 mb-2">Prompt</h3>
          <div className="prose prose-sm max-w-none text-blue-600 whitespace-pre-wrap">
            {challenge.prompt_markdown}
          </div>
        </section>
      )}

      {phases.length > 0 && (
        <section className="mb-8">
          <PhaseSelector phases={phases} activePhase={activePhase} onSelect={setActivePhase} />
        </section>
      )}

      {previewSub && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="font-medium text-gray-900">
                Preview: {previewSub.model_variant_name} ({previewSub.channel_name})
              </h3>
              {previewSub.manual_touched && <ManualTouchedBadge notes={previewSub.manual_notes} />}
            </div>
            <button
              onClick={() => setPreviewId(null)}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Close
            </button>
          </div>
          <div className="h-[600px]">
            <SandboxIframe
              submissionId={previewSub.submission_id}
              title={previewSub.model_variant_name}
            />
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Submissions ({filtered.length})
        </h2>
        {filtered.length === 0 ? (
          <p className="text-gray-400 py-8 text-center">No submissions for this phase yet.</p>
        ) : (
          <div className="grid gap-4">
            {filtered.map((sub) => (
              <div
                key={sub.submission_id}
                className="cursor-pointer"
                onClick={() => sub.has_html && setPreviewId(sub.submission_id)}
              >
                <SubmissionCard submission={sub} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
