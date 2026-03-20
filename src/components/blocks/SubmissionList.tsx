import { ButtonLink } from "@/components/ui/ButtonLink";
import { OrganicSurface } from "@/components/ui/OrganicSurface";
import { Pill } from "@/components/ui/Pill";
import { PreviewFrame } from "@/components/ui/PreviewFrame";
import type { SubmissionCardModel } from "@/lib/presentation/models";
import styles from "./SubmissionList.module.css";

type SubmissionListProps = {
  submissions: SubmissionCardModel[];
};

export function SubmissionList({ submissions }: SubmissionListProps) {
  return (
    <div className={styles.grid}>
      {submissions.map((submission, index) => (
        <OrganicSurface
          key={submission.id}
          as="article"
          tone={index % 3 === 1 ? "sand" : index % 3 === 2 ? "stone" : "paper"}
          shape={index % 2 === 0 ? "canopy" : "pebble"}
          padding="lg"
          interactive
          className={styles.card}
        >
          <div className={styles.topline}>
            <div className={styles.pills}>
              <Pill tone={submission.statusTone}>{submission.statusLabel}</Pill>
              <Pill tone="sand">{submission.channelName}</Pill>
              {submission.manualTouched ? <Pill tone="clay">Manual touched</Pill> : null}
            </div>
            <span className={styles.updated}>{submission.updatedLabel}</span>
          </div>
          <div className={styles.header}>
            <div>
              <h3 className={styles.title}>{submission.modelName}</h3>
              <p className={styles.vendor}>{submission.vendorName}</p>
            </div>
            <code className={styles.token}>{submission.token}</code>
          </div>
          <p className={styles.summary}>{submission.summary}</p>
          <PreviewFrame
            title={submission.previewTitle}
            subtitle={submission.modelName}
            note={submission.previewNote}
            statusLabel={submission.hasHtml ? "HTML ready" : "Waiting for artifact"}
            tone={submission.hasHtml ? "paper" : "stone"}
          />
          <dl className={styles.metrics}>
            {submission.metrics.map((metric) => (
              <div key={metric.label} className={styles.metric}>
                <dt>{metric.label}</dt>
                <dd>{metric.value}</dd>
              </div>
            ))}
          </dl>
          <div className={styles.actions}>
            <ButtonLink href={submission.compareHref} variant="primary" size="sm">
              打开 compare
            </ButtonLink>
          </div>
        </OrganicSurface>
      ))}
    </div>
  );
}
