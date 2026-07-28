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
  const metodoBruto = String(formData.get("metodo") ?? "pix");
  const metodo = metodoBruto === "cartao" ? "cartao" : "pix";

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
    p_metodo: metodo,
  });
  if (error) return { error: error.message };

  const orderId = (data as { order_id: string }[] | null)?.[0]?.order_id;
  if (!orderId) return { error: "Não foi possível concluir a reserva." };

  redirect(`/consumidor/pedido/${orderId}`);
}

/**
 * C7 — rate a collected order. One review per order (the table's unique
 * constraint on order_id enforces that), and only the person who placed it
 * may write one (RLS policy from 0001).
 */
export async function avaliarPedido(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  const nota = Number(formData.get("nota") ?? 0);
  const comentario = String(formData.get("comentario") ?? "").trim();

  if (!orderId || nota < 1 || nota > 5) {
    redirect("/consumidor/perfil?erro=avaliacao");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/consumidor/entrar");

  // The establishment is taken from the order, never from the form.
  const { data: pedido } = await supabase
    .from("orders")
    .select("id, consumer_id, status, listing:listings!inner ( establishment_id )")
    .eq("id", orderId)
    .maybeSingle();

  const o = pedido as unknown as {
    id: string;
    consumer_id: string;
    status: string;
    listing: { establishment_id: string };
  } | null;

  if (!o || o.consumer_id !== user.id || o.status !== "retirado") {
    redirect("/consumidor/perfil?erro=avaliacao");
  }

  const { error } = await supabase.from("reviews").insert({
    order_id: o.id,
    establishment_id: o.listing.establishment_id,
    consumer_id: user.id,
    nota,
    comentario: comentario || null,
  });
  if (error) redirect("/consumidor/perfil?erro=avaliacao");

  redirect("/consumidor/perfil?avaliado=1");
}

/**
 * C5 — cancel inside the free-refund window. The app has promised free
 * cancellation since the first mockup and never offered a button; with money
 * leaving at reservation, that promise needs a control behind it.
 * The window and the stock restore are enforced in cancelar_reserva().
 */
export async function cancelarPedido(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) redirect("/consumidor/pedidos");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("cancelar_reserva", {
    p_order_id: orderId,
  });
  if (error) redirect(`/consumidor/pedido/${orderId}?erro=cancelar`);

  redirect("/consumidor/pedidos?cancelado=1");
}
