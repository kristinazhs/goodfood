import { ORIGEM_PADRAO, type Origem } from "./distancia";
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
 * Where to measure distances from: the address the person marked as
 * principal, or the default when they are signed out, have saved none, or
 * saved one whose coordinates we couldn't resolve. A feed with no distances
 * would be worse than one measured from the centre — but the label always
 * says which address it is, so the number is never silently wrong.
 */
export async function getOrigem(): Promise<Origem> {
  let enderecos: Endereco[] = [];
  try {
    enderecos = await getEnderecos();
  } catch {
    return ORIGEM_PADRAO;
  }

  const principal =
    enderecos.find((e) => e.principal) ?? enderecos[0] ?? null;
  if (!principal || principal.lat == null || principal.lng == null) {
    return ORIGEM_PADRAO;
  }

  return {
    label: principal.endereco,
    lat: principal.lat,
    lng: principal.lng,
  };
}
