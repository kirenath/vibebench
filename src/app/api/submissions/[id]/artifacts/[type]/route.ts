import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { jsonError } from "@/lib/api-helpers";
import { ARTIFACT_TYPES } from "@/lib/constants";
import fs from "fs/promises";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; type: string }> }
) {
  const { id, type } = await params;

  if (!ARTIFACT_TYPES.includes(type as (typeof ARTIFACT_TYPES)[number])) {
    return jsonError("Invalid artifact type", 400);
  }

  try {
    const artifact = await queryOne<{
      file_path: string;
      file_name: string;
      mime_type: string;
    }>(
      `SELECT sa.file_path, sa.file_name, sa.mime_type
       FROM submission_artifacts sa
       JOIN submissions s ON s.id = sa.submission_id
       WHERE sa.submission_id = $1 AND sa.type = $2`,
      [id, type]
    );

    if (!artifact) {
      return jsonError("Artifact not found", 404);
    }

    const buffer = await fs.readFile(artifact.file_path);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": artifact.mime_type || "application/octet-stream",
        "Content-Disposition": `inline; filename="${artifact.file_name}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e) {
    return jsonError("Failed to read artifact: " + (e as Error).message, 500);
  }
}
