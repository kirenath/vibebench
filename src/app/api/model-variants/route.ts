import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export async function GET(request: NextRequest) {
  const familyId = request.nextUrl.searchParams.get('family_id');
  let query = supabase.from('model_variants').select('*').order('sort_order', { ascending: true });
  if (familyId) query = query.eq('family_id', familyId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, family_id, name, description, sort_order, metadata } = body;
    if (!id || !family_id || !name) {
      return NextResponse.json({ error: 'id, family_id 和 name 必填' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('model_variants')
      .insert({ id, family_id, name, description: description || null, sort_order: sort_order ?? 0, metadata: metadata || {} })
      .select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}
