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
