-- GoodFood — close expired listings + refresh demo data
-- Paste into Supabase SQL Editor → Run.
--
-- 1) The scheduled job also closes listings whose pickup window has ended,
--    so stale sacolas leave the feed and can't be reserved.
-- 2) Reserving rejects a sacola whose window already closed (defence in depth).
-- 3) Refreshes the four seed shops' sacolas to today so the demo looks current
--    (safe to re-run whenever the demo goes stale).

-- 1. Expiry job: no-show orders AND close expired listings ------------------
create or replace function public.expirar_reservas()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- reserved orders past their pickup window (+10 min grace) -> no-show
  update public.orders o
  set status = 'nao_retirado'
  from public.listings l
  where o.listing_id = l.id
    and o.status = 'reservado'
    and l.janela_fim < now() - interval '10 minutes';

  -- active listings whose window has ended -> closed
  update public.listings
  set status = 'encerrada'
  where status = 'ativa'
    and janela_fim < now();
end;
$$;

-- 2. Reserve: reject a sacola whose pickup window already closed ------------
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

  select b.preco, l.janela_fim
    into v_preco, v_fim
  from public.listings l
  join public.bags b on b.id = l.bag_id
  where l.id = p_listing_id;

  if v_preco is null then
    raise exception 'Sacola indisponível.';
  end if;
  if v_fim < now() then
    raise exception 'A janela de retirada desta sacola já encerrou.';
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
    (id, listing_id, consumer_id, quantidade, codigo, status, total)
  values
    (v_order, p_listing_id, v_user, p_quantidade, v_code, 'reservado', v_preco * p_quantidade);

  return query select v_order, v_code;
end;
$$;

-- 3. Refresh the demo catalog (four seed shops) to today -------------------
update public.listings
set data = current_date,
    janela_inicio = now() + interval '1 hour',
    janela_fim = now() + interval '1 day',
    quantidade_disponivel = quantidade_total,
    status = 'ativa'
where establishment_id in (
  'e0000000-0000-0000-0000-000000000001',
  'e0000000-0000-0000-0000-000000000002',
  'e0000000-0000-0000-0000-000000000003',
  'e0000000-0000-0000-0000-000000000004'
);
