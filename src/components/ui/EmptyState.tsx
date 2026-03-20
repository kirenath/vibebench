import { ButtonLink } from "@/components/ui/ButtonLink";
import { OrganicSurface } from "@/components/ui/OrganicSurface";
import styles from "./EmptyState.module.css";

type EmptyStateProps = {
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
};

export function EmptyState({
  title,
  description,
  primaryAction,
  secondaryAction
}: EmptyStateProps) {
  return (
    <OrganicSurface
      as="section"
      tone="stone"
      shape="bloom"
      padding="lg"
      className={styles.root}
    >
      <div className={styles.dot} aria-hidden />
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      <div className={styles.actions}>
        {primaryAction ? (
          <ButtonLink href={primaryAction.href} variant="primary">
            {primaryAction.label}
          </ButtonLink>
        ) : null}
        {secondaryAction ? (
          <ButtonLink href={secondaryAction.href} variant="ghost">
            {secondaryAction.label}
          </ButtonLink>
        ) : null}
      </div>
    </OrganicSurface>
  );
}
