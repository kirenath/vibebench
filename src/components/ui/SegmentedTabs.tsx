import Link from "next/link";
import { cn } from "@/lib/utils/classNames";
import styles from "./SegmentedTabs.module.css";

type SegmentedTabItem = {
  key: string;
  label: string;
  description?: string;
  href: string;
  isActive: boolean;
};

type SegmentedTabsProps = {
  items: SegmentedTabItem[];
  ariaLabel: string;
  className?: string;
};

export function SegmentedTabs({
  items,
  ariaLabel,
  className
}: SegmentedTabsProps) {
  return (
    <nav aria-label={ariaLabel} className={cn(styles.root, className)}>
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          aria-current={item.isActive ? "page" : undefined}
          className={cn(styles.item, item.isActive && styles.active)}
        >
          <span className={styles.label}>{item.label}</span>
          {item.description ? (
            <span className={styles.description}>{item.description}</span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}
