import { createElement, type ReactNode } from "react";
import { cn } from "@/lib/utils/classNames";
import styles from "./OrganicSurface.module.css";

type OrganicSurfaceElement = "article" | "aside" | "div" | "header" | "nav" | "section";

type OrganicSurfaceProps = {
  children: ReactNode;
  as?: OrganicSurfaceElement;
  className?: string;
  tone?: "paper" | "moss" | "clay" | "sand" | "stone";
  shape?: "standard" | "river" | "petal" | "canopy" | "pebble" | "bloom";
  padding?: "sm" | "md" | "lg";
  interactive?: boolean;
};

export function OrganicSurface({
  children,
  as = "div",
  className,
  tone = "paper",
  shape = "standard",
  padding = "md",
  interactive = false
}: OrganicSurfaceProps) {
  return createElement(
    as,
    {
      className: cn(
        styles.surface,
        styles[tone],
        styles[shape],
        styles[padding],
        interactive && styles.interactive,
        className
      )
    },
    children
  );
}
