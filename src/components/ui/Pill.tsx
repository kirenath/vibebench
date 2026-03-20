import type { ReactNode } from "react";
import { cn } from "@/lib/utils/classNames";
import styles from "./Pill.module.css";

type PillProps = {
  children: ReactNode;
  tone?: "neutral" | "ok" | "warn" | "moss" | "clay" | "sand";
  className?: string;
};

export function Pill({
  children,
  tone = "neutral",
  className
}: PillProps) {
  return <span className={cn(styles.base, styles[tone], className)}>{children}</span>;
}
