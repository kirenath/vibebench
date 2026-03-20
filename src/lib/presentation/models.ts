export type SurfaceTone = "paper" | "moss" | "clay" | "sand" | "stone";

export type SurfaceShape =
  | "standard"
  | "river"
  | "petal"
  | "canopy"
  | "pebble"
  | "bloom";

export type ButtonVariant = "primary" | "outline" | "ghost";

export type PillTone = "neutral" | "ok" | "warn" | "moss" | "clay" | "sand";

export type CtaLink = {
  label: string;
  href: string;
  ariaLabel?: string;
  variant?: ButtonVariant;
};

export type StatusPill = {
  label: string;
  tone: PillTone;
};

export type ChallengeSummary = {
  id: string;
  title: string;
  description: string;
  updatedLabel: string;
  href: string;
  compareHref: string;
  phaseCountLabel: string;
  entryCountLabel: string;
  tone: SurfaceTone;
  shape: SurfaceShape;
  note: string;
};

export type HomePageModel = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: CtaLink;
    secondaryCta: CtaLink;
    pills: StatusPill[];
    featuredLabel: string;
    featuredValue: string;
    featuredNote: string;
  };
  stats: Array<{
    label: string;
    value: string;
    detail: string;
    tone: SurfaceTone;
  }>;
  challenges: ChallengeSummary[];
  challengeEmptyState?: {
    title: string;
    description: string;
    cta: CtaLink;
    secondaryCta?: CtaLink;
  };
  foundation: {
    title: string;
    description: string;
    pills: StatusPill[];
    missingEnvKeys: string[];
    connectionMessage: string;
    appUrl: string;
    apiLinks: CtaLink[];
  };
};

export type PhaseOption = {
  key: string;
  label: string;
  description: string;
  href: string;
  isActive: boolean;
};

export type RulePanelModel = {
  eyebrow: string;
  title: string;
  content: string;
  tone: SurfaceTone;
};

export type SubmissionCardModel = {
  id: string;
  token: string;
  modelName: string;
  vendorName: string;
  channelName: string;
  statusLabel: string;
  statusTone: PillTone;
  manualTouched: boolean;
  updatedLabel: string;
  summary: string;
  previewTitle: string;
  previewNote: string;
  compareHref: string;
  metrics: Array<{
    label: string;
    value: string;
  }>;
  hasHtml: boolean;
};

export type ChallengeDetailModel = {
  status: "ready" | "unavailable";
  title: string;
  description: string;
  heroPills: StatusPill[];
  phaseTabs: PhaseOption[];
  activePhaseLabel?: string;
  intro?: string;
  rulesPanels?: [RulePanelModel, RulePanelModel];
  summaryItems?: Array<{
    label: string;
    value: string;
  }>;
  submissions?: SubmissionCardModel[];
  compareCta?: CtaLink;
  emptyState?: {
    title: string;
    description: string;
    cta?: CtaLink;
    secondaryCta?: CtaLink;
  };
};

export type CompareEntryModel = {
  id: string;
  token: string;
  modelName: string;
  vendorName: string;
  channelName: string;
  manualTouched: boolean;
  note: string;
  previewTitle: string;
  previewNote: string;
  tone: SurfaceTone;
  statusLabel: string;
  focusHref: string;
};

export type ComparePageModel = {
  status: "ready" | "unavailable";
  title: string;
  description: string;
  headerPills: StatusPill[];
  challengeHref?: string;
  challengeTitle?: string;
  phaseTabs?: PhaseOption[];
  activePhaseLabel?: string;
  ruleSummary?: Array<{
    label: string;
    value: string;
  }>;
  entries?: CompareEntryModel[];
  focusEntryId?: string;
  errorState?: {
    title: string;
    description: string;
    cta?: CtaLink;
    secondaryCta?: CtaLink;
  };
};
