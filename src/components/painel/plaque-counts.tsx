import { StatusBadge } from "@/components/desktop/status-badge";
import type { SacolaLoja } from "@/lib/types";

// contagens de status de uma sacola (mesmas cores das plaquinhas do app)
export function PlaqueCounts({ sacola }: { sacola: SacolaLoja }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <StatusBadge tone={sacola.ativa > 0 ? "green" : "grey"}>
        {sacola.ativa} ativa{sacola.ativa === 1 ? "" : "s"}
      </StatusBadge>
      <StatusBadge tone={sacola.reservada > 0 ? "blue" : "grey"}>
        {sacola.reservada} reserv.
      </StatusBadge>
      <StatusBadge tone="grey">{sacola.retirada} retirada{sacola.retirada === 1 ? "" : "s"}</StatusBadge>
      {sacola.naoRetirada > 0 ? (
        <StatusBadge tone="red">{sacola.naoRetirada} n/ retirada</StatusBadge>
      ) : null}
    </div>
  );
}
