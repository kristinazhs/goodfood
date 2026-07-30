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

/** Tomorrow's date in São Paulo as "YYYY-MM-DD". */
export function amanhaSP(): string {
  const d = new Date(Date.now() + 86_400_000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * "18:40" -> an ISO timestamp at that São Paulo local time, on `data`
 * (default today).
 *
 * The date used to be hardcoded to today, which is why a shop publishing at
 * 22h for an 07h00 window silently created a window in the PAST. Passing the
 * day is what lets tomorrow's breakfast surplus exist at all.
 */
export function timestampSP(hora: string, data: string = hojeSP()): string {
  return new Date(`${data}T${hora}:00-03:00`).toISOString();
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

/**
 * Live countdown for a pickup window: "faltam 42 min" before it opens,
 * "janela aberta" while it's open, null once it has closed. A static window
 * label doesn't tell you whether you still have time.
 */
export function contagemRetirada(
  inicioISO: string,
  fimISO: string,
  agora: number = Date.now(),
): string | null {
  const inicio = new Date(inicioISO).getTime();
  const fim = new Date(fimISO).getTime();
  if (agora > fim) return null;
  if (agora >= inicio) return "janela aberta";

  const min = Math.round((inicio - agora) / 60_000);
  if (min < 60) return `faltam ${min} min`;
  const h = Math.floor(min / 60);
  const resto = min % 60;
  return resto === 0 ? `faltam ${h}h` : `faltam ${h}h${String(resto).padStart(2, "0")}`;
}

/** "Junho", "Julho" — the month heading the history is grouped by. */
export function mesPorExtenso(iso: string): string {
  const nome = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    month: "long",
  }).format(new Date(iso));
  return nome.charAt(0).toUpperCase() + nome.slice(1);
}

/**
 * "28 jun" — the compact date on a history row. Built from parts because
 * pt-BR's short format renders "28 de jun.", which is wordier than the row
 * has space for.
 */
export function diaMes(iso: string): string {
  const partes = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    day: "2-digit",
    month: "short",
  }).formatToParts(new Date(iso));
  const dia = partes.find((p) => p.type === "day")?.value ?? "";
  const mes = (partes.find((p) => p.type === "month")?.value ?? "").replace(
    ".",
    "",
  );
  return `${dia} ${mes}`;
}

/** "hoje", "ontem", "há 3 dias", "há 2 semanas" — for review timestamps. */
export function haQuanto(iso: string): string {
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  if (dias < 7) return `há ${dias} dias`;
  const semanas = Math.floor(dias / 7);
  if (semanas < 5) return semanas === 1 ? "há 1 semana" : `há ${semanas} semanas`;
  const meses = Math.floor(dias / 30);
  return meses <= 1 ? "há 1 mês" : `há ${meses} meses`;
}

/**
 * Which day a pickup window falls on, from the person's point of view:
 * "hoje", "amanhã", or a short date for anything further out.
 *
 * The app used to write "hoje" into the markup as a constant. That was
 * accidentally true while a shop could only publish for the current day —
 * but the demo data rolls windows forward, and once shops can publish for
 * tomorrow it becomes a claim that is wrong for a real customer. The worst
 * case is the "peça pra um amigo" message: it goes to someone else's phone,
 * and a wrong day sends them on the wrong evening.
 */
export function diaRelativoSP(iso: string): string {
  const dias = diasDeDiferenca(iso);
  if (dias === 0) return "hoje";
  if (dias === 1) return "amanhã";
  if (dias === -1) return "ontem";
  return diaMes(iso);
}

/** True when this timestamp falls on today's date in Porto Alegre. */
export function ehHojeSP(iso: string): boolean {
  return diasDeDiferenca(iso) === 0;
}

/**
 * Whole days between today and the date of `iso`, both read as calendar dates
 * in Porto Alegre. Comparing dates rather than subtracting milliseconds is
 * what makes 23h50 -> 00h10 count as one day and not as twenty minutes.
 */
function diasDeDiferenca(iso: string): number {
  const dia = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  const alvo = new Date(`${dia(new Date(iso))}T12:00:00Z`).getTime();
  const hoje = new Date(`${dia(new Date())}T12:00:00Z`).getTime();
  return Math.round((alvo - hoje) / 86_400_000);
}
