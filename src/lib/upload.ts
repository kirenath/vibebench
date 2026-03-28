import { promises as fs } from "fs";
import path from "path";
import { createHash } from "crypto";
import type { ArtifactType } from "@/types";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const MAX_FILE_SIZE =
  (parseInt(process.env.UPLOAD_MAX_FILE_SIZE_MB || "20", 10)) *
  1024 *
  1024;

export function getUploadDir() {
  return UPLOAD_DIR;
}

export function getMaxFileSize() {
  return MAX_FILE_SIZE;
}

/**
 * Build the artifact directory path:
 * uploads/{challenge_id}/{model_variant_id}/{channel_id}/{phase_key}/{type}/
 */
export function buildArtifactPath(parts: {
  challengeId: string;
  modelVariantId: string;
  channelId: string;
  phaseKey: string;
  type: ArtifactType;
}) {
  return path.join(
    UPLOAD_DIR,
    parts.challengeId,
    parts.modelVariantId,
    parts.channelId,
    parts.phaseKey,
    parts.type
  );
}

/**
 * Build the full file system path for an artifact file.
 */
export function buildArtifactFilePath(
  baseParts: {
    challengeId: string;
    modelVariantId: string;
    channelId: string;
    phaseKey: string;
  },
  type: ArtifactType,
  fileName: string
) {
  const dir = buildArtifactPath({ ...baseParts, type });
  return path.join(dir, fileName);
}

/**
 * Compute SHA-256 checksum of a buffer.
 */
export function computeChecksum(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

/**
 * Ensure directory exists, creating it recursively if needed.
 */
export async function ensureDir(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Validate uploaded file: check size, extension.
 */
export function validateFile(
  file: File,
  type: ArtifactType
): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` };
  }

  const allowedExtensions: Record<ArtifactType, string[]> = {
    html: [".html", ".htm"],
    prd: [".md", ".txt"],
    screenshot: [".png", ".jpg", ".jpeg", ".webp"],
  };

  const ext = path.extname(file.name).toLowerCase();
  if (!allowedExtensions[type].includes(ext)) {
    return {
      valid: false,
      error: `Invalid extension "${ext}" for type "${type}"`,
    };
  }

  return { valid: true };
}
