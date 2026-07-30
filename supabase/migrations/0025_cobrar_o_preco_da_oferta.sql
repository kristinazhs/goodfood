-- GoodFood — charge the price of the OFFER, not the price of the model
-- Paste into Supabase SQL Editor → Run.
--
-- Migration 0024 froze each offer's terms onto the listing so that editing a
-- model can never rewrite something already on sale. Every screen was moved
-- over to read listings.preco.
--
-- reservar_sacola was not. It still reads b.preco — the model's price, as it
-- is RIGHT NOW — and writes that into orders.total. So the half of the system
-- that shows the price was fixed, and the half that takes the money was left
-- behind:
--
--   1. Shop publishes "Sacola Doce" at R$ 27,90.
--   2. Shop later edits the model to R$ 99,00 for the next batch.
--   3. Customer opens the live offer, sees R$ 27,90, taps Reservar.
--   4. The order is written for R$ 99,00.
--
-- The customer is charged a price they were never shown. That is the exact
-- failure 0024 was written to prevent; it was only half-prevented.
--
-- The fix is one line: take the price from the listing. Nothing else in the
-- function changes — the 15-minute reservation cutoff (0009), the customer's
-- name (0011) and the payment method (0018) are all preserved as they were.
-- The join to bags is now unnecessary and goes away with it.
--
-- Note: this repairs the function, not orders already written. Any existing
-- order keeps whatever total it was given.

create or replace function public.reservar_sacola(
  p_listing_id uuid,
  p_quantidade integer,
  p_metodo text default 'pix'
)
returns table (order_id uuid, codigo text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user  uuid := auth.uid();
  v_nome  text;
  v_preco numeric;
  v_fim   timestamptz;
  v_rows  integer;
  v_order uuid := gen_random_uuid();
  v_code  text;
begin
  if v_user is null then
    raise exception 'Faça login para reservar.';
  end if;
  if p_quantidade < 1 then
    raise exception 'Quantidade inválida.';
  end if;
  if p_metodo not in ('pix', 'cartao') then
    raise exception 'Forma de pagamento inválida.';
  end if;

  select nome into v_nome from public.profiles where id = v_user;

  -- The price THIS offer was published at. Not the model's price today.
  select l.preco, l.janela_fim
    into v_preco, v_fim
  from public.listings l
  where l.id = p_listing_id;

  if v_preco is null then
    raise exception 'Sacola indisponível.';
  end if;
  if v_fim - interval '15 minutes' < now() then
    raise exception 'As reservas desta sacola já encerraram.';
  end if;

  update public.listings
     set quantidade_disponivel = quantidade_disponivel - p_quantidade,
         status = case
                    when quantidade_disponivel - p_quantidade <= 0 then 'esgotada'
                    else status
                  end
   where id = p_listing_id
     and status = 'ativa'
     and quantidade_disponivel >= p_quantidade;

  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    raise exception 'Esta sacola esgotou. Tente outra.';
  end if;

  v_code := 'GF-' || upper(substr(replace(v_order::text, '-', ''), 1, 4));

  insert into public.orders
    (id, listing_id, consumer_id, quantidade, codigo, status, total,
     cliente_nome, metodo_pagamento)
  values
    (v_order, p_listing_id, v_user, p_quantidade, v_code, 'reservado',
     v_preco * p_quantidade, v_nome, p_metodo);

  return query select v_order, v_code;
end;
$$;
