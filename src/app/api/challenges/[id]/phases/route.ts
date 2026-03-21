import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

// GET /api/challenges/:id/phases
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from('challenge_phases')
    .select('*')
    .eq('challenge_id', id)
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/challenges/:id/phases
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { phase_key, phase_label, description, sort_order, is_default, metadata } = body;

    if (!phase_key || !phase_label) {
      return NextResponse.json({ error: 'phase_key 和 phase_label 必填' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('challenge_phases')
      .insert({
        challenge_id: id,
        phase_key,
        phase_label,
        description: description || null,
        sort_order: sort_order ?? 0,
        is_default: is_default || false,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}
