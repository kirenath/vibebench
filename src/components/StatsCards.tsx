export default function StatsCards({
  stats,
}: {
  stats: { published_challenges: number; active_model_variants: number; published_submissions: number };
}) {
  const items = [
    { label: "Challenges", value: stats.published_challenges },
    { label: "Models", value: stats.active_model_variants },
    { label: "Submissions", value: stats.published_submissions },
  ];
  return (
    <div className="grid grid-cols-3 gap-6">
      {items.map((item) => (
        <div
          key={item.label}
          className="group text-center p-8 rounded-organic bg-organic-card border border-organic-border/50 shadow-soft hover:-translate-y-1 hover:shadow-soft-hover transition-all duration-300"
        >
          <p className="text-4xl font-bold font-heading text-organic-primary group-hover:scale-110 transition-transform duration-300">{item.value}</p>
          <p className="text-sm text-organic-muted-fg mt-2 font-medium">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
