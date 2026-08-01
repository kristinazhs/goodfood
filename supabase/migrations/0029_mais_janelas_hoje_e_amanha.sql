-- GoodFood — more windows, today and tomorrow
-- Paste into Supabase SQL Editor → Run. Safe to re-run.
--
-- Migration 0028 added four new sacolas. This adds no sacolas at all: it
-- gives the ones that already exist MORE WINDOWS, which is what a real shop
-- does — the same bag offered at a morning batch and again in the evening.
--
-- Fourteen new offers: one more today-ish window and one more tomorrow
-- window for each of the seven demo sacolas.
--
-- WHY TOMORROW LOOKED THIN
--
-- Everything explicitly pinned to tomorrow so far lands between 06h30 and
-- 10h30 — every one of them a morning batch. Tomorrow afternoon and evening
-- were empty. The new tomorrow windows fill 08h30 through 18h30.
--
-- DOMENICA IS STILL LEFT ALONE
--
-- Same reason as 0026 and 0028: that shop belongs to your partner account
-- and is the thing you test publishing with. It is also the one shop whose
-- sacolas and windows this file cannot predict, because you create them by
-- hand — so seeding into it is exactly where a collision would come from.
--
-- HOW THE TIMES WERE CHOSEN
--
-- janela_hoje('16:00') means 16h00 today, or 16h00 TOMORROW once 16h00 has
-- passed. So a time used for a "today" window can silently become a tomorrow
-- window, and collide with a tomorrow window using the same time. Migration
-- 0022 made (bag_id, data, janela_inicio) unique for live offers, so that
-- collision is an error, not a duplicate.
--
-- Every time below is therefore new FOR ITS OWN SACOLA — checked against
-- every window 0026 and 0028 gave that same sacola. And the insert ends with
-- ON CONFLICT DO NOTHING against that very index, so even if a window did
-- overlap, the row is skipped instead of the whole migration failing. That
-- is also what makes this safe to run twice.

insert into public.listings
  (bag_id, establishment_id, data, janela_inicio, janela_fim,
   quantidade_total, quantidade_disponivel, status,
   nome, descricao, categoria, preco, preco_original,
   conteudos, alergenos, foto_url, peso_kg)
select
  b.id,
  b.establishment_id,
  (v.inicio at time zone 'America/Sao_Paulo')::date,
  v.inicio,
  v.fim,
  v.total,
  v.disponivel,
  'ativa',
  b.nome, b.descricao, b.categoria, b.preco, b.preco_original,
  b.conteudos, b.alergenos, b.foto_url, b.peso_kg
from (values
  -- ---- HOJE (ou amanhã, se o horário já passou) ---------------------------

  -- Almoço do Dia · Madrecita — segunda leva do almoço
  ('b0000000-0000-0000-0000-000000000002'::uuid,
   public.janela_hoje('11:30'), public.janela_hoje('11:30') + interval '45 minutes', 6, 6),

  -- Mista Pães · Estrela — fornada do meio da tarde
  ('b0000000-0000-0000-0000-000000000003'::uuid,
   public.janela_hoje('16:00'), public.janela_hoje('16:00') + interval '1 hour', 8, 3),

  -- Frios e Laticínios · Zaffari — fim de tarde
  ('b0000000-0000-0000-0000-000000000004'::uuid,
   public.janela_hoje('17:15'), public.janela_hoje('17:15') + interval '1 hour', 5, 2),

  -- Jantar da Casa · Madrecita — fechamento da cozinha
  ('b0000000-0000-0000-0000-000000000005'::uuid,
   public.janela_hoje('21:00'), public.janela_hoje('21:00') + interval '1 hour', 6, 4),

  -- Doces da Estrela · Estrela — vitrine do meio-dia
  ('b0000000-0000-0000-0000-000000000006'::uuid,
   public.janela_hoje('11:00'), public.janela_hoje('11:00') + interval '1 hour', 5, 1),

  -- Hortifruti · Zaffari — reposição da tarde
  ('b0000000-0000-0000-0000-000000000007'::uuid,
   public.janela_hoje('14:00'), public.janela_hoje('14:00') + interval '1 hour 30 minutes', 6, 6),

  -- Padaria do Mercado · Zaffari — última fornada
  ('b0000000-0000-0000-0000-000000000008'::uuid,
   public.janela_hoje('19:30'), public.janela_hoje('19:30') + interval '1 hour', 8, 5),

  -- ---- AMANHÃ (sempre amanhã, tarde e noite) ------------------------------

  -- Padaria do Mercado · Zaffari — 08h30
  ('b0000000-0000-0000-0000-000000000008'::uuid,
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '08:30') at time zone 'America/Sao_Paulo',
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '09:30') at time zone 'America/Sao_Paulo', 8, 8),

  -- Frios e Laticínios · Zaffari — 10h45
  ('b0000000-0000-0000-0000-000000000004'::uuid,
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '10:45') at time zone 'America/Sao_Paulo',
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '12:00') at time zone 'America/Sao_Paulo', 5, 4),

  -- Mista Pães · Estrela — 11h00
  ('b0000000-0000-0000-0000-000000000003'::uuid,
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '11:00') at time zone 'America/Sao_Paulo',
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '12:00') at time zone 'America/Sao_Paulo', 6, 6),

  -- Jantar da Casa · Madrecita — 13h00
  ('b0000000-0000-0000-0000-000000000005'::uuid,
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '13:00') at time zone 'America/Sao_Paulo',
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '14:00') at time zone 'America/Sao_Paulo', 6, 2),

  -- Doces da Estrela · Estrela — 14h00
  ('b0000000-0000-0000-0000-000000000006'::uuid,
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '14:00') at time zone 'America/Sao_Paulo',
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '15:00') at time zone 'America/Sao_Paulo', 5, 5),

  -- Hortifruti · Zaffari — 16h00
  ('b0000000-0000-0000-0000-000000000007'::uuid,
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '16:00') at time zone 'America/Sao_Paulo',
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '17:30') at time zone 'America/Sao_Paulo', 6, 3),

  -- Almoço do Dia · Madrecita — 17h30
  ('b0000000-0000-0000-0000-000000000002'::uuid,
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '17:30') at time zone 'America/Sao_Paulo',
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '18:30') at time zone 'America/Sao_Paulo', 6, 6)
) as v(bag_id, inicio, fim, total, disponivel)
join public.bags b on b.id = v.bag_id
on conflict (bag_id, data, janela_inicio) where status = 'ativa'
do nothing;

-- ---------------------------------------------------------------------------
-- Check: everything on sale, grouped the way the app groups it
-- ---------------------------------------------------------------------------
select
  case
    when (l.janela_inicio at time zone 'America/Sao_Paulo')::date
       = (now() at time zone 'America/Sao_Paulo')::date then 'HOJE'
    else 'AMANHÃ'
  end as dia,
  to_char(l.janela_inicio at time zone 'America/Sao_Paulo', 'HH24hMI')
    || '–' || to_char(l.janela_fim at time zone 'America/Sao_Paulo', 'HH24hMI') as janela,
  l.nome,
  e.nome as loja,
  l.quantidade_disponivel || '/' || l.quantidade_total as estoque,
  l.status
from public.listings l
join public.establishments e on e.id = l.establishment_id
where l.janela_fim > now()
order by l.janela_inicio;
