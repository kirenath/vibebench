// Pure (no React / no node deps) registry of share-card visual style IDs.
// Safe to import from both server (token signing, OG) and browser (modal).
// Adding a new visual style = add an id here + a label + register the
// component in `src/components/guess/share/registry.tsx`.

export type ShareStyleId =
  | "organ"
  | "terminal"
  | "aero"
  | "win95"
  | "bauhaus"
  | "news"
  | "sketch"
  | "vapor"
  | "glass"
  | "ink";

// Organic / Natural is the project's house style → the default share card.
export const DEFAULT_SHARE_STYLE: ShareStyleId = "organ";

// Display order in the style switcher (default leads).
export const SHARE_STYLE_IDS: ShareStyleId[] = [
  "organ",
  "terminal",
  "aero",
  "win95",
  "bauhaus",
  "news",
  "sketch",
  "vapor",
  "glass",
  "ink",
];

export const SHARE_STYLE_LABELS: Record<ShareStyleId, string> = {
  organ: "有机 Organic",
  terminal: "终端 Terminal",
  aero: "玻璃 Aero",
  win95: "复古 Win95",
  bauhaus: "包豪斯 Bauhaus",
  news: "报刊 News",
  sketch: "手绘 Sketch",
  vapor: "蒸汽波 Vapor",
  glass: "玻璃拟态 Glass",
  ink: "水墨 Ink",
};

export function isShareStyleId(value: unknown): value is ShareStyleId {
  return (
    typeof value === "string" &&
    (SHARE_STYLE_IDS as string[]).includes(value)
  );
}

export function normalizeShareStyle(value: unknown): ShareStyleId {
  return isShareStyleId(value) ? value : DEFAULT_SHARE_STYLE;
}
