export const ARTIFACT_TYPES = ["html", "prd", "screenshot"] as const;
export const TIMING_METHODS = ["manual", "measured", "estimated"] as const;

export const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
export const UPLOAD_MAX_FILE_SIZE =
  (parseInt(process.env.UPLOAD_MAX_FILE_SIZE_MB || "20", 10)) * 1024 * 1024;

export const SANDBOX_BASE_URL =
  process.env.SANDBOX_BASE_URL || "http://localhost:3001";

export const COMPARE_MIN_ENTRIES = 2;
export const COMPARE_MAX_ENTRIES = 4;

export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
} as const;
