export function PrototypeBanner() {
  return (
    <div
      role="note"
      className="flex items-center justify-center gap-1.5 border-b border-[#EBDCB4] bg-amber-bg px-4 py-2 text-center text-[10.5px] font-semibold leading-[1.35] text-[#8a6a14]"
    >
      {/* Said "nada é reservado nem cobrado", which stopped being true: a
          reservation is a real row, it decrements real stock and the shop
          really sees it. Only the money is simulated. Understating it is not
          the safe direction — a tester who thinks nothing happened reserves
          three times and takes a shop's whole stock off the shelf. */}
      <span aria-hidden>🚧</span>
      <span>
        <b className="font-extrabold">Protótipo</b> · lojas fictícias · a
        reserva é real, o pagamento não
      </span>
    </div>
  );
}
