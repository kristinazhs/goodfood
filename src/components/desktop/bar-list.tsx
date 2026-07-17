// horizontal bar breakdown (e.g. GMV by neighborhood/category)
export function BarList({
  data,
}: {
  data: { label: string; value: number; display: string }[];
}) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex flex-col gap-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="mb-1 flex items-baseline justify-between text-[12px]">
            <span className="font-semibold">{d.label}</span>
            <span className="font-bold text-brand-dark">{d.display}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-sage/60">
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
