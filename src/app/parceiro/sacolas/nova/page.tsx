import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";
import { Field, TextArea } from "@/components/ui/field";

export default function CriarSacola() {
  return (
    <main className="flex-1 px-5 pb-8">
      <div className="flex items-center justify-between pb-1.5 pt-5">
        <BackButton href="/parceiro" />
        <h1 className="font-display text-lg font-semibold">Criar sacola</h1>
        <span className="w-[38px]" />
      </div>

      <div className="mt-4 flex flex-col gap-3.5">
        <button className="flex h-[110px] w-full flex-col items-center justify-center gap-1.5 rounded-[18px] border-2 border-dashed border-sage-line bg-white text-muted">
          <span className="text-2xl">📷</span>
          <span className="text-xs font-bold">Adicionar foto</span>
        </button>

        <Field label="Nome da sacola" placeholder="Ex.: Sacola Surpresa Doce" />
        <TextArea
          label="Descrição"
          placeholder="O que costuma vir nesta sacola?"
        />

        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantidade" type="number" placeholder="5" />
          <Field label="Preço (R$)" placeholder="27,90" />
        </div>
        <Field label="Preço original (R$)" placeholder="45,00" />

        <div>
          <span className="mb-1.5 block text-xs font-bold text-muted">
            Janela de retirada
          </span>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="time"
              defaultValue="18:40"
              className="w-full rounded-[14px] border-[1.5px] border-sage-line bg-white px-4 py-3 text-sm outline-none focus:border-brand"
            />
            <input
              type="time"
              defaultValue="19:00"
              className="w-full rounded-[14px] border-[1.5px] border-sage-line bg-white px-4 py-3 text-sm outline-none focus:border-brand"
            />
          </div>
        </div>

        <div className="flex items-start gap-[9px] rounded-[14px] bg-sage px-[13px] py-3 text-[11.5px] leading-[1.5] text-brand-dark">
          ⏰{" "}
          <span>
            Reservas ficam abertas até <b>30 minutos</b> antes do fim da janela
            de retirada.
          </span>
        </div>
      </div>

      <Link
        href="/parceiro"
        className="mt-6 block w-full rounded-[14px] bg-brand p-4 text-center text-[15px] font-bold text-white"
      >
        Publicar sacola
      </Link>
    </main>
  );
}
