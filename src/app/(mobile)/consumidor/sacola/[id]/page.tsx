import Link from "next/link";
import { notFound } from "next/navigation";
import { ReserveBar } from "@/components/consumidor/reserve-bar";
import { getSacolaPorId } from "@/lib/sacolas";

export default async function SacolaDetalhe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sacola = await getSacolaPorId(id);
  if (!sacola) notFound();

  return (
    <>
      <main className="flex-1">
        {/* hero */}
        <div className="relative h-[220px] overflow-hidden bg-brand">
          <span className="absolute -left-[50px] -top-[60px] h-40 w-40 rounded-full bg-white/[0.05]" />
          <span className="absolute -bottom-[30px] -right-5 h-[90px] w-[90px] rounded-full bg-white/[0.05]" />
          <Link
            href="/consumidor"
            aria-label="Voltar"
            className="absolute left-[18px] top-[18px] z-[5] flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white/90 text-base"
          >
            ←
          </Link>
          <span className="absolute right-[18px] top-[22px] z-[5] rounded-full bg-white px-3 py-1.5 text-[10.5px] font-extrabold text-brand-dark">
            {sacola.desconto.split("·")[0].trim()}
          </span>
          <span
            className="blob-c absolute left-1/2 top-1/2 flex h-[168px] w-[168px] -translate-x-1/2 -translate-y-1/2 items-center justify-center text-[72px]"
            style={{
              background: sacola.corThumb,
              boxShadow: "0 0 0 7px rgba(255,255,255,0.18)",
            }}
          >
            {sacola.emoji}
          </span>
        </div>

        <div className="px-5 pb-8 pt-5">
          <h1 className="font-display text-[23px] font-bold leading-[1.18]">
            {sacola.nome}
          </h1>
          <div className="mt-[5px] flex items-start justify-between">
            <span className="text-[13px] text-muted">
              {sacola.loja}
              {sacola.distancia ? ` · ${sacola.distancia}` : ""}
            </span>
            <span className="shrink-0 text-[13px] font-extrabold">
              ★ {sacola.avaliacao.toFixed(1).replace(".", ",")}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-[14px] bg-sage px-3.5 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-[15px] text-white">
              ⏰
            </span>
            <div>
              <b className="block text-[13.5px] font-extrabold text-brand-dark">
                Retirar entre {sacola.janela}
              </b>
              <span className="text-[11.5px] text-muted">
                {sacola.janelaNota}
              </span>
            </div>
          </div>

          <section className="mt-[22px]">
            <h2 className="mb-2.5 font-display text-base font-semibold">
              Sobre esta sacola
            </h2>
            <p className="text-[13.5px] leading-[1.55] text-muted">
              {sacola.descricao}
            </p>
          </section>

          {sacola.conteudos.length > 0 && (
            <section className="mt-[22px]">
              <h2 className="mb-2.5 font-display text-base font-semibold">
                O que pode vir na sacola
              </h2>
              <div className="flex flex-col gap-[9px]">
                {sacola.conteudos.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-[11px] rounded-[14px] border-[1.5px] border-sage-line bg-white px-3.5 py-[11px] text-[13px]"
                  >
                    <span className="blob-a flex h-9 w-9 shrink-0 items-center justify-center bg-sage text-base">
                      {item.emoji}
                    </span>
                    <span className="flex-1 font-medium">{item.label}</span>
                    <span className="rounded-md bg-sage px-[9px] py-[3px] text-[10.5px] font-bold text-brand-dark">
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="mt-[22px]">
            <h2 className="mb-2.5 font-display text-base font-semibold">
              Retirada
            </h2>
            <div className="flex items-start gap-3 rounded-[14px] border-[1.5px] border-sage-line bg-white p-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-sage text-base">
                📍
              </span>
              <div>
                <div className="text-[13px] font-bold">{sacola.endereco}</div>
                <div className="mt-[3px] text-xs leading-[1.4] text-muted">
                  Retire no balcão e mostre o código do pedido.
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-start gap-[9px] rounded-[14px] bg-sage px-[13px] py-3 text-[11.5px] leading-[1.5] text-brand-dark">
              💳{" "}
              <span>
                Você não é cobrado agora. O valor fica <b>reservado</b> e só é
                cobrado na retirada — ou ao final da janela, caso não
                compareça. <b>Cancelamento grátis até 17h00.</b>
              </span>
            </div>

            <div className="mt-2.5 flex items-center justify-between rounded-[14px] border-[1.5px] border-sage-line bg-white px-3.5 py-3">
              <span className="flex items-center gap-[9px] text-[12.5px] font-semibold">
                🤝 Não vai poder vir?
              </span>
              <button className="rounded-full bg-sage px-3 py-[7px] text-[11.5px] font-bold text-brand-dark">
                Pedir para um amigo retirar
              </button>
            </div>
          </section>
        </div>
      </main>

      <ReserveBar sacola={sacola} />
    </>
  );
}
