import { BottomNav } from "@/components/ui/bottom-nav";
import { navParceiro } from "@/lib/nav";

const avaliacoes = [
  {
    nome: "Carla S.",
    estrelas: "★★★★★",
    sacola: "Sacola Surpresa Doce",
    texto:
      "Veio croissant, pão de fermentação e dois muffins. Valeu muito a pena!",
    data: "Hoje",
  },
  {
    nome: "João P.",
    estrelas: "★★★★☆",
    sacola: "Sacola Mista Pães",
    texto: "Pães fresquinhos e atendimento rápido na retirada.",
    data: "Ontem",
  },
  {
    nome: "Fernanda L.",
    estrelas: "★★★★★",
    sacola: "Sacola Manhã",
    texto: "Melhor surpresa da semana. Já virou rotina de sábado.",
    data: "28 jun",
  },
];

export default function Avaliacoes() {
  return (
    <>
      <main className="flex-1">
        <div className="px-5 pb-4 pt-6">
          <h1 className="font-display text-[22px] font-semibold">Avaliações</h1>
          <p className="mt-1 text-xs text-muted">
            O que os clientes estão dizendo sobre suas sacolas.
          </p>
        </div>

        <div className="mx-5 mb-4 flex items-center gap-4 rounded-[18px] border-[1.5px] border-sage-line bg-white p-4">
          <div className="font-display text-[34px] font-bold">4,8</div>
          <div>
            <div className="text-sm font-bold text-terracotta">★★★★★</div>
            <div className="mt-0.5 text-[11.5px] text-muted">
              132 avaliações no total
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 px-5 pb-6">
          {avaliacoes.map((a) => (
            <div
              key={a.nome}
              className="rounded-[14px] border-[1.5px] border-sage-line bg-white p-3.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold">{a.nome}</span>
                <span className="text-[11px] text-muted">{a.data}</span>
              </div>
              <div className="mt-0.5 text-xs text-terracotta">{a.estrelas}</div>
              <p className="mt-1.5 text-[12.5px] leading-[1.5] text-muted">
                {a.texto}
              </p>
              <span className="mt-2 inline-block rounded-md bg-sage px-2 py-1 text-[10.5px] font-bold text-brand-dark">
                {a.sacola}
              </span>
            </div>
          ))}
        </div>
      </main>
      <BottomNav items={navParceiro} />
    </>
  );
}
