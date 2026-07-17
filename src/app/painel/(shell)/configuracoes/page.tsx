import { Card } from "@/components/desktop/card";
import { PageHeader } from "@/components/desktop/page-header";
import { Field, TextArea } from "@/components/ui/field";

function Toggle({ label, hint, on = true }: { label: string; hint: string; on?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-2.5">
      <span>
        <span className="block text-[13px] font-bold">{label}</span>
        <span className="mt-0.5 block text-[11.5px] text-muted">{hint}</span>
      </span>
      <input type="checkbox" defaultChecked={on} className="peer sr-only" />
      <span className="relative h-6 w-11 shrink-0 rounded-full bg-sage-line transition-colors peer-checked:bg-brand after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
    </label>
  );
}

export default function PainelConfiguracoes() {
  return (
    <>
      <PageHeader
        title="Configurações"
        description="Perfil do estabelecimento, horários, repasses e notificações."
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card title="Perfil do estabelecimento">
          <div className="flex flex-col gap-3.5">
            <Field label="Nome" defaultValue="Domenica Casa de Pães" />
            <div className="grid grid-cols-2 gap-3.5">
              <Field label="Categoria" defaultValue="Padaria" />
              <Field label="Telefone" defaultValue="(51) 9 8123-4567" />
            </div>
            <Field
              label="Endereço"
              defaultValue="Rua Padre Chagas, 314 — Bom Fim, Porto Alegre"
            />
            <TextArea
              label="Descrição pública"
              defaultValue="Padaria artesanal no coração do Bom Fim. Pães de fermentação natural, croissants e doces feitos no dia."
            />
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <Card
            title="Horário de funcionamento"
            subtitle="usado para sugerir janelas de retirada"
          >
            <div className="flex flex-col divide-y divide-sage-line/60 text-[12.5px]">
              {[
                ["Segunda a sexta", "07h00 – 19h30"],
                ["Sábado", "07h00 – 20h00"],
                ["Domingo", "08h00 – 13h00"],
              ].map(([dia, horario]) => (
                <div key={dia} className="flex items-center justify-between py-2.5">
                  <span className="font-bold">{dia}</span>
                  <span className="text-muted">{horario}</span>
                </div>
              ))}
            </div>
            <button className="mt-3 rounded-full border-[1.5px] border-sage-line bg-white px-4 py-2 text-[11.5px] font-bold text-muted hover:border-brand hover:text-brand-dark">
              Editar horários
            </button>
          </Card>

          <Card
            title="Recebimento"
            subtitle="pagamento na retirada — direto no seu caixa"
          >
            <p className="text-[12.5px] leading-[1.55] text-muted">
              💰 No protótipo, o cliente <b className="text-charcoal">paga na
              retirada</b>, direto no balcão. Não há repasse pela plataforma —
              esta seção guardará os dados de repasse quando o pagamento online
              for ativado.
            </p>
          </Card>
        </div>

        <Card title="Notificações" className="xl:col-span-2">
          <div className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
            <Toggle
              label="Nova reserva"
              hint="Aviso imediato quando um cliente reservar uma sacola"
            />
            <Toggle
              label="Janela perto de encerrar"
              hint="Lembrete 30 min antes do fim da retirada com reservas pendentes"
            />
            <Toggle
              label="Resumo diário"
              hint="Vendas e retiradas do dia, todo fim de noite"
              on={false}
            />
            <Toggle
              label="Novidades da GoodFood"
              hint="Dicas e novidades da plataforma, no máximo 1x por semana"
              on={false}
            />
          </div>
        </Card>
      </div>

      <div className="mt-5 flex justify-end gap-2.5">
        <button className="rounded-full border-[1.5px] border-sage-line bg-white px-6 py-2.5 text-[13px] font-bold text-muted">
          Descartar
        </button>
        <button className="rounded-full bg-brand px-6 py-2.5 text-[13px] font-bold text-white">
          Salvar alterações
        </button>
      </div>
    </>
  );
}
