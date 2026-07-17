import type { SeriesPoint } from "@/lib/admin-mock-data";

export function BarChart({
  data,
  height = 140,
}: {
  data: SeriesPoint[];
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d) => (
        <div
          key={d.label}
          className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
          title={`${d.label}: ${d.value}`}
        >
          <div
            className={`w-full rounded-t-[5px] rounded-b-[2px] ${
              d.value === max ? "bg-brand" : "bg-sage"
            }`}
            style={{ height: `${Math.max((d.value / max) * 100, 4)}%` }}
          />
          <span className="text-[9.5px] font-semibold text-muted">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}
