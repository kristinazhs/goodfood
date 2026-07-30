-- GoodFood — remove duplicate listings of the same bag on the same day
-- Paste into Supabase SQL Editor → Run.
--
-- "Publicar hoje" on P5 had no guard, so tapping it for a bag that was
-- already on sale created a second listing for the same day — and the
-- consumer feed showed that sacola twice. The guard now lives in
-- publicarModeloHoje(); this clears what already got through.
--
-- Keeps the OLDEST listing per (bag, day) and only ever deletes rows with
-- no orders attached, so nothing a customer reserved can disappear.

delete from public.listings l
where l.id in (
  select id from (
    select
      id,
      row_number() over (
        partition by bag_id, data
        order by created_at asc
      ) as posicao
    from public.listings
  ) ranked
  where ranked.posicao > 1
)
and not exists (
  select 1 from public.orders o where o.listing_id = l.id
);

-- Check: should return no rows.
--   select bag_id, data, count(*)
--   from public.listings
--   group by bag_id, data
--   having count(*) > 1;
