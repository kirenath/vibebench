import { OrganicSurface } from "@/components/ui/OrganicSurface";
import { Pill } from "@/components/ui/Pill";
import { PreviewFrame } from "@/components/ui/PreviewFrame";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import type { CompareEntryModel } from "@/lib/presentation/models";
import { cn } from "@/lib/utils/classNames";
import styles from "./CompareMatrix.module.css";

type CompareMatrixProps = {
  entries: CompareEntryModel[];
  focusEntryId: string;
};

export function CompareMatrix({ entries, focusEntryId }: CompareMatrixProps) {
  return (
    <div className={styles.root}>
      <div className={styles.mobileTabs}>
        <SegmentedTabs
          ariaLabel="Compare entry tabs"
          items={entries.map((entry) => ({
            key: entry.id,
            label: entry.modelName,
            description: entry.channelName,
            href: entry.focusHref,
            isActive: entry.token === focusEntryId
          }))}
        />
      </div>
      <div
        className={cn(
          styles.grid,
          entries.length === 2 && styles.countTwo,
          entries.length === 3 && styles.countThree,
          entries.length === 4 && styles.countFour
        )}
      >
        {entries.map((entry) => (
          <OrganicSurface
            key={entry.id}
            as="article"
            tone={entry.tone}
            shape="river"
            padding="lg"
            className={cn(
              styles.card,
              entry.token !== focusEntryId && styles.mobileHidden
            )}
          >
            <div className={styles.header}>
              <div className={styles.pills}>
                <Pill tone="sand">{entry.channelName}</Pill>
                {entry.manualTouched ? <Pill tone="clay">Manual touched</Pill> : null}
              </div>
              <span className={styles.status}>{entry.statusLabel}</span>
            </div>
            <div className={styles.titleWrap}>
              <h3 className={styles.title}>{entry.modelName}</h3>
              <p className={styles.vendor}>{entry.vendorName}</p>
            </div>
            <PreviewFrame
              title={entry.previewTitle}
              subtitle={entry.modelName}
              note={entry.previewNote}
              statusLabel="Preview shell"
              tone={entry.tone}
            />
            <p className={styles.note}>{entry.note}</p>
          </OrganicSurface>
        ))}
      </div>
    </div>
  );
}
