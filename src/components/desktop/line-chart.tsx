import type { SeriesPoint } from "@/lib/admin-mock-data";

// simple SVG line chart in the mockup's visual language (no chart lib)
export function LineChart({ data }: { data: SeriesPoint[] }) {
  const w = 900;
  const h = 170;
  const pad = 8;
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;
  const x = (i: number) => pad + (i / (data.length - 1)) * (w - pad * 2);
  const y = (v: number) => pad + (1 - (v - min) / range) * (h - pad * 2 - 18);
  const points = data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ");
  const area = `${pad},${h - 18} ${points} ${w - pad},${h - 18}`;

  return (
    <div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label="Gráfico de linha"
        className="block h-auto w-full"
      >
        <polygon points={area} fill="#E4EDE3" opacity="0.65" />
        <polyline
          points={points}
          fill="none"
          stroke="#1A6B3A"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {data.map((d, i) => (
          <circle
            key={d.label}
            cx={x(i)}
            cy={y(d.value)}
            r="3.5"
            fill="#FFFFFF"
            stroke="#1A6B3A"
            strokeWidth="2"
          >
            <title>{`${d.label}: ${d.value}`}</title>
          </circle>
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[9.5px] font-semibold text-muted">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}
