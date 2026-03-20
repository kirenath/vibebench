import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/classNames";
import styles from "./ButtonLink.module.css";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
};

export function ButtonLink({
  href,
  children,
  ariaLabel,
  className,
  variant = "primary",
  size = "md"
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(styles.base, styles[variant], styles[size], className)}
    >
      {children}
    </Link>
  );
}
