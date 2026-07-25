-- GoodFood — atomic reservation (step B)
-- Paste into Supabase SQL Editor → Run (after the earlier migrations).
--
-- Reserving must be atomic: if two people tap "Reservar" on the last bag at
-- the same moment, exactly one must succeed. This function decrements the
-- stock with a guarded UPDATE (only succeeds if enough is left) and creates
-- the order — both in one call. It runs with elevated rights (security
-- definer) because a consumer isn't the listing's owner, but it only ever
-- acts for the logged-in user (auth.uid()).

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

  -- price of the bag behind this listing
  select b.preco
    into v_preco
  from public.listings l
  join public.bags b on b.id = l.bag_id
  where l.id = p_listing_id;

  if v_preco is null then
    raise exception 'Sacola indisponível.';
  end if;

  -- Guarded, atomic decrement: only succeeds if the listing is still active
  -- and has enough units. This is what prevents overselling.
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

  -- Pickup code like GF-A3F9 (derived from the order id, so it's unique).
  v_code := 'GF-' || upper(substr(replace(v_order::text, '-', ''), 1, 4));

  insert into public.orders
    (id, listing_id, consumer_id, quantidade, codigo, status, total)
  values
    (v_order, p_listing_id, v_user, p_quantidade, v_code, 'reservado', v_preco * p_quantidade);

  return query select v_order, v_code;
end;
$$;

grant execute on function public.reservar_sacola(uuid, integer) to authenticated;
