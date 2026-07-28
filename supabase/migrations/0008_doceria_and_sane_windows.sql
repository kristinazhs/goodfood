-- GoodFood — Doceria category + sensible pickup windows
-- Paste into Supabase SQL Editor → Run.
--
-- This REPLACES migrations 0006 and 0007 — run this one and ignore those.
--
-- Two fixes:
--
-- 1) 0006 set the demo windows as offsets from now() (+2h, +4h...). Run in the
--    evening, that produced pickup windows like 23h10 – 01h10 for a market —
--    nonsense for a real shop, and it made the whole feed look wrong.
--    Windows are now real clock times, as in the design.
--
-- 2) categoria has a CHECK constraint from 0001 allowing only
--    padaria | refeicao | mercado, so the new Doceria filter could never
--    return anything until the constraint is widened.

-- ---------------------------------------------------------------------------
-- Helper: a pickup window at a given clock time in Porto Alegre, today —
-- or tomorrow if that time has already passed. Keeps the demo from going
-- stale the moment the evening windows close. Re-runnable any time.
-- ---------------------------------------------------------------------------
create or replace function public.janela_hoje(p_hora time)
returns timestamptz
language sql
stable
as $$
  select case
    when ((now() at time zone 'America/Sao_Paulo')::date + p_hora)
           at time zone 'America/Sao_Paulo' > now()
    then ((now() at time zone 'America/Sao_Paulo')::date + p_hora)
           at time zone 'America/Sao_Paulo'
    else ((now() at time zone 'America/Sao_Paulo')::date + 1 + p_hora)
           at time zone 'America/Sao_Paulo'
  end;
$$;

-- ---------------------------------------------------------------------------
-- 1. Doceria
-- ---------------------------------------------------------------------------
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

-- Give the new filter something to show.
-- Revert with: update public.bags set categoria='padaria' where nome='Sacola Surpresa Doce';
update public.bags
set categoria = 'doceria'
where nome = 'Sacola Surpresa Doce';

-- ---------------------------------------------------------------------------
-- 2. Demo catalog: real clock times, varied stock.
--    Domenica keeps 1 unit of 8, so it stays the spotlight all day via the
--    "2 units or fewer" rule even after its window rolls to tomorrow.
-- ---------------------------------------------------------------------------

-- Domenica Casa de Pães — 18h40 – 19h00
update public.listings
set janela_inicio         = public.janela_hoje('18:40'),
    janela_fim            = public.janela_hoje('18:40') + interval '20 minutes',
    data                  = (public.janela_hoje('18:40') at time zone 'America/Sao_Paulo')::date,
    quantidade_total      = 8,
    quantidade_disponivel = 1,
    status                = 'ativa'
where establishment_id = 'e0000000-0000-0000-0000-000000000001';

-- Panificadora Estrela — 18h00 – 19h00
update public.listings
set janela_inicio         = public.janela_hoje('18:00'),
    janela_fim            = public.janela_hoje('18:00') + interval '1 hour',
    data                  = (public.janela_hoje('18:00') at time zone 'America/Sao_Paulo')::date,
    quantidade_total      = 6,
    quantidade_disponivel = 3,
    status                = 'ativa'
where establishment_id = 'e0000000-0000-0000-0000-000000000003';

-- Madrecita Bistrô — 14h30 – 15h00
update public.listings
set janela_inicio         = public.janela_hoje('14:30'),
    janela_fim            = public.janela_hoje('14:30') + interval '30 minutes',
    data                  = (public.janela_hoje('14:30') at time zone 'America/Sao_Paulo')::date,
    quantidade_total      = 6,
    quantidade_disponivel = 5,
    status                = 'ativa'
where establishment_id = 'e0000000-0000-0000-0000-000000000002';

-- Mercado Zaffari Moinhos — 20h00 – 21h00
update public.listings
set janela_inicio         = public.janela_hoje('20:00'),
    janela_fim            = public.janela_hoje('20:00') + interval '1 hour',
    data                  = (public.janela_hoje('20:00') at time zone 'America/Sao_Paulo')::date,
    quantidade_total      = 5,
    quantidade_disponivel = 2,
    status                = 'ativa'
where establishment_id = 'e0000000-0000-0000-0000-000000000004';
