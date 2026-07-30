// Distance from the person to the shop — the "· 450 m" on every card.
//
// The origin used to be this constant for everybody, so "450 m" was only true
// for someone standing in the Bom Fim. It is now whichever address the person
// saved and marked as principal (see lib/enderecos.ts); this stays as the
// fallback for a visitor who is signed out or hasn't saved one yet, because a
// feed with no distances at all is worse than one measured from the centre.

export interface Origem {
  label: string;
  lat: number;
  lng: number;
}

export const ORIGEM_PADRAO: Origem = {
  label: "Av. Osvaldo Aranha, 540",
  // Approximate — Av. Osvaldo Aranha between the park and Rua Padre Chagas.
  lat: -30.0338,
  lng: -51.2131,
};

const R = 6371000; // earth radius, metres

/** Great-circle distance in metres. */
export function metrosEntre(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(bLat - aLat);
  const dLng = rad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * 450 -> "450m"; 1120 -> "1,1 km" (pt-BR decimal comma).
 * Metres are written tight, as in the design ("450m"), which also buys the
 * few pixels the spotlight's shop line needs to fit on one line at 375px.
 */
export function formatarDistancia(metros: number): string {
  if (metros < 1000) return `${Math.round(metros / 10) * 10}m`;
  return `${(metros / 1000).toFixed(1).replace(".", ",")} km`;
}

/**
 * Distance label for a shop, or "" when it has no coordinates — establishments
 * whose address didn't resolve in OSM store null lat/lng, and an invented
 * distance would be worse than none.
 */
export function distanciaAte(
  lat: number | null | undefined,
  lng: number | null | undefined,
  origem: Origem = ORIGEM_PADRAO,
): string {
  if (lat == null || lng == null) return "";
  return formatarDistancia(metrosEntre(origem.lat, origem.lng, lat, lng));
}

/**
 * Walking time, at a normal city pace of ~80 m/min. "7 min a pé de você" is
 * more useful than metres when deciding whether you'll make the window.
 */
export function minutosAPe(
  lat: number | null | undefined,
  lng: number | null | undefined,
  origem: Origem = ORIGEM_PADRAO,
): number | null {
  if (lat == null || lng == null) return null;
  const m = metrosEntre(origem.lat, origem.lng, lat, lng);
  return Math.max(1, Math.round(m / 80));
}
