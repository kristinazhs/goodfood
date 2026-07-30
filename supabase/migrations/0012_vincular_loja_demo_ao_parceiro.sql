-- GoodFood — give the test partner account a shop with real activity
-- Paste into Supabase SQL Editor → Run. (Demo data only; safe to revert.)
--
-- The four demo shops (Domenica, Estrela, Madrecita, Zaffari) were seeded
-- with owner_id = null, so no one can log in as them. The three real
-- establishment accounts (padaria.teste, padaria.mapa, padaria.aranha) have
-- no listings today. Result: the partner screens are correct but empty,
-- and P1/P2 can't be exercised.
--
-- This points Domenica Casa de Pães — which has today's listing, the last
-- unit, and the 18h40–19h00 window — at the padaria.teste account.
--
-- Revert with:
--   update public.establishments set owner_id = null
--   where nome = 'Domenica Casa de Pães';

update public.establishments
set owner_id = (
  select owner_id
  from public.establishments
  where nome = 'Padaria Teste do Bom Fim'
)
where nome = 'Domenica Casa de Pães';
