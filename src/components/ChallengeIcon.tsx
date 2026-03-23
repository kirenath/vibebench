"use client";

import { icons, type LucideProps } from "lucide-react";
import { FileCode2 } from "lucide-react";

interface ChallengeIconProps extends LucideProps {
  iconName?: string | null;
}

/**
 * Renders a lucide icon by name. Falls back to FileCode2 if the name is
 * invalid or not provided. Supports all 1500+ lucide icons.
 */
export default function ChallengeIcon({ iconName, ...props }: ChallengeIconProps) {
  if (!iconName) return <FileCode2 {...props} />;

  const Icon = icons[iconName as keyof typeof icons];
  if (!Icon) return <FileCode2 {...props} />;

  return <Icon {...props} />;
}

/** Curated list of commonly-used icons for the admin picker. */
export const PRESET_ICONS = [
  "FileCode2",
  "Clock",
  "Palette",
  "ShoppingCart",
  "Receipt",
  "MessageSquare",
  "Lock",
  "Shield",
  "Zap",
  "Timer",
  "Globe",
  "Gamepad2",
  "Music",
  "Image",
  "Calculator",
  "BookOpen",
  "Mail",
  "Bell",
  "Heart",
  "Star",
  "Map",
  "Camera",
  "Terminal",
  "Puzzle",
  "Layers",
  "Wand2",
  "PenTool",
] as const;
