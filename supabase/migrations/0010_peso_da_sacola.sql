-- GoodFood — estimated weight per bag (design v2, screens C6 and C7)
-- Paste into Supabase SQL Editor → Run.
--
-- C6 and C7 both end with "6,2 kg de comida que você salvou". That number is
-- the whole reason a person comes back, so it has to be computed from real
-- orders rather than written on the screen. Money saved is already derivable
-- (preco_original − preco, per unit), but the WEIGHT has nowhere to live.
--
-- It is an estimate by design: nobody weighs a surprise bag at the counter.
-- The establishment sets a typical weight per bag type, once.

alter table public.bags
  add column if not exists peso_kg numeric(5,2) not null default 1.50;

comment on column public.bags.peso_kg is
  'Typical weight of this bag in kg. Estimate — used for the customer''s '
  '"comida que você salvou" total and the establishment''s rescued-food stat.';

-- Plausible weights for the demo catalogue.
update public.bags set peso_kg = 1.20 where nome = 'Sacola Surpresa Doce';
update public.bags set peso_kg = 1.80 where nome = 'Sacola Mista Pães';
update public.bags set peso_kg = 1.00 where nome = 'Sacola Almoço do Dia';
update public.bags set peso_kg = 2.20 where nome = 'Sacola Frios e Laticínios';
