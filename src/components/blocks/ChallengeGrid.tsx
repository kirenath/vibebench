import { ButtonLink } from "@/components/ui/ButtonLink";
import { OrganicSurface } from "@/components/ui/OrganicSurface";
import { Pill } from "@/components/ui/Pill";
import type { ChallengeSummary } from "@/lib/presentation/models";
import styles from "./ChallengeGrid.module.css";

type ChallengeGridProps = {
  items: ChallengeSummary[];
};

export function ChallengeGrid({ items }: ChallengeGridProps) {
  return (
    <div className={styles.grid}>
      {items.map((challenge) => (
        <OrganicSurface
          key={challenge.id}
          as="article"
          tone={challenge.tone}
          shape={challenge.shape}
          padding="lg"
          interactive
          className={styles.card}
        >
          <div className={styles.topline}>
            <Pill tone="sand">{challenge.phaseCountLabel}</Pill>
            <Pill tone="moss">{challenge.entryCountLabel}</Pill>
          </div>
          <h3 className={styles.title}>{challenge.title}</h3>
          <p className={styles.description}>{challenge.description}</p>
          <p className={styles.note}>{challenge.note}</p>
          <div className={styles.footer}>
            <span className={styles.updated}>最近更新时间 {challenge.updatedLabel}</span>
            <div className={styles.actions}>
              <ButtonLink href={challenge.href} variant="primary" size="sm">
                查看详情
              </ButtonLink>
              <ButtonLink href={challenge.compareHref} variant="ghost" size="sm">
                Compare
              </ButtonLink>
            </div>
          </div>
        </OrganicSurface>
      ))}
    </div>
  );
}
