import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
} from "./constants";

let _client: S3Client | null = null;

/**
 * Check whether R2 environment variables are fully configured.
 */
export function isR2Configured(): boolean {
  return !!(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME);
}

/**
 * Get (or lazily create) the singleton S3-compatible client for R2.
 * Returns null when env vars are missing (e.g. local dev).
 */
export function getR2Client(): S3Client | null {
  if (!isR2Configured()) return null;
  if (!_client) {
    _client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return _client;
}

/**
 * Build the public CDN URL for a given R2 object key.
 */
export function getR2PublicUrl(objectKey: string): string {
  const base = R2_PUBLIC_URL.replace(/\/+$/, "");
  return `${base}/${objectKey}`;
}

/**
 * Upload a buffer to R2.
 */
export async function uploadToR2(
  buffer: Buffer,
  objectKey: string,
  contentType: string
): Promise<void> {
  const client = getR2Client();
  if (!client) {
    throw new Error(
      "R2 storage is not configured. Upload is only available in production."
    );
  }
  // Ensure charset=utf-8 for text-based content
  const ct = contentType.startsWith("text/") && !contentType.includes("charset")
    ? `${contentType}; charset=utf-8`
    : contentType;

  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: objectKey,
      Body: buffer,
      ContentType: ct,
    })
  );
}

/**
 * Delete a single object from R2.
 */
export async function deleteFromR2(objectKey: string): Promise<void> {
  const client = getR2Client();
  if (!client) return; // silently skip when not configured
  await client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: objectKey,
    })
  );
}

/**
 * Delete all objects under a given key prefix (simulates deleting a directory).
 */
export async function deleteR2Prefix(prefix: string): Promise<void> {
  const client = getR2Client();
  if (!client) return; // silently skip when not configured

  const listed = await client.send(
    new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: prefix,
    })
  );

  const objects = listed.Contents;
  if (!objects || objects.length === 0) return;

  await client.send(
    new DeleteObjectsCommand({
      Bucket: R2_BUCKET_NAME,
      Delete: {
        Objects: objects.map((o) => ({ Key: o.Key })),
        Quiet: true,
      },
    })
  );
}
