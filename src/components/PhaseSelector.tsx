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
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activePhase === phase.phase_key
              ? "bg-brand-500 text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {phase.phase_label}
        </button>
      ))}
    </div>
  );
}
