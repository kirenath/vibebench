import { ButtonLink } from "@/components/ui/ButtonLink";
import { OrganicSurface } from "@/components/ui/OrganicSurface";
import { Pill } from "@/components/ui/Pill";
import type { HomePageModel } from "@/lib/presentation/models";
import styles from "./HomeHero.module.css";

type HomeHeroProps = {
  hero: HomePageModel["hero"];
};

export function HomeHero({ hero }: HomeHeroProps) {
  return (
    <OrganicSurface as="section" tone="paper" shape="bloom" padding="lg" className={styles.hero}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>{hero.eyebrow}</p>
        <h1 className={styles.title}>{hero.title}</h1>
        <p className={styles.description}>{hero.description}</p>
        <div className={styles.pills}>
          {hero.pills.map((pill) => (
            <Pill key={pill.label} tone={pill.tone}>
              {pill.label}
            </Pill>
          ))}
        </div>
        <div className={styles.actions}>
          <ButtonLink href={hero.primaryCta.href} variant={hero.primaryCta.variant}>
            {hero.primaryCta.label}
          </ButtonLink>
          <ButtonLink href={hero.secondaryCta.href} variant={hero.secondaryCta.variant}>
            {hero.secondaryCta.label}
          </ButtonLink>
        </div>
      </div>
      <OrganicSurface as="aside" tone="sand" shape="river" padding="lg" className={styles.feature}>
        <p className={styles.featureLabel}>{hero.featuredLabel}</p>
        <h2 className={styles.featureValue}>{hero.featuredValue}</h2>
        <p className={styles.featureNote}>{hero.featuredNote}</p>
        <div className={styles.featureStrata} aria-hidden>
          <span />
          <span />
          <span />
        </div>
      </OrganicSurface>
      <div className={styles.blobOne} aria-hidden />
      <div className={styles.blobTwo} aria-hidden />
    </OrganicSurface>
  );
}
