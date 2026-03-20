import { notFound } from "next/navigation";
import db from "@/lib/db";
import ChallengeDetailClient from "./client";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { rows } = await db.query(`SELECT title, description FROM challenges WHERE id = $1 AND is_published = true`, [id]);
  if (rows.length === 0) return { title: "Not Found" };
  return {
    title: `${rows[0].title} - VibeBench`,
    description: rows[0].description || `Challenge: ${rows[0].title}`,
  };
}

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { rows: challengeRows } = await db.query(
    `SELECT * FROM challenges WHERE id = $1 AND is_published = true`,
    [id]
  );
  if (challengeRows.length === 0) notFound();
  const challenge = challengeRows[0];

  const { rows: phases } = await db.query(
    `SELECT * FROM challenge_phases WHERE challenge_id = $1 ORDER BY sort_order, phase_label`,
    [id]
  );

  const { rows: submissions } = await db.query(
    `SELECT * FROM submission_overview
     WHERE challenge_id = $1 AND submission_is_published = true
     ORDER BY phase_sort_order, model_variant_name, channel_name`,
    [id]
  );

  return (
    <ChallengeDetailClient
      challenge={challenge}
      phases={phases}
      submissions={submissions}
    />
  );
}
