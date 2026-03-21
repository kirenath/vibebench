import { queryOne } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import mime from "mime-types";
import { UPLOAD_DIR } from "@/lib/constants";

type Params = { params: Promise<{ submissionId: string; path: string[] }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { submissionId, path: pathSegments } = await params;

  // Look up the submission's HTML artifact to get the base directory
  const artifact = await queryOne<{ file_path: string }>(
    `SELECT sa.file_path FROM submission_artifacts sa
     JOIN submissions s ON s.id = sa.submission_id
     WHERE sa.submission_id = $1::uuid AND sa.type = 'html'`,
    [submissionId]
  );

  if (!artifact) {
    return new NextResponse("Not found", { status: 404 });
  }

  // The file_path points to html/index.html, we need the directory
  const htmlDir = path.dirname(path.join(process.cwd(), UPLOAD_DIR, artifact.file_path));
  const requestedFile = pathSegments.length > 0
    ? path.join(htmlDir, ...pathSegments)
    : path.join(htmlDir, "index.html");

  // Prevent path traversal
  const resolvedPath = path.resolve(requestedFile);
  const resolvedDir = path.resolve(htmlDir);
  if (!resolvedPath.startsWith(resolvedDir)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const content = await fs.readFile(resolvedPath);
    const contentType = mime.lookup(resolvedPath) || "application/octet-stream";

    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Content-Security-Policy": "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; form-action 'none'; frame-ancestors 'self'",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
