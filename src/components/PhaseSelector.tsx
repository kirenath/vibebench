"use client";

import type { ChallengePhase } from "@/types";

export default function PhaseSelector({
  phases,
  activePhase,
  onSelect,
}: {
  phases: ChallengePhase[];
  activePhase: string;
  onSelect: (phaseKey: string) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {phases.map((phase) => (
        <button
          key={phase.phase_key}
          onClick={() => onSelect(phase.phase_key)}
          className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
            activePhase === phase.phase_key
              ? "bg-organic-primary text-organic-primary-fg shadow-soft"
              : "bg-organic-muted text-organic-muted-fg hover:bg-organic-primary/10 hover:text-organic-primary"
          }`}
        >
          {phase.phase_label}
        </button>
      ))}
    </div>
  );
}
