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
    <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden border border-gray-200 bg-white">
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
