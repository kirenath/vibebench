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
    <div className="relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-organic-primary/5 rounded-blob blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-organic-fg mb-3">{challenge.title}</h1>
          {challenge.description && (
            <p className="text-lg text-organic-muted-fg leading-relaxed">{challenge.description}</p>
          )}
        </header>

        {challenge.rules_markdown && (
          <section className="mb-8 p-6 rounded-organic bg-organic-muted/50 border border-organic-border/50">
            <h3 className="font-heading font-semibold text-organic-fg mb-2">Rules</h3>
            <div className="prose prose-sm max-w-none text-organic-muted-fg whitespace-pre-wrap">
              {challenge.rules_markdown}
            </div>
          </section>
        )}

        {challenge.prompt_markdown && (
          <section className="mb-8 p-6 rounded-organic bg-organic-primary/5 border border-organic-primary/20">
            <h3 className="font-heading font-semibold text-organic-primary mb-2">Prompt</h3>
            <div className="prose prose-sm max-w-none text-organic-fg/80 whitespace-pre-wrap">
              {challenge.prompt_markdown}
            </div>
          </section>
        )}

        {phases.length > 0 && (
          <section className="mb-10">
            <PhaseSelector phases={phases} activePhase={activePhase} onSelect={setActivePhase} />
          </section>
        )}

        {previewSub && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="font-heading font-semibold text-organic-fg">
                  Preview: {previewSub.model_variant_name} ({previewSub.channel_name})
                </h3>
                {previewSub.manual_touched && <ManualTouchedBadge notes={previewSub.manual_notes} />}
              </div>
              <button
                onClick={() => setPreviewId(null)}
                className="text-sm text-organic-muted-fg hover:text-organic-primary transition-colors duration-300 font-medium"
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
          <h2 className="text-2xl font-heading font-semibold text-organic-fg mb-6">
            Submissions ({filtered.length})
          </h2>
          {filtered.length === 0 ? (
            <p className="text-organic-muted-fg py-8 text-center">No submissions for this phase yet.</p>
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
    </div>
  );
}
