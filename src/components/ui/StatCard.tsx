import { OrganicSurface } from "@/components/ui/OrganicSurface";
import { Pill } from "@/components/ui/Pill";
import styles from "./StatCard.module.css";

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: "paper" | "moss" | "clay" | "sand" | "stone";
};

export function StatCard({
  label,
  value,
  detail,
  tone = "paper"
}: StatCardProps) {
  return (
    <OrganicSurface as="article" tone={tone} shape="canopy" padding="lg" interactive>
      <div className={styles.header}>
        <Pill tone={tone === "clay" ? "clay" : tone === "sand" ? "sand" : "moss"}>
          {label}
        </Pill>
      </div>
      <p className={styles.value}>{value}</p>
      <p className={styles.detail}>{detail}</p>
    </OrganicSurface>
  );
}
