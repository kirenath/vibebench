import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

// GET /api/challenges/:id — challenge detail
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: '赛题不存在' }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PUT /api/challenges/:id — update challenge
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const update: Record<string, unknown> = {};

    const fields = ['title', 'description', 'rules_markdown', 'prompt_markdown', 'cover_image', 'is_published', 'sort_order', 'metadata'];
    for (const f of fields) {
      if (f in body) update[f] = body[f];
    }

    if (body.is_published === true) {
      update.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('challenges')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

// DELETE /api/challenges/:id
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { error } = await supabase
    .from('challenges')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
