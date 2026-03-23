export const ARTIFACT_TYPES = ["html", "prd", "screenshot"] as const;
export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

export const TIMING_METHODS = ["manual", "measured", "estimated"] as const;
export type TimingMethod = (typeof TIMING_METHODS)[number];

export const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
export const UPLOAD_MAX_FILE_SIZE_MB = parseInt(
  process.env.UPLOAD_MAX_FILE_SIZE_MB || "20",
  10
);
export const UPLOAD_MAX_FILE_SIZE_BYTES = UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024;

// Cloudflare R2 Storage
export const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
export const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
export const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "vibebench-assets";
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://assets.vibebench.app";

export const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
export const JWT_EXPIRY = "7d";

export const SANDBOX_BASE_URL =
  process.env.SANDBOX_BASE_URL || "http://localhost:3000";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  html: ["text/html"],
  prd: ["text/markdown", "text/plain"],
  screenshot: ["image/png", "image/jpeg", "image/webp"],
};

export const ALLOWED_EXTENSIONS: Record<string, string[]> = {
  html: [".html", ".htm"],
  prd: [".md", ".txt"],
  screenshot: [".png", ".jpg", ".jpeg", ".webp"],
};
