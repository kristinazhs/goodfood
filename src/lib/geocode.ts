// Turn a free-text address into coordinates using OpenStreetMap's free
// Nominatim geocoder (no API key). Best-effort: returns null on any failure
// so it never blocks the flow that calls it.
export async function geocodarEndereco(
  endereco: string,
): Promise<{ lat: number; lng: number } | null> {
  const texto = endereco.trim();
  if (!texto) return null;

  // Bias the search to Porto Alegre so short addresses resolve well.
  const q = `${texto}, Porto Alegre, RS, Brasil`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      // Nominatim's usage policy requires identifying the app.
      headers: {
        "User-Agent": "GoodFood/1.0 (https://goodfood-iota-swart.vercel.app)",
      },
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;

    const data = (await res.json()) as { lat?: string; lon?: string }[];
    const first = data[0];
    if (!first?.lat || !first?.lon) return null;

    const lat = Number(first.lat);
    const lng = Number(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}
