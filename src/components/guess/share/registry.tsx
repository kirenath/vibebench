import type { ComponentType } from "react";
import {
  SHARE_STYLE_IDS,
  SHARE_STYLE_LABELS,
  normalizeShareStyle,
  type ShareStyleId,
} from "@/lib/shareStyles";
import type { ShareStyleProps } from "./types";
import OrganicCard from "./styles/OrganicCard";
import TerminalCard from "./styles/TerminalCard";
import AeroCard from "./styles/AeroCard";
import Win95Card from "./styles/Win95Card";
import BauhausCard from "./styles/BauhausCard";
import NewsCard from "./styles/NewsCard";
import SketchCard from "./styles/SketchCard";
import VaporCard from "./styles/VaporCard";
import GlassCard from "./styles/GlassCard";
import InkCard from "./styles/InkCard";

interface ShareStyleEntry {
  Component: ComponentType<ShareStyleProps>;
  // `ready: false` → still a scaffold (XxxCard.tsx); the switcher marks it 制作中.
  // Flip to true once the style is actually implemented.
  ready: boolean;
}

// Each style has a dedicated component file in ./styles/. To finish a style:
// implement its XxxCard.tsx per the matching prd/share/*.md, then set ready: true.
const REGISTRY: Record<ShareStyleId, ShareStyleEntry> = {
  organ: { Component: OrganicCard, ready: true },
  terminal: { Component: TerminalCard, ready: true },
  aero: { Component: AeroCard, ready: true },
  win95: { Component: Win95Card, ready: true },
  bauhaus: { Component: BauhausCard, ready: true },
  news: { Component: NewsCard, ready: true },
  sketch: { Component: SketchCard, ready: true },
  vapor: { Component: VaporCard, ready: true },
  glass: { Component: GlassCard, ready: true },
  ink: { Component: InkCard, ready: true },
};

export function getShareStyleComponent(
  id: ShareStyleId
): ComponentType<ShareStyleProps> {
  return REGISTRY[normalizeShareStyle(id)].Component;
}

export interface ShareStyleListItem {
  id: ShareStyleId;
  label: string;
  ready: boolean;
}

// All styles in display order, with label + ready flag — drives the switcher.
export function getShareStyleList(): ShareStyleListItem[] {
  return SHARE_STYLE_IDS.map((id) => ({
    id,
    label: SHARE_STYLE_LABELS[id],
    ready: REGISTRY[id].ready,
  }));
}
