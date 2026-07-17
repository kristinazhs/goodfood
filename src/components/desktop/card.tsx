export function Card({
  title,
  subtitle,
  actions,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[18px] border-[1.5px] border-sage-line bg-white p-5 ${className}`}
    >
      {title ? (
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <div>
            <h2 className="font-display text-[15.5px] font-semibold">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-0.5 text-[11px] text-muted">{subtitle}</p>
            ) : null}
          </div>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}
