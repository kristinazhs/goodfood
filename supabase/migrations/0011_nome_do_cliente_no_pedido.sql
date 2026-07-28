-- GoodFood — the customer's name on the order (design v2, screens P1 and P2)
-- Paste into Supabase SQL Editor → Run.
--
-- The counter queue (P1) and the code check (P2) both show who is collecting:
-- "GF-4827 · Kristina Z.". Today the shop CANNOT see that. profiles has a
-- single read policy — "profiles: self read", id = auth.uid() — so an
-- establishment owner reading a customer's profile gets nothing back.
--
-- Two ways to fix it: widen the profiles policy so shops can read the
-- profiles of people who ordered from them, or copy the name onto the order.
-- We copy it, because:
--   * the shop only ever needs the name attached to a specific order;
--   * it is a record of who collected, so it should not change if the
--     person later edits their profile;
--   * it keeps profiles readable ONLY by their owner, which is the safer
--     default to keep.

alter table public.orders
  add column if not exists cliente_nome text;

comment on column public.orders.cliente_nome is
  'Customer name copied at reservation time, so the shop can identify who is '
  'collecting without being able to read the profiles table.';

-- Backfill existing orders (this editor runs as postgres, so RLS is bypassed).
update public.orders o
set cliente_nome = p.nome
from public.profiles p
where p.id = o.consumer_id
  and o.cliente_nome is null;

-- Reserve: copy the name onto the order as it's created.
create or replace function public.reservar_sacola(
  p_listing_id uuid,
  p_quantidade integer
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

  select nome into v_nome from public.profiles where id = v_user;

  select b.preco, l.janela_fim
    into v_preco, v_fim
  from public.listings l
  join public.bags b on b.id = l.bag_id
  where l.id = p_listing_id;

  if v_preco is null then
    raise exception 'Sacola indisponível.';
  end if;

  -- The cutoff the detail screen promises ("reservas até 18h45").
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
    (id, listing_id, consumer_id, quantidade, codigo, status, total, cliente_nome)
  values
    (v_order, p_listing_id, v_user, p_quantidade, v_code, 'reservado',
     v_preco * p_quantidade, v_nome);

  return query select v_order, v_code;
end;
$$;
