import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const update: Record<string, unknown> = {};
    for (const f of ['family_id', 'name', 'description', 'sort_order', 'metadata']) {
      if (f in body) update[f] = body[f];
    }
    const { data, error } = await supabase.from('model_variants').update(update).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabase.from('model_variants').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
