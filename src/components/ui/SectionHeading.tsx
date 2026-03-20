import { cn } from "@/lib/utils/classNames";
import styles from "./SectionHeading.module.css";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  level?: 1 | 2 | 3;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  level = 2
}: SectionHeadingProps) {
  const HeadingTag = `h${level}` as "h1" | "h2" | "h3";

  return (
    <header className={cn(styles.root, styles[align], className)}>
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <HeadingTag className={styles.title}>{title}</HeadingTag>
      {description ? <p className={styles.description}>{description}</p> : null}
    </header>
  );
}
