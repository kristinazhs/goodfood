-- GoodFood — remove the empty establishment left over from partner signup
-- Paste into Supabase SQL Editor → Run.
--
-- Signing up as an establishment creates a shop row. When that account is
-- then pointed at Domenica (0013), the account ends up owning TWO shops and
-- the partner dashboard, which expects one, comes up empty.
--
-- No e-mail to fill in: this finds the owner via Domenica itself, so it
-- can only ever affect the account that owns Domenica.

delete from public.establishments
where owner_id = (
    select owner_id from public.establishments
    where nome = 'Domenica Casa de Pães'
  )
  and nome <> 'Domenica Casa de Pães';

-- Check: should return exactly one row (Domenica).
--   select nome from public.establishments
--   where owner_id = (select owner_id from public.establishments
--                     where nome = 'Domenica Casa de Pães');
