import { CompareMatrix } from "@/components/blocks/CompareMatrix";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { OrganicSurface } from "@/components/ui/OrganicSurface";
import { Pill } from "@/components/ui/Pill";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { getComparePageModel } from "@/lib/presentation/challengeRegistry";
import styles from "./page.module.css";

type ComparePageProps = {
  searchParams: Promise<{
    challenge?: string | string[];
    phase?: string | string[];
    entries?: string | string[];
    focus?: string | string[];
  }>;
};

function getSingleValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function parseEntryTokens(value?: string) {
  return value
    ? value
        .split(",")
        .map((token) => token.trim())
        .filter((token) => token.length > 0)
    : [];
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const resolvedSearchParams = await searchParams;
  const challengeId = getSingleValue(resolvedSearchParams.challenge);
  const phaseKey = getSingleValue(resolvedSearchParams.phase);
  const entries = parseEntryTokens(getSingleValue(resolvedSearchParams.entries));
  const focusToken = getSingleValue(resolvedSearchParams.focus);
  const model = getComparePageModel({
    challengeId,
    phaseKey,
    entryTokens: entries,
    focusToken
  });

  if (model.status !== "ready" || !model.entries || !model.phaseTabs) {
    return (
      <section className="pageSection">
        <div className="contentIntimate">
          <EmptyState
            title={model.errorState?.title ?? model.title}
            description={model.errorState?.description ?? model.description}
            primaryAction={model.errorState?.cta}
            secondaryAction={model.errorState?.secondaryCta}
          />
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="pageSection">
        <div className="contentFocused">
          <OrganicSurface
            as="section"
            tone="paper"
            shape="bloom"
            padding="lg"
            className={styles.heroSurface}
          >
            <div className={styles.heroTopline}>
              <SectionHeading
                eyebrow="Compare"
                title={model.title}
                description={model.description}
                level={1}
              />
              <div className={styles.heroPills}>
                {model.headerPills.map((pill) => (
                  <Pill key={pill.label} tone={pill.tone}>
                    {pill.label}
                  </Pill>
                ))}
              </div>
            </div>
            <SegmentedTabs
              items={model.phaseTabs}
              ariaLabel="Compare phase tabs"
              className={styles.phaseTabs}
            />
            <div className={styles.linkRow}>
              {model.challengeHref ? (
                <ButtonLink href={model.challengeHref} variant="ghost">
                  返回 challenge
                </ButtonLink>
              ) : null}
            </div>
          </OrganicSurface>
        </div>
      </section>

      {model.ruleSummary && model.ruleSummary.length > 0 ? (
        <section className="pageSection">
          <div className="contentFocused">
            <div className={styles.summaryGrid}>
              {model.ruleSummary.map((item, index) => (
                <OrganicSurface
                  key={item.label}
                  as="article"
                  tone={index === 1 ? "moss" : index === 2 ? "clay" : "sand"}
                  shape={index % 2 === 0 ? "canopy" : "pebble"}
                  padding="md"
                  className={styles.summaryCard}
                >
                  <p className={styles.summaryLabel}>{item.label}</p>
                  <p className={styles.summaryValue}>{item.value}</p>
                </OrganicSurface>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="pageSection">
        <div className="contentPrimary">
          <SectionHeading
            eyebrow={`Phase / ${model.activePhaseLabel ?? "Current"}`}
            title="响应式 compare 外壳"
            description="桌面端按 2 / 3 / 4 项切换分栏，移动端退化为单 panel + tabs。当前先放结构化 preview shell，不接 iframe。"
            className={styles.sectionHeading}
          />
          <CompareMatrix
            entries={model.entries}
            focusEntryId={model.focusEntryId ?? model.entries[0].token}
          />
        </div>
      </section>
    </>
  );
}
