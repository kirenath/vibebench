import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { jsonError } from "@/lib/api-helpers";
import { extractPhasePrompt } from "@/lib/phasePrompt";
import {
  signQuestion,
  type GuessDifficulty,
  type GuessOption,
} from "@/lib/guessToken";

export const dynamic = "force-dynamic";

const DIFFICULTIES: GuessDifficulty[] = ["easy", "medium", "hard"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface CorrectRow {
  submission_id: string;
  challenge_id: string;
  challenge_title: string;
  challenge_phase_id: string;
  phase_key: string;
  phase_label: string;
  model_variant_id: string;
  model_variant_name: string;
  model_family_id: string;
  model_family_name: string;
}

interface VariantCandidate {
  value: string;
  label: string;
  family: string;
}

const ELIGIBLE =
  "has_html and submission_is_published and challenge_is_published";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const difficulty = (sp.get("difficulty") || "medium") as GuessDifficulty;
  const excludeRaw = sp.get("exclude") || "";
  const exclude = excludeRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!DIFFICULTIES.includes(difficulty)) {
    return jsonError("Invalid difficulty", 400);
  }

  try {
    // ---- Step 1: pick a random eligible "correct" submission ----
    const hardFamilyFilter =
      difficulty === "hard"
        ? `and model_family_id in (
             select family_id from public.model_variants
             group by family_id having count(*) >= 4
           )`
        : "";

    const correct = await queryOne<CorrectRow>(
      `select submission_id, challenge_id, challenge_title, challenge_phase_id,
              phase_key, phase_label, model_variant_id, model_variant_name,
              model_family_id, model_family_name
       from public.submission_overview
       where ${ELIGIBLE}
         and not (submission_id = any($1::uuid[]))
         ${hardFamilyFilter}
       order by random()
       limit 1`,
      [exclude]
    );

    if (!correct) {
      return NextResponse.json({ success: true, completed: true, data: null });
    }

    // ---- Step 2: build options by difficulty ----
    let correctOption: GuessOption;
    let distractors: GuessOption[] = [];

    if (difficulty === "easy") {
      correctOption = {
        value: correct.model_family_id,
        label: correct.model_family_name,
      };
      const rows = await query<{ value: string; label: string }>(
        `select distinct model_family_id as value, model_family_name as label
         from public.submission_overview
         where ${ELIGIBLE} and model_family_id <> $1`,
        [correct.model_family_id]
      );
      distractors = shuffle(rows).slice(0, 3);
    } else if (difficulty === "hard") {
      correctOption = {
        value: correct.model_variant_id,
        label: correct.model_variant_name,
      };
      const rows = await query<{ value: string; label: string }>(
        `select id as value, name as label
         from public.model_variants
         where family_id = $1 and id <> $2
         order by random()
         limit 3`,
        [correct.model_family_id, correct.model_variant_id]
      );
      distractors = rows;
    } else {
      // medium: variants from different families, prefer same-phase participants
      correctOption = {
        value: correct.model_variant_id,
        label: correct.model_variant_name,
      };
      const samePhase = await query<VariantCandidate>(
        `select distinct model_variant_id as value, model_variant_name as label,
                model_family_id as family
         from public.submission_overview
         where ${ELIGIBLE}
           and challenge_phase_id = $1
           and model_family_id <> $2`,
        [correct.challenge_phase_id, correct.model_family_id]
      );
      const global = await query<VariantCandidate>(
        `select distinct model_variant_id as value, model_variant_name as label,
                model_family_id as family
         from public.submission_overview
         where ${ELIGIBLE} and model_family_id <> $1`,
        [correct.model_family_id]
      );

      const usedFamilies = new Set<string>([correct.model_family_id]);
      const picked: GuessOption[] = [];
      for (const cand of [...shuffle(samePhase), ...shuffle(global)]) {
        if (picked.length >= 3) break;
        if (usedFamilies.has(cand.family)) continue;
        usedFamilies.add(cand.family);
        picked.push({ value: cand.value, label: cand.label });
      }
      distractors = picked;
    }

    // Need a full set of 4 distinct options, else skip this question.
    if (distractors.length < 3) {
      return NextResponse.json({ success: true, completed: true, data: null });
    }

    const options = shuffle([correctOption, ...distractors]);

    // ---- Step 3: phase prompt + signed token ----
    const promptRow = await queryOne<{ prompt_markdown: string | null }>(
      "select prompt_markdown from public.challenges where id = $1",
      [correct.challenge_id]
    );
    const phasePrompt = extractPhasePrompt(
      promptRow?.prompt_markdown ?? null,
      correct.phase_key
    );

    const token = signQuestion({
      jti: crypto.randomUUID(),
      submission_id: correct.submission_id,
      challenge_phase_id: correct.challenge_phase_id,
      difficulty,
      options,
    });

    return NextResponse.json({
      success: true,
      data: {
        token,
        submission_id: correct.submission_id,
        challenge_title: correct.challenge_title,
        phase_label: correct.phase_label,
        phase_prompt: phasePrompt,
        difficulty,
        options,
      },
    });
  } catch (err: unknown) {
    return jsonError(err instanceof Error ? err.message : "Unknown error", 500);
  }
}
