import { RulesSummary } from "@/components/blocks/RulesSummary";
import { SubmissionList } from "@/components/blocks/SubmissionList";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { OrganicSurface } from "@/components/ui/OrganicSurface";
import { Pill } from "@/components/ui/Pill";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { getChallengeDetailModel } from "@/lib/presentation/challengeRegistry";
import styles from "./page.module.css";

type ChallengePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    phase?: string | string[];
  }>;
};

function getSingleValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ChallengeDetailPage({
  params,
  searchParams
}: ChallengePageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const phaseKey = getSingleValue(resolvedSearchParams.phase);
  const model = getChallengeDetailModel(resolvedParams.id, phaseKey);

  if (model.status !== "ready" || !model.submissions || !model.rulesPanels) {
    return (
      <section className="pageSection">
        <div className="contentIntimate">
          <EmptyState
            title={model.emptyState?.title ?? model.title}
            description={model.emptyState?.description ?? model.description}
            primaryAction={model.emptyState?.cta}
            secondaryAction={model.emptyState?.secondaryCta}
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
            <div className={styles.heroHeader}>
              <SectionHeading
                eyebrow="Challenge Detail"
                title={model.title}
                description={model.description}
                level={1}
              />
              <div className={styles.heroPills}>
                {model.heroPills.map((pill) => (
                  <Pill key={pill.label} tone={pill.tone}>
                    {pill.label}
                  </Pill>
                ))}
              </div>
            </div>
            {model.intro ? <p className={styles.intro}>{model.intro}</p> : null}
            {model.phaseTabs.length > 0 ? (
              <SegmentedTabs
                items={model.phaseTabs}
                ariaLabel="Challenge phase tabs"
                className={styles.phaseTabs}
              />
            ) : null}
            {model.compareCta ? (
              <div className={styles.ctaRow}>
                <ButtonLink href={model.compareCta.href} variant={model.compareCta.variant}>
                  {model.compareCta.label}
                </ButtonLink>
              </div>
            ) : null}
          </OrganicSurface>
        </div>
      </section>

      {model.summaryItems && model.summaryItems.length > 0 ? (
        <section className="pageSection">
          <div className="contentFocused">
            <div className={styles.summaryGrid}>
              {model.summaryItems.map((item, index) => (
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
          <RulesSummary panels={model.rulesPanels} />
        </div>
      </section>

      <section className="pageSection">
        <div className="contentPrimary">
          <SectionHeading
            eyebrow={`Phase / ${model.activePhaseLabel ?? "Current"}`}
            title="当前 phase 的展示条目"
            description="这一层先强调信息结构、manual 标记、compare 跳转和 preview shell。真实 artifact 接入后，这批卡片不需要重写结构。"
            className={styles.sectionHeading}
          />
          {model.submissions.length > 0 ? (
            <SubmissionList submissions={model.submissions} />
          ) : (
            <EmptyState
              title="当前 phase 还没有可展示条目"
              description="展示层已经预留 submission 卡片结构，后续接入真实列表后会直接替换本地 seed。"
            />
          )}
        </div>
      </section>
    </>
  );
}
