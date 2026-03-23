import path from "path";
import crypto from "crypto";
import {
  UPLOAD_MAX_FILE_SIZE_BYTES,
  ALLOWED_EXTENSIONS,
} from "./constants";
import { uploadToR2, deleteR2Prefix } from "./r2";

/**
 * Build the R2 object key prefix for a given submission's artifact.
 * Format: {challengeId}/{modelVariantId}/{channelId}/{phaseKey}/{artifactType}
 */
export function getObjectKeyPrefix(
  challengeId: string,
  modelVariantId: string,
  channelId: string,
  phaseKey: string,
  artifactType: string
): string {
  return [challengeId, modelVariantId, channelId, phaseKey, artifactType].join("/");
}

export function computeChecksum(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export function validateExtension(
  fileName: string,
  artifactType: string
): boolean {
  const ext = path.extname(fileName).toLowerCase();
  const allowed = ALLOWED_EXTENSIONS[artifactType];
  return allowed ? allowed.includes(ext) : false;
}

export function validateFileSize(size: number): boolean {
  return size <= UPLOAD_MAX_FILE_SIZE_BYTES;
}

export function sanitizeFileName(fileName: string): string {
  return path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Upload a file buffer to R2 and return the object key, checksum, and size.
 */
export async function saveFile(
  buffer: Buffer,
  objectKeyPrefix: string,
  fileName: string,
  mimeType: string
): Promise<{ objectKey: string; checksum: string; fileSize: number }> {
  const safeName = sanitizeFileName(fileName);
  const objectKey = `${objectKeyPrefix}/${safeName}`;
  const checksum = computeChecksum(buffer);
  await uploadToR2(buffer, objectKey, mimeType);
  return { objectKey, checksum, fileSize: buffer.length };
}

/**
 * Delete all R2 objects under a given prefix (e.g. a submission's artifact directory).
 */
export async function deleteDir(prefix: string): Promise<void> {
  await deleteR2Prefix(prefix);
}
