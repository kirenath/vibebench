import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export async function GET() {
  const { data, error } = await supabase.from('channels').select('*').order('sort_order', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, sort_order, metadata } = body;
    if (!id || !name) {
      return NextResponse.json({ error: 'id 和 name 必填' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('channels')
      .insert({ id, name, description: description || null, sort_order: sort_order ?? 0, metadata: metadata || {} })
      .select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}
