import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';
import { getAdminFromRequest } from '@/lib/auth';

// GET /api/challenges — list challenges
export async function GET(request: NextRequest) {
  const admin = await getAdminFromRequest(request);
  const showAll = admin && request.nextUrl.searchParams.get('all') === 'true';

  let query = supabase
    .from('challenges')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (!showAll) {
    query = query.eq('is_published', true);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// POST /api/challenges — create challenge
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, rules_markdown, prompt_markdown, cover_image, is_published, sort_order, metadata } = body;

    if (!id || !title) {
      return NextResponse.json({ error: 'id 和 title 必填' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('challenges')
      .insert({
        id,
        title,
        description: description || null,
        rules_markdown: rules_markdown || null,
        prompt_markdown: prompt_markdown || null,
        cover_image: cover_image || null,
        is_published: is_published || false,
        sort_order: sort_order ?? 0,
        metadata: metadata || {},
        published_at: is_published ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}
