export function StatCard({
  value,
  label,
  trend,
  trendGood = true,
  hero = false,
}: {
  value: string;
  label: string;
  trend?: string;
  trendGood?: boolean;
  hero?: boolean;
}) {
  if (hero) {
    return (
      <div className="relative overflow-hidden rounded-[18px] bg-brand px-5 pb-4 pt-[18px]">
        <span className="absolute -right-6 -top-6 h-[72px] w-[72px] rounded-full bg-white/[0.06]" />
        <div className="relative z-[2] font-display text-[26px] font-bold text-white">
          {value}
        </div>
        <div className="relative z-[2] mt-0.5 text-[11.5px] text-mint">
          {label}
        </div>
        {trend ? (
          <div
            className={`relative z-[2] mt-2 text-[11.5px] font-bold ${
              trendGood ? "text-[#BFE3CC]" : "text-[#F5C9B8]"
            }`}
          >
            {trend}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-[18px] border-[1.5px] border-sage-line bg-white px-5 pb-4 pt-[18px]">
      <div className="font-display text-[26px] font-bold">{value}</div>
      <div className="mt-0.5 text-[11.5px] text-muted">{label}</div>
      {trend ? (
        <div
          className={`mt-2 text-[11.5px] font-bold ${
            trendGood ? "text-brand-dark" : "text-alert"
          }`}
        >
          {trend}
        </div>
      ) : null}
    </div>
  );
}
