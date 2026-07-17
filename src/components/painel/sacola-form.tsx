import Link from "next/link";
import { Card } from "@/components/desktop/card";
import { Field, TextArea } from "@/components/ui/field";
import type { SacolaLoja } from "@/lib/types";

// formulário compartilhado entre criar e editar (protótipo — não envia dados)
export function SacolaForm({ sacola }: { sacola?: SacolaLoja }) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr]">
      <div className="flex flex-col gap-5">
        <Card title="Informações da sacola">
          <div className="flex flex-col gap-3.5">
            <Field
              label="Nome da sacola"
              placeholder="Ex.: Sacola Surpresa Doce"
              defaultValue={sacola?.nome}
            />
            <TextArea
              label="Descrição"
              placeholder="O que costuma vir na sacola? Lembre o cliente de que o conteúdo é surpresa."
              defaultValue={
                sacola
                  ? "Uma seleção surpresa dos pães, croissants e doces que sobraram do dia."
                  : undefined
              }
            />
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-muted">
                Categoria
              </span>
              <select className="w-full rounded-[14px] border-[1.5px] border-sage-line bg-white px-4 py-3 text-sm outline-none focus:border-brand">
                <option>Padaria</option>
                <option>Refeição pronta</option>
                <option>Mercado</option>
              </select>
            </label>
          </div>
        </Card>

        <Card title="Preço e quantidade">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <Field
              label="Quantidade disponível"
              type="number"
              placeholder="Ex.: 5"
              defaultValue={sacola ? String(sacola.ativa + sacola.reservada) : undefined}
            />
            <Field
              label="Preço na GoodFood (R$)"
              placeholder="Ex.: 27,90"
              defaultValue={sacola ? sacola.preco.toFixed(2).replace(".", ",") : undefined}
            />
            <Field label="Valor original (R$)" placeholder="Ex.: 45,00" />
          </div>
          <p className="mt-3 text-[11.5px] leading-[1.5] text-muted">
            💡 Sacolas com pelo menos <b>35% de desconto</b> sobre o valor
            original vendem mais rápido na plataforma.
          </p>
        </Card>

        <Card title="Janela de retirada">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-muted">
                Dia
              </span>
              <select className="w-full rounded-[14px] border-[1.5px] border-sage-line bg-white px-4 py-3 text-sm outline-none focus:border-brand">
                <option>Hoje</option>
                <option>Amanhã</option>
                <option>Agendar data</option>
              </select>
            </label>
            <Field label="Início" type="time" defaultValue="18:40" />
            <Field label="Fim" type="time" defaultValue="19:00" />
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-5">
        <Card title="Foto (opcional)">
          <button className="flex h-[140px] w-full flex-col items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-sage-line bg-cream text-muted hover:border-brand">
            <span className="text-2xl">📷</span>
            <span className="text-[12px] font-bold">Enviar foto</span>
            <span className="text-[10.5px]">PNG ou JPG · até 5MB</span>
          </button>
        </Card>

        <Card title="Resumo">
          <ul className="flex flex-col gap-2 text-[12.5px] text-muted">
            <li>
              💰 Pagamento <b className="text-charcoal">na retirada</b> — o
              cliente paga direto no balcão.
            </li>
            <li>
              ⏰ A sacola sai do ar automaticamente quando a janela encerra.
            </li>
            <li>
              🔁 Você pode duplicar esta sacola para os próximos dias.
            </li>
          </ul>
        </Card>

        <div className="flex flex-col gap-2.5">
          <Link
            href="/painel/sacolas"
            className="block rounded-full bg-brand py-3 text-center text-[13px] font-bold text-white"
          >
            {sacola ? "Salvar alterações" : "Publicar sacola"}
          </Link>
          <Link
            href="/painel/sacolas"
            className="block rounded-full border-[1.5px] border-sage-line bg-white py-3 text-center text-[13px] font-bold text-muted"
          >
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  );
}
