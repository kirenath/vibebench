import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';
import { promises as fs } from 'fs';
import path from 'path';
import { UPLOAD_DIR } from '@/lib/constants';

// DELETE /api/submissions/:id/artifacts/:type
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; type: string }> }
) {
  const { id: submissionId, type: artifactType } = await params;

  // Get artifact for file path
  const { data: artifact } = await supabase
    .from('submission_artifacts')
    .select('file_path')
    .eq('submission_id', submissionId)
    .eq('type', artifactType)
    .single();

  if (!artifact) {
    return NextResponse.json({ error: 'Artifact 不存在' }, { status: 404 });
  }

  // Delete file
  const fullPath = path.join(UPLOAD_DIR, artifact.file_path);
  try { await fs.unlink(fullPath); } catch { /* ok */ }

  // Delete record
  const { error } = await supabase
    .from('submission_artifacts')
    .delete()
    .eq('submission_id', submissionId)
    .eq('type', artifactType);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
