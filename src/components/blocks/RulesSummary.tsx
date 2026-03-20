import { OrganicSurface } from "@/components/ui/OrganicSurface";
import type { RulePanelModel } from "@/lib/presentation/models";
import styles from "./RulesSummary.module.css";

type RulesSummaryProps = {
  panels: [RulePanelModel, RulePanelModel];
};

function renderContent(content: string) {
  const blocks = content.split(/\n{2,}/).filter((block) => block.trim().length > 0);

  return blocks.map((block) => {
    const lines = block.split("\n").filter((line) => line.trim().length > 0);

    if (lines.every((line) => line.trim().startsWith("- "))) {
      return (
        <ul key={block} className={styles.list}>
          {lines.map((line) => (
            <li key={line}>{line.trim().slice(2)}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={block} className={styles.paragraph}>
        {block}
      </p>
    );
  });
}

export function RulesSummary({ panels }: RulesSummaryProps) {
  return (
    <div className={styles.grid}>
      {panels.map((panel) => (
        <OrganicSurface
          key={panel.title}
          as="article"
          tone={panel.tone}
          shape="canopy"
          padding="lg"
          className={styles.card}
        >
          <p className={styles.eyebrow}>{panel.eyebrow}</p>
          <h3 className={styles.title}>{panel.title}</h3>
          <div className={styles.content}>{renderContent(panel.content)}</div>
        </OrganicSurface>
      ))}
    </div>
  );
}
