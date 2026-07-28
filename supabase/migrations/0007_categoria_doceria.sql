-- GoodFood — add the "doceria" category (design v2, screen C1)
-- Paste into Supabase SQL Editor → Run.
--
-- categoria is guarded by a CHECK constraint that today allows only
-- padaria | refeicao | mercado, so the app literally cannot store a
-- doceria until this runs. The constraints were declared inline in 0001,
-- so Postgres auto-named them <table>_categoria_check.

alter table public.bags
  drop constraint if exists bags_categoria_check;
alter table public.bags
  add constraint bags_categoria_check
  check (categoria in ('padaria', 'doceria', 'refeicao', 'mercado'));

alter table public.establishments
  drop constraint if exists establishments_categoria_check;
alter table public.establishments
  add constraint establishments_categoria_check
  check (categoria in ('padaria', 'doceria', 'refeicao', 'mercado'));

-- Give the new filter something to show: the sweet bag becomes a doceria.
-- Revert with: update public.bags set categoria = 'padaria' where nome = 'Sacola Surpresa Doce';
update public.bags
set categoria = 'doceria'
where nome = 'Sacola Surpresa Doce';
