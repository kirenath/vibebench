"use client";

import { buildShareCardData, type ShareCardInput } from "./share/types";
import { getShareStyleComponent } from "./share/registry";
import { DEFAULT_SHARE_STYLE, type ShareStyleId } from "@/lib/shareStyles";

export interface ShareCardProps extends ShareCardInput {
  styleId?: ShareStyleId;
}

// Style-agnostic entry point: derives the shared data once, then renders the
// chosen visual style from the registry. Callers never touch a style directly.
export default function ShareCard({
  styleId = DEFAULT_SHARE_STYLE,
  ...input
}: ShareCardProps) {
  const data = buildShareCardData(input);
  const Style = getShareStyleComponent(styleId);
  return <Style data={data} />;
}
