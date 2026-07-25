"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase-server";

export type ReservaState = { error?: string };

export async function reservar(
  _prev: ReservaState,
  formData: FormData,
): Promise<ReservaState> {
  const bagId = String(formData.get("bagId") ?? "");
  const qtd = Math.max(1, Math.floor(Number(formData.get("qtd") ?? 1)));

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/consumidor/entrar");

  // Which listing (today's active offer) does this bag map to?
  const { data: listing } = await supabase
    .from("listings")
    .select("id")
    .eq("bag_id", bagId)
    .eq("status", "ativa")
    .gt("quantidade_disponivel", 0)
    .order("janela_fim", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!listing) return { error: "Esta sacola não está mais disponível." };

  const { data, error } = await supabase.rpc("reservar_sacola", {
    p_listing_id: listing.id,
    p_quantidade: qtd,
  });
  if (error) return { error: error.message };

  const orderId = (data as { order_id: string }[] | null)?.[0]?.order_id;
  if (!orderId) return { error: "Não foi possível concluir a reserva." };

  redirect(`/consumidor/pedido/${orderId}`);
}
