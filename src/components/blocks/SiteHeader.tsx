import Link from "next/link";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { buildChallengeHref, buildCompareHref } from "@/lib/presentation/urls";
import styles from "./SiteHeader.module.css";

const comparePreviewHref = buildCompareHref({
  challengeId: "receipt",
  phaseKey: "phase1",
  entries: [
    "gpt-5.4-pro@web",
    "claude-sonnet-4@api",
    "gemini-2.5-pro@web"
  ]
});

export function SiteHeader() {
  return (
    <header className={styles.shell}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark} aria-hidden>
            VB
          </span>
          <span className={styles.brandCopy}>
            <strong>VibeBench</strong>
            <span>Organic / Natural display shell</span>
          </span>
        </Link>
        <nav aria-label="Primary navigation" className={styles.nav}>
          <Link href="/" className={styles.navLink}>
            首页
          </Link>
          <Link href={buildChallengeHref("receipt")} className={styles.navLink}>
            Challenge
          </Link>
          <Link href={comparePreviewHref} className={styles.navLink}>
            Compare
          </Link>
        </nav>
        <ButtonLink href={comparePreviewHref} variant="primary" size="sm">
          Preview Compare
        </ButtonLink>
      </div>
    </header>
  );
}
