import { query } from "@/lib/db";
import { json } from "@/lib/api-helpers";

export async function GET() {
  const [challengeResult, modelResult, submissionResult] = await Promise.all([
    query<{ count: string }>(`SELECT COUNT(*) as count FROM challenges WHERE is_published = true`),
    query<{ count: string }>(
      `SELECT COUNT(DISTINCT s.model_variant_id) as count FROM submissions s WHERE s.is_published = true`
    ),
    query<{ count: string }>(`SELECT COUNT(*) as count FROM submissions WHERE is_published = true`),
  ]);

  return json({
    challenges: parseInt(challengeResult[0]?.count || "0"),
    models: parseInt(modelResult[0]?.count || "0"),
    submissions: parseInt(submissionResult[0]?.count || "0"),
  });
}
