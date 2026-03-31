import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

const MIME_MAP: Record<string, string> = {
  ".html": "text/html",
  ".htm": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".ico": "image/x-icon",
  ".md": "text/markdown",
  ".txt": "text/plain",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ submissionId: string; path: string[] }> }
) {
  const { submissionId, path: pathParts } = await params;
  const requestedFile = pathParts.join("/");

  try {
    const artifact = await queryOne<{
      file_path: string;
      type: string;
    }>(
      `SELECT sa.file_path, sa.type
       FROM submission_artifacts sa
       WHERE sa.submission_id = $1 AND sa.type = 'html'`,
      [submissionId]
    );

    if (!artifact) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Normalize backslashes to forward slashes for cross-platform compatibility
    // (paths stored on Windows use backslashes, but Linux needs forward slashes)
    const normalizedPath = artifact.file_path.replace(/\\/g, "/");
    const baseDir = path.dirname(normalizedPath);
    const filePath = path.resolve(baseDir, requestedFile);

    const resolvedBase = path.resolve(baseDir);
    if (!filePath.startsWith(resolvedBase)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const content = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_MAP[ext] || "application/octet-stream";

    return new NextResponse(content, {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "ALLOWALL",
        "Content-Security-Policy":
          "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; font-src * data:; img-src * data: blob:; frame-ancestors *;",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
