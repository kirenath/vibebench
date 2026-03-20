"use client";

export default function SandboxIframe({
  submissionId,
  title,
}: {
  submissionId: string;
  title?: string;
}) {
  const src = `/s/${submissionId}/index.html`;

  return (
    <div className="w-full h-full min-h-[400px] rounded-organic overflow-hidden border border-organic-border/50 bg-white shadow-soft">
      <iframe
        src={src}
        title={title || "Submission Preview"}
        sandbox="allow-scripts"
        className="w-full h-full border-0"
        loading="lazy"
      />
    </div>
  );
}
