import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { readArtifactFile, getMimeType } from "@/lib/upload";
import { join, normalize, dirname } from "path";
import { UPLOAD_DIR } from "@/lib/constants";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ submissionId: string; path: string[] }> }
) {
  try {
    const { submissionId, path: pathSegments } = await params;

    const artifact = await db.query(
      `SELECT file_path FROM submission_artifacts WHERE submission_id = $1 AND type = 'html'`,
      [submissionId]
    );
    if (artifact.rows.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const baseDir = dirname(artifact.rows[0].file_path);
    const requestedPath = pathSegments?.length ? pathSegments.join("/") : "index.html";
    const fullPath = normalize(join(baseDir, requestedPath));

    if (!fullPath.startsWith(normalize(UPLOAD_DIR))) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const content = await readArtifactFile(fullPath);
    if (!content) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const mime = getMimeType(fullPath);
    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": mime,
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
