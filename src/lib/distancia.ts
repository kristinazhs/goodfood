// Distance from the person to the shop — the "· 450 m" on every card.
//
// The shops' lat/lng are real (geocoded on signup, and used by the map). What
// we don't have yet is the PERSON's location: there's no saved-addresses table
// and we don't ask for geolocation on the feed. So the origin below is the
// address the design shows, as a placeholder, and every distance is measured
// from it. When saved addresses exist, only ORIGEM changes.

export const ORIGEM = {
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
): string {
  if (lat == null || lng == null) return "";
  return formatarDistancia(metrosEntre(ORIGEM.lat, ORIGEM.lng, lat, lng));
}
