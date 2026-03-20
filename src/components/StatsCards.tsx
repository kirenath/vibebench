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
    <div className="grid grid-cols-3 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="text-center p-6 rounded-xl bg-gradient-to-br from-brand-50 to-white border border-brand-100"
        >
          <p className="text-3xl font-bold text-brand-600">{item.value}</p>
          <p className="text-sm text-gray-500 mt-1">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
