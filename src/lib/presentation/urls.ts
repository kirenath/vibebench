type CompareHrefInput = {
  challengeId: string;
  phaseKey: string;
  entries: string[];
  focus?: string;
};

export const RECEIPT_COMPARE_DEFAULT_ENTRIES = [
  "gpt-5.4-pro@web",
  "claude-sonnet-4@api",
  "gemini-2.5-pro@web"
] as const;

export function buildChallengeHref(challengeId: string, phaseKey?: string) {
  const searchParams = new URLSearchParams();

  if (phaseKey) {
    searchParams.set("phase", phaseKey);
  }

  const query = searchParams.toString();
  return query.length > 0
    ? `/challenges/${challengeId}?${query}`
    : `/challenges/${challengeId}`;
}

export function buildCompareHref({
  challengeId,
  phaseKey,
  entries,
  focus
}: CompareHrefInput) {
  const searchParams = new URLSearchParams({
    challenge: challengeId,
    phase: phaseKey,
    entries: entries.join(",")
  });

  if (focus) {
    searchParams.set("focus", focus);
  }

  return `/compare?${searchParams.toString()}`;
}
