import Link from "next/link";

function RoleCard({
  emoji,
  titulo,
  descricao,
  entrarHref,
  cadastroHref,
}: {
  emoji: string;
  titulo: string;
  descricao: string;
  entrarHref: string;
  cadastroHref: string;
}) {
  return (
    <div className="rounded-[18px] border-[1.5px] border-sage-line bg-white p-4">
      <div className="flex items-center gap-3">
        <span className="blob-a flex h-[54px] w-[54px] shrink-0 items-center justify-center bg-sage text-2xl">
          {emoji}
        </span>
        <div>
          <div className="font-display text-base font-bold">{titulo}</div>
          <div className="mt-0.5 text-xs leading-[1.4] text-muted">
            {descricao}
          </div>
        </div>
      </div>
      <div className="mt-3.5 flex gap-2.5">
        <Link
          href={entrarHref}
          className="flex-1 rounded-full bg-brand py-2.5 text-center text-xs font-bold text-white"
        >
          Entrar
        </Link>
        <Link
          href={cadastroHref}
          className="flex-1 rounded-full bg-sage py-2.5 text-center text-xs font-bold text-brand-dark"
        >
          Criar conta
        </Link>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="relative overflow-hidden rounded-b-[32px] bg-brand px-6 pb-12 pt-16">
        <span className="absolute -left-12 -top-14 h-40 w-40 rounded-full bg-white/[0.05]" />
        <span className="absolute -bottom-8 -right-5 h-[90px] w-[90px] rounded-full bg-white/[0.05]" />
        <div className="relative z-[2]">
          <div className="font-display text-[34px] font-bold text-white">
            GoodFood
          </div>
          <div className="mt-2 font-display text-lg font-medium leading-[1.3] text-mint">
            Comida boa, preço justo,
            <br />
            menos desperdício.
          </div>
          <div className="mt-3 max-w-[260px] text-[12.5px] leading-[1.55] text-[#BFE3CC]">
            Sacolas surpresa de padarias, restaurantes e mercados de Porto
            Alegre com até 50% de desconto.
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3.5 px-5 py-6">
        <div className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-muted">
          Como você quer usar o GoodFood?
        </div>
        <RoleCard
          emoji="🛍️"
          titulo="Sou consumidor"
          descricao="Encontre sacolas surpresa com desconto perto de você."
          entrarHref="/consumidor/entrar"
          cadastroHref="/consumidor/cadastro"
        />
        <RoleCard
          emoji="🏪"
          titulo="Sou estabelecimento"
          descricao="Venda o excedente do dia e reduza o desperdício."
          entrarHref="/parceiro/entrar"
          cadastroHref="/parceiro/cadastro"
        />
        <div className="mt-auto pb-2 text-center text-[11px] text-muted">
          📍 Porto Alegre · RS
        </div>
      </div>
    </main>
  );
}
