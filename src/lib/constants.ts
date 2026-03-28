export const ARTIFACT_TYPES = ["html", "prd", "screenshot"] as const;

export const TIMING_METHODS = ["manual", "measured", "estimated"] as const;

export const JWT_EXPIRY = "7d";

export const COOKIE_NAME = "vb_admin_token";

export const UPLOAD_SUBDIRS: Record<string, string> = {
  html: "html",
  prd: "prd",
  screenshot: "screenshot",
} as const;
