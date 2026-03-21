import supabase from '@/lib/db';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ChallengeDetailClient from './ChallengeDetailClient';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data: challenge } = await supabase.from('challenges').select('title, description').eq('id', id).single();
  if (!challenge) return { title: '赛题不存在 — VibeBench' };
  return {
    title: `${challenge.title} — VibeBench`,
    description: challenge.description || `VibeBench 赛题: ${challenge.title}`,
  };
}

export default async function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: challenge } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single();

  if (!challenge) notFound();

  const { data: phases } = await supabase
    .from('challenge_phases')
    .select('*')
    .eq('challenge_id', id)
    .order('sort_order', { ascending: true });

  const { data: submissions } = await supabase
    .from('submission_overview')
    .select('*')
    .eq('challenge_id', id)
    .eq('submission_is_published', true)
    .eq('challenge_is_published', true);

  const sandboxBaseUrl = process.env.SANDBOX_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return (
    <ChallengeDetailClient
      challenge={challenge}
      phases={phases || []}
      submissions={submissions || []}
      sandboxBaseUrl={sandboxBaseUrl}
    />
  );
}
