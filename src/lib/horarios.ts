// Opening hours, read from establishments.horarios (migration 0016).
//
// Until now the Hoje screen said "aberta" whenever any offer was live, which
// answers a different question: an offer can be published for 22h by a shop
// that closes at 19h30, and the header would still have claimed the shop was
// open. The schedule is the truth; a live offer outside it is a mistake the
// partner wants to catch before a customer stands at a locked door.

const TZ = "America/Sao_Paulo";

/** The weekday keys used by the signup form and stored in the jsonb. */
const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"] as const;

export type DiaSemana = (typeof DIAS)[number];

export interface Horario {
  aberto: boolean;
  inicio?: string; // "07:00"
  fim?: string; // "19:30"
}

export type Horarios = Partial<Record<DiaSemana, Horario>>;

/** Minutes since midnight in Porto Alegre, for a given instant. */
function minutosSP(quando: Date): number {
  const [h, m] = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(quando)
    .split(":")
    .map(Number);
  return h * 60 + m;
}

/** Which weekday it is in Porto Alegre, as the key the jsonb uses. */
export function diaSemanaSP(quando: Date = new Date()): DiaSemana {
  // en-US short weekday is stable to parse; the browser locale is not.
  const nome = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
  }).format(quando);
  const mapa: Record<string, DiaSemana> = {
    Sun: "dom",
    Mon: "seg",
    Tue: "ter",
    Wed: "qua",
    Thu: "qui",
    Fri: "sex",
    Sat: "sab",
  };
  return mapa[nome] ?? "seg";
}

/** "07:00" -> 420. Returns null for anything that isn't a time. */
function paraMinutos(hora: string | undefined): number | null {
  if (!hora) return null;
  const [h, m] = hora.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

export interface EstadoLoja {
  /** null when the shop has never filled its hours in — we don't guess. */
  aberta: boolean | null;
  /** Today's entry, for "aberto até 19h30" style labels. */
  hoje: Horario | null;
  abreAs: string | null;
  fechaAs: string | null;
}

/**
 * Is the shop open right now, according to its own schedule? A shop that
 * never filled the hours in gets `null` rather than a guess: claiming
 * "fechada" for a shop that is actually open would be worse than saying
 * nothing.
 */
export function estadoDaLoja(
  horarios: Horarios | null | undefined,
  quando: Date = new Date(),
): EstadoLoja {
  const vazio: EstadoLoja = {
    aberta: null,
    hoje: null,
    abreAs: null,
    fechaAs: null,
  };
  if (!horarios || Object.keys(horarios).length === 0) return vazio;

  const hoje = horarios[diaSemanaSP(quando)];
  if (!hoje) return vazio;
  if (!hoje.aberto) {
    return { aberta: false, hoje, abreAs: null, fechaAs: null };
  }

  const inicio = paraMinutos(hoje.inicio);
  const fim = paraMinutos(hoje.fim);
  if (inicio === null || fim === null) return { ...vazio, hoje };

  const agora = minutosSP(quando);
  return {
    aberta: agora >= inicio && agora < fim,
    hoje,
    abreAs: hoje.inicio ?? null,
    fechaAs: hoje.fim ?? null,
  };
}

/**
 * True when a pickup window falls outside the hours the shop registered —
 * the case worth warning about, because nobody will be there to hand the bag
 * over. Unknown hours never raise a warning.
 */
export function janelaForaDoHorario(
  horarios: Horarios | null | undefined,
  janelaInicioISO: string,
  janelaFimISO: string,
): boolean {
  if (!horarios || Object.keys(horarios).length === 0) return false;

  const inicioData = new Date(janelaInicioISO);
  const dia = horarios[diaSemanaSP(inicioData)];
  if (!dia) return false;
  if (!dia.aberto) return true;

  const abre = paraMinutos(dia.inicio);
  const fecha = paraMinutos(dia.fim);
  if (abre === null || fecha === null) return false;

  // The whole window has to fit: handing a bag over at closing time still
  // needs someone at the counter.
  return minutosSP(inicioData) < abre || minutosSP(new Date(janelaFimISO)) > fecha;
}

/** "07:00" -> "07h00", matching how the rest of the app writes times. */
export function comHora(hora: string | null | undefined): string | null {
  return hora ? hora.replace(":", "h") : null;
}
