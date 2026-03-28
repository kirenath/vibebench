import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getUploadDir } from "@/lib/upload";
import { promises as fs } from "fs";
import path from "path";

const CSP_HEADER =
  "default-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'";

const MIME_MAP: Record<string, string> = {
  ".html": "text/html",
  ".htm": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".pdf": "application/pdf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
};

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_MAP[ext] || "application/octet-stream";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ submissionId: string; path: string[] }> }
) {
  const { submissionId, path: pathSegments } = await params;

  if (!pathSegments || pathSegments.length === 0) {
    return NextResponse.json(
      { success: false, error: "File path is required" },
      { status: 400 }
    );
  }

  // Look up the submission and its challenge_phase
  const submissionResult = await query<{
    submission_is_published: boolean;
    model_variant_id: string;
    channel_id: string;
    challenge_id: string;
    phase_key: string;
  }>(
    `SELECT so.submission_is_published, so.model_variant_id, so.channel_id, so.challenge_id, so.phase_key
     FROM submission_overview so
     WHERE so.submission_id = $1`,
    [submissionId]
  );

  if (submissionResult.rows.length === 0) {
    return NextResponse.json(
      { success: false, error: "Submission not found" },
      { status: 404 }
    );
  }

  const submission = submissionResult.rows[0];

  // Only serve files for published submissions
  if (!submission.submission_is_published) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 }
    );
  }

  // Build the file path: uploads/{challenge_id}/{model_variant_id}/{channel_id}/{phase_key}/{type}/{...filepath}
  const uploadDir = getUploadDir();
  const filePath = path.join(
    uploadDir,
    submission.challenge_id,
    submission.model_variant_id,
    submission.channel_id,
    submission.phase_key,
    ...pathSegments
  );

  // Resolve to absolute and ensure it's within the upload directory
  const resolvedPath = path.resolve(filePath);
  const resolvedUploadDir = path.resolve(uploadDir);
  if (!resolvedPath.startsWith(resolvedUploadDir)) {
    return NextResponse.json(
      { success: false, error: "Invalid path" },
      { status: 400 }
    );
  }

  // Check if file exists
  let fileStat;
  try {
    fileStat = await fs.stat(resolvedPath);
  } catch {
    return NextResponse.json(
      { success: false, error: "File not found" },
      { status: 404 }
    );
  }

  if (!fileStat.isFile()) {
    return NextResponse.json(
      { success: false, error: "Not a file" },
      { status: 400 }
    );
  }

  // Read and serve the file
  const fileBuffer = await fs.readFile(resolvedPath);
  const mimeType = getMimeType(resolvedPath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": mimeType,
      "Content-Length": String(fileBuffer.length),
      "Content-Security-Policy": CSP_HEADER,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
