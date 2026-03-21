import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';
import { promises as fs } from 'fs';
import path from 'path';
import { UPLOAD_DIR } from '@/lib/constants';

// PUT /api/submissions/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const update: Record<string, unknown> = {};
    const fields = [
      'is_published', 'manual_touched', 'manual_notes',
      'iteration_count', 'run_started_at', 'run_finished_at',
      'duration_ms', 'timing_method', 'prompt_snapshot', 'notes', 'metadata'
    ];
    for (const f of fields) {
      if (f in body) update[f] = body[f];
    }
    if (body.is_published === true) {
      update.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase.from('submissions').update(update).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

// DELETE /api/submissions/:id
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Get artifacts to delete files
  const { data: artifacts } = await supabase
    .from('submission_artifacts')
    .select('file_path')
    .eq('submission_id', id);

  // Delete files
  if (artifacts) {
    for (const a of artifacts) {
      const fullPath = path.join(UPLOAD_DIR, a.file_path);
      try { await fs.unlink(fullPath); } catch { /* file may not exist */ }
    }
  }

  const { error } = await supabase.from('submissions').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
