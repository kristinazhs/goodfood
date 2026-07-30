import type { Origem } from "./distancia";
import { createSupabaseServerClient } from "./supabase-server";

// C7 — saved addresses (migration 0019).
//
// This is the table every distance in the app hangs off. Before it, "450 m"
// was measured from one address written into the code, so the number was only
// true for someone standing in the Bom Fim.

export interface Endereco {
  id: string;
  rotulo: string;
  endereco: string;
  complemento: string | null;
  bairro: string | null;
  lat: number | null;
  lng: number | null;
  principal: boolean;
}

export async function getEnderecos(): Promise<Endereco[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("enderecos")
    .select("id, rotulo, endereco, complemento, bairro, lat, lng, principal")
    .eq("profile_id", user.id)
    .order("principal", { ascending: false })
    .order("created_at", { ascending: true });

  // An unread error here would look like "you have no addresses", which would
  // send someone off to type one they already saved.
  if (error) throw new Error("Não foi possível carregar seus endereços.");
  return (data ?? []) as Endereco[];
}

/**
 * Where to measure distances from — or null when we genuinely don't know.
 *
 * This used to fall back to a fixed address in the Bom Fim and print it in
 * the header as if it were the person's own. It isn't: someone signed out,
 * or who has saved nothing, has told us nothing about where they are. The
 * app then showed them "450 m" as a fact.
 *
 * Null is the honest answer, and the rest of the app already knows what to do
 * with it: distanciaAte() returns "" for a shop with no coordinates on the
 * same principle — an invented distance is worse than none.
 */
export async function getOrigem(): Promise<Origem | null> {
  let enderecos: Endereco[] = [];
  try {
    enderecos = await getEnderecos();
  } catch {
    return null;
  }

  const principal = enderecos.find((e) => e.principal) ?? enderecos[0] ?? null;
  // An address the geocoder couldn't place can't measure anything either.
  if (!principal || principal.lat == null || principal.lng == null) return null;

  return {
    label: principal.endereco,
    lat: principal.lat,
    lng: principal.lng,
  };
}
