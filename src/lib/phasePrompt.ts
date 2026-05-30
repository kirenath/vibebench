/**
 * Extract the prompt text for a specific phase out of a challenge's full
 * prompt markdown. Shared by /eval and /guess.
 *
 * The markdown may contain multiple phases (PhaseN ...) and grouped
 * "PhaseN Step M" sections. When a phaseKey is given and the markdown has
 * phase sections, only the matching phase's content is returned; otherwise the
 * full prompt is returned.
 */
export function extractPhasePrompt(
  prompt: string | null,
  phaseKey: string | null
): string | null {
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
