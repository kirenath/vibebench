import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';
import { getAdminFromRequest } from '@/lib/auth';

// GET /api/submissions — list submissions
export async function GET(request: NextRequest) {
  const admin = await getAdminFromRequest(request);
  const sp = request.nextUrl.searchParams;

  let query = supabase
    .from('submission_overview')
    .select('*')
    .order('created_at', { ascending: false });

  // Filters
  const challengeId = sp.get('challenge_id');
  const phaseId = sp.get('phase_id');
  const modelVariantId = sp.get('model_variant_id');
  const channelId = sp.get('channel_id');

  if (challengeId) query = query.eq('challenge_id', challengeId);
  if (phaseId) query = query.eq('challenge_phase_id', phaseId);
  if (modelVariantId) query = query.eq('model_variant_id', modelVariantId);
  if (channelId) query = query.eq('channel_id', channelId);

  // Non-admin only sees published
  if (!admin) {
    query = query
      .eq('submission_is_published', true)
      .eq('challenge_is_published', true);
  }

  // Pagination
  const limit = parseInt(sp.get('limit') || '100', 10);
  const offset = parseInt(sp.get('offset') || '0', 10);
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// POST /api/submissions — create submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      challenge_phase_id, model_variant_id, channel_id,
      is_published, manual_touched, manual_notes,
      iteration_count, run_started_at, run_finished_at,
      duration_ms, timing_method, prompt_snapshot, notes, metadata
    } = body;

    if (!challenge_phase_id || !model_variant_id || !channel_id) {
      return NextResponse.json({ error: 'challenge_phase_id, model_variant_id, channel_id 必填' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('submissions')
      .insert({
        challenge_phase_id,
        model_variant_id,
        channel_id,
        is_published: is_published || false,
        manual_touched: manual_touched || false,
        manual_notes: manual_notes || null,
        iteration_count: iteration_count ?? null,
        run_started_at: run_started_at || null,
        run_finished_at: run_finished_at || null,
        duration_ms: duration_ms ?? null,
        timing_method: timing_method || null,
        prompt_snapshot: prompt_snapshot || null,
        notes: notes || null,
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
