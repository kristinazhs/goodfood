export type BadgeTone = "green" | "blue" | "grey" | "red" | "amber";

const tones: Record<BadgeTone, string> = {
  green: "bg-sage text-brand-dark",
  blue: "bg-[#E5EEF8] text-[#1D5A96]",
  grey: "bg-[#EFEDE6] text-muted",
  red: "bg-alert-bg text-alert",
  amber: "bg-amber-bg text-[#8a6a14]",
};

export function StatusBadge({
  tone,
  children,
}: {
  tone: BadgeTone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.3px] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
