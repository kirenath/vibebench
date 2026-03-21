"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createChallenge(formData: FormData) {
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  if (!id || !title) throw new Error("ID and Title are required");

  await sql`
    INSERT INTO challenges (id, title, description)
    VALUES (${id}, ${title}, ${description})
  `;

  // Create default phase
  await sql`
    INSERT INTO challenge_phases (challenge_id, phase_key, phase_label, is_default)
    VALUES (${id}, 'phase1', 'Phase 1', true)
  `;

  revalidatePath("/admin/challenges");
  revalidatePath("/");
}

export async function togglePublishChallenge(id: string, currentStatus: boolean) {
  await sql`
    UPDATE challenges 
    SET is_published = ${!currentStatus}, 
        published_at = ${!currentStatus ? sql`NOW()` : null}
    WHERE id = ${id}
  `;
  revalidatePath("/admin/challenges");
  revalidatePath("/");
}

export async function deleteChallenge(id: string) {
  await sql`DELETE FROM challenges WHERE id = ${id}`;
  revalidatePath("/admin/challenges");
  revalidatePath("/");
}
