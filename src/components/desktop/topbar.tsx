export function Topbar({
  prototypeNote,
  contextLabel,
}: {
  prototypeNote: string;
  contextLabel: string;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-[58px] items-center justify-between gap-4 border-b-[1.5px] border-sage-line bg-white/95 px-8 backdrop-blur">
      <span className="flex items-center gap-1.5 rounded-full bg-amber-bg px-3 py-1.5 text-[10.5px] font-semibold text-[#8a6a14]">
        <span aria-hidden>🚧</span>
        <b className="font-extrabold">{prototypeNote}</b>
      </span>
      <div className="flex items-center gap-3">
        <span className="hidden text-[11.5px] text-muted md:block">
          {contextLabel}
        </span>
        <button
          aria-label="Notificações"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-sage-line bg-white text-[15px]"
        >
          🔔
          <span className="absolute right-[7px] top-[7px] h-2 w-2 rounded-full bg-terracotta" />
        </button>
        <button
          aria-label="Conta"
          className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-sage-line bg-sage text-[15px]"
        >
          👤
        </button>
      </div>
    </header>
  );
}
