import db from "@/lib/db";
import { success, internalError } from "@/lib/api-utils";

export async function GET() {
  try {
    const [challenges, variants, submissions] = await Promise.all([
      db.query(`SELECT count(*) as count FROM challenges WHERE is_published = true`),
      db.query(
        `SELECT count(DISTINCT mv.id) as count
         FROM model_variants mv
         JOIN submissions s ON s.model_variant_id = mv.id AND s.is_published = true`
      ),
      db.query(`SELECT count(*) as count FROM submissions WHERE is_published = true`),
    ]);

    return success({
      published_challenges: parseInt(challenges.rows[0].count),
      active_model_variants: parseInt(variants.rows[0].count),
      published_submissions: parseInt(submissions.rows[0].count),
    });
  } catch {
    return internalError();
  }
}
