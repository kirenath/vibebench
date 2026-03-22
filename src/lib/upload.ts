import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import {
  UPLOAD_DIR,
  UPLOAD_MAX_FILE_SIZE_BYTES,
  ALLOWED_EXTENSIONS,
} from "./constants";

export function getUploadPath(
  challengeId: string,
  modelVariantId: string,
  channelId: string,
  phaseKey: string,
  artifactType: string
): string {
  return path.join(
    UPLOAD_DIR,
    challengeId,
    modelVariantId,
    channelId,
    phaseKey,
    artifactType
  );
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
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

export async function saveFile(
  buffer: Buffer,
  dirPath: string,
  fileName: string
): Promise<{ filePath: string; checksum: string; fileSize: number }> {
  await ensureDir(dirPath);
  const safeName = sanitizeFileName(fileName);
  const filePath = path.join(dirPath, safeName);
  const checksum = computeChecksum(buffer);
  await fs.writeFile(filePath, buffer);
  // Always store forward slashes for cross-platform compatibility
  return { filePath: filePath.replace(/\\/g, "/"), checksum, fileSize: buffer.length };
}

export async function deleteDir(dirPath: string): Promise<void> {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch {
    // ignore if doesn't exist
  }
}
