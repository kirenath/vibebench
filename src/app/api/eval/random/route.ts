import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { jsonOk, jsonError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

function extractPhasePrompt(prompt: string | null, phaseKey: string | null): string | null {
  if (!prompt) return null;

  const codeFenceRegex = /^(`{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm;
  const fenceRanges: [number, number][] = [];
  let fenceMatch: RegExpExecArray | null;
  while ((fenceMatch = codeFenceRegex.exec(prompt)) !== null) {
    fenceRanges.push([
      fenceMatch.index,
      fenceMatch.index + fenceMatch[0].length,
    ]);
  }
  const isInsideFence = (pos: number) =>
    fenceRanges.some(([s, e]) => pos >= s && pos < e);

  const headingRegex = /^(#{1,6})\s+([^\n]+)$/gm;
  const headings: {
    level: number;
    title: string;
    index: number;
    fullMatchLen: number;
  }[] = [];
  let hMatch: RegExpExecArray | null;
  while ((hMatch = headingRegex.exec(prompt)) !== null) {
    if (!isInsideFence(hMatch.index)) {
      headings.push({
        level: hMatch[1].length,
        title: hMatch[2].trim(),
        index: hMatch.index,
        fullMatchLen: hMatch[0].length,
      });
    }
  }

  const sections: { title: string; content: string }[] = [];
  if (headings.length === 0) {
    const trimmed = prompt.trim();
    if (trimmed) sections.push({ title: "Prompt", content: trimmed });
  } else {
    const preContent = prompt.slice(0, headings[0].index).trim();
    if (preContent) sections.push({ title: "Prompt", content: preContent });
    for (let i = 0; i < headings.length; i++) {
      const contentStart = headings[i].index + headings[i].fullMatchLen;
      const contentEnd =
        i + 1 < headings.length ? headings[i + 1].index : prompt.length;
      const content = prompt.slice(contentStart, contentEnd).trim();
      sections.push({ title: headings[i].title, content });
    }
  }

  if (sections.length === 0) return null;

  type GroupItem =
    | {
        type: "single";
        section: (typeof sections)[0];
      }
    | {
        type: "group";
        groupTitle: string;
        children: {
          section: (typeof sections)[0];
        }[];
      };

  const grouped: GroupItem[] = [];
  const phaseStepRegex = /^(phase\d+)\s+step\s*\d+/i;

  let i = 0;
  while (i < sections.length) {
    const match = sections[i].title.match(phaseStepRegex);
    if (match) {
      const prefix = match[1].toLowerCase();
      const children: { section: (typeof sections)[0] }[] = [];
      while (i < sections.length) {
        const m = sections[i].title.match(phaseStepRegex);
        if (m && m[1].toLowerCase() === prefix) {
          children.push({ section: sections[i] });
          i++;
        } else break;
      }
      if (children.length > 1) {
        grouped.push({
          type: "group",
          groupTitle: prefix,
          children,
        });
      } else {
        grouped.push({
          type: "single",
          section: children[0].section,
        });
      }
    } else {
      grouped.push({
        type: "single",
        section: sections[i],
      });
      i++;
    }
  }

  const targetPhase = phaseKey?.trim().toLowerCase() || null;
  const phaseTitleRegex = /^(phase\d+)(?=$|\s|[：:（(])/i;
  const hasPhaseSections = sections.some((section) =>
    phaseTitleRegex.test(section.title)
  );

  if (!targetPhase || !hasPhaseSections) return prompt.trim();

  for (const item of grouped) {
    if (item.type === "group" && item.groupTitle === targetPhase) {
      return item.children
        .map(({ section }) => `### ${section.title}\n\n${section.content}`.trim())
        .join("\n\n");
    }

    if (item.type === "single") {
      const match = item.section.title.match(phaseTitleRegex);
      if (match?.[1].toLowerCase() === targetPhase) {
        return item.section.content.trim();
      }
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const challengeId = searchParams.get("challenge");
  const phaseKey = searchParams.get("phase");

  const voterToken = request.headers.get("x-voter-token") || "";

  try {
    const params: any[] = [voterToken];
    let phaseFilter = "";

    if (challengeId) {
      params.push(challengeId);
      phaseFilter += ` AND challenge_id = $${params.length}`;
    }
    if (phaseKey) {
      params.push(phaseKey);
      phaseFilter += ` AND phase_key = $${params.length}`;
    }

    const sql = `
      WITH EligiblePhases AS (
        SELECT challenge_phase_id
        FROM public.submission_overview
        WHERE has_html = true AND submission_is_published = true AND challenge_is_published = true
        ${phaseFilter}
        GROUP BY challenge_phase_id
        HAVING COUNT(DISTINCT model_variant_id) >= 2
      ),
      UnvotedPhases AS (
        SELECT challenge_phase_id
        FROM EligiblePhases ep
        WHERE NOT EXISTS (
          SELECT 1 FROM public.eval_votes v
          WHERE v.voter_token = $1
            AND v.challenge_phase_id = ep.challenge_phase_id
        )
      ),
      SelectedPhase AS (
        SELECT challenge_phase_id
        FROM UnvotedPhases
        ORDER BY random()
        LIMIT 1
      ),
      PhaseSubmissions AS (
        SELECT *
        FROM public.submission_overview
        WHERE challenge_phase_id = (SELECT challenge_phase_id FROM SelectedPhase)
          AND has_html = true AND submission_is_published = true AND challenge_is_published = true
      ),
      LeftSub AS (
        SELECT * FROM PhaseSubmissions ORDER BY random() LIMIT 1
      ),
      RightSub AS (
        SELECT * FROM PhaseSubmissions 
        WHERE model_variant_id != (SELECT model_variant_id FROM LeftSub)
        ORDER BY (vendor_id != (SELECT vendor_id FROM LeftSub)) DESC, random()
        LIMIT 1
      )
      SELECT * FROM LeftSub
      UNION ALL
      SELECT * FROM RightSub;
    `;

    const rows = await query(sql, params);

    if (rows.length < 2) {
      return NextResponse.json({ success: true, completed: true, data: null });
    }

    // Randomize left and right for the client to prevent bias
    const isLeftFirst = Math.random() > 0.5;
    const leftSub = isLeftFirst ? rows[0] : rows[1];
    const rightSub = isLeftFirst ? rows[1] : rows[0];

    const promptRows = await query(
      "SELECT prompt_markdown FROM public.challenges WHERE id = $1",
      [leftSub.challenge_id]
    );
    const phasePrompt = extractPhasePrompt(
      promptRows[0]?.prompt_markdown ?? null,
      leftSub.phase_key
    );

    // Build the response without revealing model identities
    const responseData = {
      challenge_phase_id: leftSub.challenge_phase_id,
      challenge_title: leftSub.challenge_title,
      phase_label: leftSub.phase_label,
      phase_prompt: phasePrompt,
      left: {
        submission_id: leftSub.submission_id,
      },
      right: {
        submission_id: rightSub.submission_id,
      }
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      error: null
    });
  } catch (err: any) {
    return jsonError(err.message, 500);
  }
}
