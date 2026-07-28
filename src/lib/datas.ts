// Date/time helpers, all in Porto Alegre local time (UTC-3, no DST in BR).
const TZ = "America/Sao_Paulo";

// Today's date in São Paulo as "YYYY-MM-DD".
export function hojeSP(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// "18:40" -> an ISO timestamp for today at that São Paulo local time.
export function timestampSP(hora: string): string {
  return new Date(`${hojeSP()}T${hora}:00-03:00`).toISOString();
}

// ISO timestamp -> "18h40" in São Paulo time.
export function horaMinutoSP(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date(iso))
    .replace(":", "h");
}

// Reservations close 15 minutes before the pickup window ends — so someone
// walking past the shop at 18h30 can still buy a bag whose window ends at
// 19h00. Enforced in reservar_sacola() (migration 0009); this is the label.
export const CORTE_RESERVA_MIN = 15;

export function horaCorteReserva(janelaFimISO: string): string {
  const corte = new Date(
    new Date(janelaFimISO).getTime() - CORTE_RESERVA_MIN * 60_000,
  );
  return horaMinutoSP(corte.toISOString());
}

/** True once reservations have closed for this window. */
export function reservasEncerradas(janelaFimISO: string | null): boolean {
  if (!janelaFimISO) return true;
  return (
    new Date(janelaFimISO).getTime() - CORTE_RESERVA_MIN * 60_000 < Date.now()
  );
}
