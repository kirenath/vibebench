"use client";

export default function ManualTouchedBadge({ notes }: { notes: string | null }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-organic-secondary/10 text-organic-secondary border border-organic-secondary/20 cursor-help font-medium"
      title={notes || "This submission was manually modified"}
    >
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      Manual Edit
    </span>
  );
}
