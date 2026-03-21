import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';
import { promises as fs } from 'fs';
import path from 'path';
import { UPLOAD_DIR } from '@/lib/constants';

// GET /s/:submissionId/* — serve artifact files from sandbox domain
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ submissionId: string; path?: string[] }> }
) {
  const { submissionId, path: pathSegments } = await params;
  const requestedPath = pathSegments?.join('/') || 'index.html';

  // Find the submission and its artifacts
  const { data: artifacts } = await supabase
    .from('submission_artifacts')
    .select('file_path, type, mime_type')
    .eq('submission_id', submissionId);

  if (!artifacts || artifacts.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Find matching artifact by checking if the requested path matches
  let targetArtifact = artifacts.find(a => {
    const artifactFilePath = a.file_path.replace(/\\/g, '/');
    return artifactFilePath.endsWith(requestedPath) || requestedPath === 'index.html' && a.type === 'html';
  });

  // Default to HTML artifact
  if (!targetArtifact && (requestedPath === 'index.html' || requestedPath === '')) {
    targetArtifact = artifacts.find(a => a.type === 'html');
  }

  if (!targetArtifact) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const fullPath = path.join(process.cwd(), UPLOAD_DIR, targetArtifact.file_path);

  try {
    const fileBuffer = await fs.readFile(fullPath);
    const mimeType = targetArtifact.mime_type || getMimeType(requestedPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'ALLOWALL',
        'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; frame-ancestors *;",
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.html': 'text/html',
    '.htm': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.md': 'text/markdown',
    '.txt': 'text/plain',
  };
  return mimeMap[ext] || 'application/octet-stream';
}
