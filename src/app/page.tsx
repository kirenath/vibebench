import { ChallengeGrid } from "@/components/blocks/ChallengeGrid";
import { HomeHero } from "@/components/blocks/HomeHero";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { OrganicSurface } from "@/components/ui/OrganicSurface";
import { Pill } from "@/components/ui/Pill";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatCard } from "@/components/ui/StatCard";
import { getMissingServerEnvKeys, publicEnv } from "@/lib/env";
import { mapBootstrapStatsToHomePageModel } from "@/lib/presentation/home";
import { getBootstrapStats } from "@/lib/queries/bootstrap";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const missingEnvKeys = getMissingServerEnvKeys();
  const stats = await getBootstrapStats();
  const model = mapBootstrapStatsToHomePageModel({
    stats,
    missingEnvKeys,
    appUrl: publicEnv.appUrl
  });

  return (
    <>
      <section className="pageSection">
        <div className="contentPrimary">
          <HomeHero hero={model.hero} />
        </div>
      </section>

      <section className="pageSection">
        <div className="contentPrimary">
          <div className={styles.statsGrid}>
            {model.stats.map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                detail={stat.detail}
                tone={stat.tone}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="pageSection">
        <div className="contentPrimary">
          <SectionHeading
            eyebrow="Published Challenges"
            title="把 challenge 列表变成可长期扩展的展示入口。"
            description="首页继续只吃当前最小 Supabase 列表查询。缺失的视觉字段统一由 presentation mapper 和 seed metadata 兜底，不把数据层拖进这次重构。"
            className={styles.sectionHeading}
          />
          {model.challenges.length > 0 && model.challenges ? (
            <ChallengeGrid items={model.challenges} />
          ) : model.challengeEmptyState ? (
            <EmptyState
              title={model.challengeEmptyState.title}
              description={model.challengeEmptyState.description}
              primaryAction={model.challengeEmptyState.cta}
              secondaryAction={model.challengeEmptyState.secondaryCta}
            />
          ) : null}
        </div>
      </section>

      <section className="pageSection">
        <div className="contentPrimary">
          <div className={styles.foundationGrid}>
            <OrganicSurface
              as="article"
              tone="stone"
              shape="canopy"
              padding="lg"
              className={styles.foundationCard}
            >
              <div className={styles.foundationPills}>
                {model.foundation.pills.map((pill) => (
                  <Pill key={pill.label} tone={pill.tone}>
                    {pill.label}
                  </Pill>
                ))}
              </div>
              <h2 className={styles.foundationTitle}>{model.foundation.title}</h2>
              <p className={styles.foundationText}>{model.foundation.description}</p>
              <p className={styles.foundationText}>{model.foundation.connectionMessage}</p>
              {model.foundation.missingEnvKeys.length > 0 ? (
                <ul className={styles.foundationList}>
                  {model.foundation.missingEnvKeys.map((key) => (
                    <li key={key}>
                      <code>{key}</code>
                    </li>
                  ))}
                </ul>
              ) : null}
            </OrganicSurface>

            <OrganicSurface
              as="article"
              tone="sand"
              shape="river"
              padding="lg"
              className={styles.foundationCard}
            >
              <h2 className={styles.foundationTitle}>Runtime touchpoints</h2>
              <p className={styles.foundationText}>
                保留运行时观测位，方便继续验证现有服务端读取和 API 路由。
              </p>
              <p className={styles.appUrl}>
                App URL
                <br />
                <strong>{model.foundation.appUrl}</strong>
              </p>
              <div className={styles.apiRow}>
                {model.foundation.apiLinks.map((link) => (
                  <ButtonLink
                    key={link.href}
                    href={link.href}
                    variant={link.variant}
                    ariaLabel={link.ariaLabel}
                  >
                    {link.label}
                  </ButtonLink>
                ))}
              </div>
            </OrganicSurface>
          </div>
        </div>
      </section>
    </>
  );
}
