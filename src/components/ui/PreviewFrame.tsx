import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/utils/classNames";
import styles from "./PreviewFrame.module.css";

type PreviewFrameProps = {
  title: string;
  subtitle: string;
  note: string;
  statusLabel: string;
  tone?: "paper" | "moss" | "clay" | "sand" | "stone";
  className?: string;
};

export function PreviewFrame({
  title,
  subtitle,
  note,
  statusLabel,
  tone = "paper",
  className
}: PreviewFrameProps) {
  return (
    <div className={cn(styles.root, styles[tone], className)}>
      <div className={styles.topline}>
        <Pill tone={tone === "clay" ? "clay" : tone === "sand" ? "sand" : "moss"}>
          {statusLabel}
        </Pill>
      </div>
      <div className={styles.frame}>
        <div className={styles.toolbar}>
          <span />
          <span />
          <span />
        </div>
        <div className={styles.canvas}>
          <div className={styles.sheet}>
            <div className={styles.sheetHeader}>
              <strong>{title}</strong>
              <span>{subtitle}</span>
            </div>
            <div className={styles.lines}>
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </div>
      <p className={styles.note}>{note}</p>
    </div>
  );
}
