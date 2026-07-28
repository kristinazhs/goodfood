-- GoodFood — allergens + the real reservation cutoff (design v2, screen C3)
-- Paste into Supabase SQL Editor → Run.
--
-- 1) ALLERGENS. C3 declares "Contém glúten, leite, ovos". There is nowhere
--    to store that today. On a surprise bag — where the customer cannot see
--    what's inside before buying — this is a safety field, not a nice-to-have.
--
-- 2) RESERVATION CUTOFF. The design states reservations close 15 minutes
--    BEFORE the pickup window ends, so someone walking past the shop at 18h30
--    can still buy a bag whose window ends at 19h00. reservar_sacola() today
--    only rejects a window that has already ended, so the screen would promise
--    "reservas até 18h45" while the database still accepted 18h59.

-- 1. Allergens -------------------------------------------------------------
alter table public.bags
  add column if not exists alergenos text[] not null default '{}';

comment on column public.bags.alergenos is
  'Declared allergens, e.g. {gluten,leite,ovos}. Shown on the detail screen.';

-- Seed the demo bags so the screen has something true to show.
update public.bags set alergenos = '{gluten,leite,ovos}'
  where nome = 'Sacola Surpresa Doce';
update public.bags set alergenos = '{gluten,leite}'
  where nome = 'Sacola Mista Pães';
update public.bags set alergenos = '{gluten,leite,ovos,soja}'
  where nome = 'Sacola Almoço do Dia';
update public.bags set alergenos = '{leite}'
  where nome = 'Sacola Frios e Laticínios';

-- 2. Reservations close 15 min before the window ends -----------------------
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
    (id, listing_id, consumer_id, quantidade, codigo, status, total)
  values
    (v_order, p_listing_id, v_user, p_quantidade, v_code, 'reservado', v_preco * p_quantidade);

  return query select v_order, v_code;
end;
$$;
