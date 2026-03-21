export const ARTIFACT_TYPES = ["html", "prd", "screenshot"] as const;
export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

export const TIMING_METHODS = ["manual", "measured", "estimated"] as const;
export type TimingMethod = (typeof TIMING_METHODS)[number];

export const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
export const UPLOAD_MAX_FILE_SIZE = parseInt(process.env.UPLOAD_MAX_FILE_SIZE_MB || "20", 10) * 1024 * 1024;

export const ALLOWED_MIME_TYPES: Record<ArtifactType, string[]> = {
  html: ["text/html", "text/css", "text/javascript", "application/javascript", "image/png", "image/jpeg", "image/gif", "image/svg+xml", "image/webp", "application/json", "font/woff", "font/woff2"],
  prd: ["text/markdown", "text/plain", "application/pdf"],
  screenshot: ["image/png", "image/jpeg", "image/webp"],
};
