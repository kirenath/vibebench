import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

// GET /api/model-families
export async function GET(request: NextRequest) {
  const vendorId = request.nextUrl.searchParams.get('vendor_id');
  let query = supabase.from('model_families').select('*').order('sort_order', { ascending: true });
  if (vendorId) query = query.eq('vendor_id', vendorId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/model-families
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, vendor_id, name, description, sort_order, metadata } = body;
    if (!id || !vendor_id || !name) {
      return NextResponse.json({ error: 'id, vendor_id 和 name 必填' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('model_families')
      .insert({ id, vendor_id, name, description: description || null, sort_order: sort_order ?? 0, metadata: metadata || {} })
      .select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}
