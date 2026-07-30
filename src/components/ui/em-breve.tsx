// One place for "this part isn't built yet".
//
// The app had four different ways of saying it: a faint grey line under
// Desempenho, "Em breve" inside a row's subtitle, a dashed box on the pickup
// screen, and — worst — buttons that looked completely live and only revealed
// themselves when tapped (Continuar com Google returned an error message).
// A first tester reads that as a broken app rather than an unfinished one.
//
// So: one vocabulary, amber, matching the prototype banner already at the top
// of every screen. Amber means "under construction" here and nothing else —
// alert red is for things that went wrong, and nothing here went wrong.
//
// Deliberately readable rather than hidden. Kristina's call, and the right
// one: a tester who can see Desempenho understands what the product will be.
// Someone who finds a blank space just thinks a screen failed to load.
//
// When a feature ships, delete its usage here — that is the whole cleanup.

const AMBER_PILL =
  "inline-flex shrink-0 items-center rounded-full bg-amber-bg px-2 py-[3px] " +
  "text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#8a6a14]";

/** Small pill for a row or button that is visible but not yet working. */
export function SeloEmBreve({ children = "Em breve" }: { children?: string }) {
  return <span className={AMBER_PILL}>{children}</span>;
}

/**
 * A settings row that looks like the real ones but cannot be tapped.
 *
 * Rendered as a <div>, not a disabled <a>: there is no destination, so there
 * is nothing for a screen reader or a keyboard to usefully land on. aria-hidden
 * would go too far the other way — the text still tells you the feature is
 * coming, which is information worth having.
 */
export function LinhaEmBreve({
  titulo,
  detalhe,
  selo,
}: {
  titulo: string;
  detalhe: string;
  selo?: string;
}) {
  return (
    <div className="flex min-h-11 items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-sage-line bg-white/60 px-[15px] py-3.5">
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold leading-[1.3] text-[#8d8d84]">
          {titulo}
        </span>
        <span className="mt-0.5 block text-[12.5px] font-medium leading-[1.35] text-muted">
          {detalhe}
        </span>
      </span>
      <SeloEmBreve>{selo}</SeloEmBreve>
    </div>
  );
}

/**
 * Page-level note. For screens that are worth reading but are not yet the
 * real thing — Desempenho's example numbers, the legal texts being written.
 */
export function AvisoDemo({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="note"
      className="mb-4 rounded-[14px] border-[1.5px] border-dashed border-[#EBDCB4] bg-amber-bg px-4 py-3"
    >
      <div className="flex items-center gap-1.5 text-[12.5px] font-extrabold leading-none text-[#8a6a14]">
        <span aria-hidden>🚧</span>
        {titulo}
      </div>
      <p className="mt-1.5 text-[12.5px] font-medium leading-[1.45] text-[#8a6a14]">
        {children}
      </p>
    </div>
  );
}
