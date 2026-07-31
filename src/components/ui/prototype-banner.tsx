export function PrototypeBanner() {
  return (
    <div
      role="note"
      className="flex items-center justify-center gap-1.5 border-b border-[#EBDCB4] bg-amber-bg px-4 py-2 text-center text-[10.5px] font-semibold leading-[1.35] text-[#8a6a14]"
    >
      {/* Four words, on purpose. This sits on top of every single screen, so
          it is the one piece of copy a tester reads hundreds of times — and
          a banner that long stops being read at all.

          It used to try to explain the whole prototype here ("a reserva é
          real, o pagamento não"). That belongs where it applies: the payment
          step says the charge is simulated, and the pickup code screen shows
          a real order. A permanent header is the wrong place for a caveat
          that only matters at one moment. */}
      <span aria-hidden>🚧</span>
      <span>
        <b className="font-extrabold">Protótipo</b> · dados fictícios
      </span>
    </div>
  );
}
