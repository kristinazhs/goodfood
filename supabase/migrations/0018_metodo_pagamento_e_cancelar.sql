-- GoodFood — payment method on the order + cancelling within the refund
-- window (design v2, screens C4 and C5)
-- Paste into Supabase SQL Editor → Run.
--
-- 1) METHOD. C5 says "Total pago · Cartão · hoje, 14h20". The time we have
--    (reserved_at); the method we never stored. Payment itself is still
--    simulated — this records which one the person chose, so the screen
--    stops guessing and the real integration has somewhere to write.
--
-- 2) CANCELLING. The app promises a refund within 15 minutes and offers no
--    button anywhere. With money leaving at reservation that isn't a missing
--    nicety, it's a support ticket. Cancelling must also put the sacola back
--    on the shelf, which has to happen atomically with the status change —
--    the same reason reserving is an RPC.

alter table public.orders
  add column if not exists metodo_pagamento text
    check (metodo_pagamento in ('pix', 'cartao'));

comment on column public.orders.metodo_pagamento is
  'Which method the customer chose. Payment is simulated for now; this is '
  'what the real integration will reconcile against.';

-- Free-cancellation window, matching what C3 and C4 promise.
create or replace function public.cancelar_reserva(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user    uuid := auth.uid();
  v_listing uuid;
  v_qtd     integer;
  v_quando  timestamptz;
  v_status  text;
begin
  if v_user is null then
    raise exception 'Faça login para cancelar.';
  end if;

  select listing_id, quantidade, reserved_at, status
    into v_listing, v_qtd, v_quando, v_status
  from public.orders
  where id = p_order_id
    and consumer_id = v_user;   -- only your own order

  if v_listing is null then
    raise exception 'Pedido não encontrado.';
  end if;
  if v_status <> 'reservado' then
    raise exception 'Este pedido não pode mais ser cancelado.';
  end if;
  if v_quando < now() - interval '15 minutes' then
    raise exception 'O prazo de cancelamento (15 min) já passou.';
  end if;

  update public.orders
     set status = 'cancelado'
   where id = p_order_id;

  -- Back on the shelf, and reopened if it had sold out.
  update public.listings
     set quantidade_disponivel = quantidade_disponivel + v_qtd,
         status = case
                    when status = 'esgotada' then 'ativa'
                    else status
                  end
   where id = v_listing;
end;
$$;

-- Record the method at reservation time.
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

  select b.preco, l.janela_fim
    into v_preco, v_fim
  from public.listings l
  join public.bags b on b.id = l.bag_id
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
