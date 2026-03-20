import { createHash } from "crypto";
import { readFile, mkdir, writeFile, rm, stat } from "fs/promises";
import { join, extname, normalize } from "path";
import { UPLOAD_DIR, UPLOAD_MAX_FILE_SIZE } from "./constants";
import type { ArtifactType } from "@/types";

export function buildArtifactDir(
  challengeId: string,
  modelVariantId: string,
  channelId: string,
  phaseKey: string,
  type: ArtifactType
): string {
  return join(UPLOAD_DIR, challengeId, modelVariantId, channelId, phaseKey, type);
}

export async function saveArtifactFile(
  dir: string,
  fileName: string,
  buffer: Buffer
): Promise<{ filePath: string; checksum: string; fileSize: number }> {
  if (buffer.length > UPLOAD_MAX_FILE_SIZE) {
    throw new Error(`File size exceeds limit of ${UPLOAD_MAX_FILE_SIZE} bytes`);
  }

  const ext = extname(fileName).toLowerCase();
  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const normalizedPath = normalize(join(dir, safeFileName));
  if (!normalizedPath.startsWith(normalize(UPLOAD_DIR))) {
    throw new Error("Invalid file path");
  }

  await mkdir(dir, { recursive: true });

  const checksum = createHash("sha256").update(buffer).digest("hex");
  await writeFile(normalizedPath, buffer);

  return {
    filePath: normalizedPath,
    checksum,
    fileSize: buffer.length,
  };
}

export async function removeArtifactDir(dir: string): Promise<void> {
  const normalizedDir = normalize(dir);
  if (!normalizedDir.startsWith(normalize(UPLOAD_DIR))) return;
  try {
    await rm(normalizedDir, { recursive: true, force: true });
  } catch {}
}

export async function readArtifactFile(
  filePath: string
): Promise<Buffer | null> {
  const normalizedPath = normalize(filePath);
  if (!normalizedPath.startsWith(normalize(UPLOAD_DIR))) return null;
  try {
    return await readFile(normalizedPath);
  } catch {
    return null;
  }
}

export function getMimeType(fileName: string): string {
  const ext = extname(fileName).toLowerCase();
  const mimeMap: Record<string, string> = {
    ".html": "text/html",
    ".htm": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".md": "text/markdown",
    ".txt": "text/plain",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
  };
  return mimeMap[ext] || "application/octet-stream";
}
