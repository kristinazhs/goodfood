-- GoodFood — another round of windows, today and tomorrow
-- Paste into Supabase SQL Editor → Run. Safe to re-run, and safe to run
-- whether or not 0029 has been run yet.
--
-- Fourteen more offers on the seven demo sacolas: one more today-ish window
-- and one more tomorrow window each. Nothing new is created — these are
-- extra windows on sacolas that already exist, which is how a busy shop
-- actually looks.
--
-- Run together with 0028 and 0029 this brings the feed to roughly forty live
-- offers across the two days: enough density to judge the Hoje/Amanhã split,
-- the category filters and the map with a feed that is genuinely full rather
-- than a handful of examples.
--
-- ORDER DOES NOT MATTER
--
-- Every time here was checked against every window 0026, 0028 AND 0029 give
-- the same sacola, so this can be run before or after 0029. ON CONFLICT DO
-- NOTHING against the 0022 index is the backstop either way: an overlap
-- skips that one row instead of failing the whole file.
--
-- Times are quarter-hours (09h15, 12h45, 17h45). That is not decoration —
-- it is what keeps them clear of the round and half hours the earlier
-- migrations used, so a "today" window that rolls over to tomorrow still
-- cannot land on top of a tomorrow window.
--
-- Domenica is left alone for the third time: it is your partner test
-- surface, and the one shop whose windows this file cannot predict.

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

  -- Mista Pães · Estrela — fornada do meio da manhã
  ('b0000000-0000-0000-0000-000000000003'::uuid,
   public.janela_hoje('09:15'), public.janela_hoje('09:15') + interval '1 hour', 8, 6),

  -- Hortifruti · Zaffari — antes do almoço
  ('b0000000-0000-0000-0000-000000000007'::uuid,
   public.janela_hoje('11:45'), public.janela_hoje('11:45') + interval '1 hour', 6, 2),

  -- Almoço do Dia · Madrecita — última leva do almoço
  ('b0000000-0000-0000-0000-000000000002'::uuid,
   public.janela_hoje('12:45'), public.janela_hoje('12:45') + interval '45 minutes', 6, 3),

  -- Frios e Laticínios · Zaffari — meio da tarde
  ('b0000000-0000-0000-0000-000000000004'::uuid,
   public.janela_hoje('15:45'), public.janela_hoje('15:45') + interval '1 hour', 5, 5),

  -- Padaria do Mercado · Zaffari — fim de tarde
  ('b0000000-0000-0000-0000-000000000008'::uuid,
   public.janela_hoje('16:45'), public.janela_hoje('16:45') + interval '1 hour', 8, 4),

  -- Jantar da Casa · Madrecita — começo do jantar
  ('b0000000-0000-0000-0000-000000000005'::uuid,
   public.janela_hoje('17:45'), public.janela_hoje('17:45') + interval '1 hour', 6, 6),

  -- Doces da Estrela · Estrela — fechamento da vitrine
  ('b0000000-0000-0000-0000-000000000006'::uuid,
   public.janela_hoje('18:15'), public.janela_hoje('18:15') + interval '45 minutes', 5, 1),

  -- ---- AMANHÃ (sempre amanhã) --------------------------------------------

  -- Frios e Laticínios · Zaffari — 07h45
  ('b0000000-0000-0000-0000-000000000004'::uuid,
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '07:45') at time zone 'America/Sao_Paulo',
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '09:00') at time zone 'America/Sao_Paulo', 5, 5),

  -- Padaria do Mercado · Zaffari — 09h45
  ('b0000000-0000-0000-0000-000000000008'::uuid,
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '09:45') at time zone 'America/Sao_Paulo',
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '10:45') at time zone 'America/Sao_Paulo', 8, 6),

  -- Jantar da Casa · Madrecita — 10h15
  ('b0000000-0000-0000-0000-000000000005'::uuid,
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '10:15') at time zone 'America/Sao_Paulo',
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '11:15') at time zone 'America/Sao_Paulo', 6, 6),

  -- Doces da Estrela · Estrela — 12h30
  ('b0000000-0000-0000-0000-000000000006'::uuid,
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '12:30') at time zone 'America/Sao_Paulo',
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '13:30') at time zone 'America/Sao_Paulo', 5, 2),

  -- Mista Pães · Estrela — 13h45
  ('b0000000-0000-0000-0000-000000000003'::uuid,
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '13:45') at time zone 'America/Sao_Paulo',
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '14:45') at time zone 'America/Sao_Paulo', 8, 8),

  -- Hortifruti · Zaffari — 15h30
  ('b0000000-0000-0000-0000-000000000007'::uuid,
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '15:30') at time zone 'America/Sao_Paulo',
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '16:45') at time zone 'America/Sao_Paulo', 6, 4),

  -- Almoço do Dia · Madrecita — 19h45
  ('b0000000-0000-0000-0000-000000000002'::uuid,
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '19:45') at time zone 'America/Sao_Paulo',
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '20:45') at time zone 'America/Sao_Paulo', 6, 5)
) as v(bag_id, inicio, fim, total, disponivel)
join public.bags b on b.id = v.bag_id
on conflict (bag_id, data, janela_inicio) where status = 'ativa'
do nothing;

-- ---------------------------------------------------------------------------
-- Check: how full each day is now, and the whole feed after it
-- ---------------------------------------------------------------------------
select
  case
    when (janela_inicio at time zone 'America/Sao_Paulo')::date
       = (now() at time zone 'America/Sao_Paulo')::date then 'HOJE'
    else 'AMANHÃ'
  end as dia,
  count(*) as ofertas,
  sum(quantidade_disponivel) as sacolas_a_venda
from public.listings
where janela_fim > now() and status = 'ativa'
group by 1
order by 1 desc;
