-- GoodFood — a fuller feed: more sacolas today and tomorrow
-- Paste into Supabase SQL Editor → Run. Safe to re-run.
--
-- After the reset the feed had four offers from four shops, one sacola each.
-- Enough to prove the loop works, too thin to judge how the app FEELS: every
-- category filter returned one card, the Hoje/Amanhã split had almost nothing
-- to split, and there was no sold-out card to look at anywhere.
--
-- This adds four new sacolas to the three demo shops nobody owns, and gives
-- each of them several windows across today and tomorrow.
--
-- WHAT IT DOES NOT TOUCH
--
-- Domenica Casa de Pães — the shop your partner account owns — gets nothing.
-- That side stays yours to fill from P3, which is what makes it a real test.
-- Nothing you published is deleted or changed either: the only rows this
-- removes are the ones it created itself last time it ran (see step 2).
--
-- WHEN YOU RUN IT MATTERS, and that is correct
--
-- The daytime windows use janela_hoje(), so a time that has already passed
-- lands on TOMORROW instead of today. Run this at 9am and most of it is
-- today; run it at 10pm and most of it is tomorrow. It never creates an
-- offer in the past — an expired sacola is worse than no sacola.

-- ---------------------------------------------------------------------------
-- 1. Four new sacolas
--
--    Chosen to fill gaps rather than pad a list:
--      · Doces da Estrela — a SECOND doceria, so that filter isn't one card
--      · Hortifruti and Padaria do Mercado — both under R$ 20, so the
--        "Até R$ 20" search suggestion has something to find
--      · Jantar da Casa — an evening refeicao, the only meal window was lunch
--
--    Fixed ids (b0000000-…-0005 to 0008) so re-running updates these rows
--    instead of breeding copies.
-- ---------------------------------------------------------------------------
insert into public.bags
  (id, establishment_id, nome, descricao, categoria, preco, preco_original,
   emoji, cor_thumb, conteudos, alergenos, peso_kg, modelo, ativo)
values
  ('b0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000002',
   'Sacola Jantar da Casa',
   'O que sobra do jantar no Madrecita: massas, risotos e o acompanhamento do dia. Feito na mesma noite.',
   'refeicao', 29.90, 48.00, '🍝', '#E9F1E6',
   '[{"emoji":"🍝","label":"Massa ou risoto do dia","tag":"Provável"},{"emoji":"🥘","label":"Acompanhamento quente","tag":"Provável"},{"emoji":"🥖","label":"Pão de entrada","tag":"Possível"}]',
   '{gluten,leite}', 1.80, true, true),

  ('b0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000003',
   'Sacola Doces da Estrela',
   'Sonhos, bombas e o que sobrou da vitrine de doces da Panificadora Estrela.',
   'doceria', 16.90, 28.00, '🍩', '#FCEFE3',
   '[{"emoji":"🍩","label":"Sonhos e bombas","tag":"Provável"},{"emoji":"🍪","label":"Biscoitos amanteigados","tag":"Provável"},{"emoji":"🍰","label":"Fatia de bolo","tag":"Possível"}]',
   '{gluten,leite,ovos}', 1.20, true, true),

  ('b0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000004',
   'Sacola Hortifruti',
   'Frutas, legumes e verduras maduros demais para a gôndola e bons demais para o lixo.',
   'mercado', 18.90, 32.00, '🥦', '#E7EEF5',
   '[{"emoji":"🍌","label":"Frutas maduras da estação","tag":"Provável"},{"emoji":"🥕","label":"Legumes variados","tag":"Provável"},{"emoji":"🥬","label":"Folhas do dia","tag":"Possível"}]',
   '{}', 2.50, true, true),

  ('b0000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000004',
   'Sacola Padaria do Mercado',
   'Pães e salgados assados hoje na padaria interna do Zaffari.',
   'padaria', 14.90, 24.00, '🥐', '#F2E8DC',
   '[{"emoji":"🥖","label":"Pães da última fornada","tag":"Provável"},{"emoji":"🥐","label":"Folhados e croissants","tag":"Provável"},{"emoji":"🥨","label":"Salgados assados","tag":"Possível"}]',
   '{gluten,leite,ovos}', 1.60, true, true)
on conflict (id) do update set
  nome           = excluded.nome,
  descricao      = excluded.descricao,
  categoria      = excluded.categoria,
  preco          = excluded.preco,
  preco_original = excluded.preco_original,
  emoji          = excluded.emoji,
  cor_thumb      = excluded.cor_thumb,
  conteudos      = excluded.conteudos,
  alergenos      = excluded.alergenos,
  peso_kg        = excluded.peso_kg,
  modelo         = true,
  ativo          = true;

-- ---------------------------------------------------------------------------
-- 2. Clear only what this file created before
--
--    Scoped to these four bags, and only where no order points at the
--    listing. An order is the record that money moved, and orders.listing_id
--    is ON DELETE RESTRICT — a listing somebody reserved is left exactly
--    where it is. Everything else in the feed, including anything you
--    published yourself, is untouched.
-- ---------------------------------------------------------------------------
delete from public.listings l
where l.bag_id in (
    'b0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000007',
    'b0000000-0000-0000-0000-000000000008'
  )
  and not exists (select 1 from public.orders o where o.listing_id = l.id);

-- ---------------------------------------------------------------------------
-- 3. The windows
--
--    Every time below is DIFFERENT within the same sacola. That is not
--    decoration: migration 0022 put a unique index on
--    (bag_id, data, janela_inicio) for live offers, and janela_hoje('09:30')
--    becomes tomorrow 09h30 once 09h30 has passed. Reusing a time for the
--    "always tomorrow" row would collide with it exactly on the evenings the
--    seed matters most.
--
--    Stock is uneven on purpose. Two units or fewer is what makes the feed's
--    spotlight fire, so some rows sit at 1 and 2; the rest are full, because
--    a feed where everything is nearly sold out reads as fake.
-- ---------------------------------------------------------------------------
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
  v.status,
  b.nome, b.descricao, b.categoria, b.preco, b.preco_original,
  b.conteudos, b.alergenos, b.foto_url, b.peso_kg
from (values
  -- Jantar da Casa (Madrecita) — almoço, jantar, e amanhã cedo
  ('b0000000-0000-0000-0000-000000000005'::uuid,
   public.janela_hoje('12:00'), public.janela_hoje('12:00') + interval '45 minutes', 6, 6, 'ativa'),
  ('b0000000-0000-0000-0000-000000000005'::uuid,
   public.janela_hoje('19:00'), public.janela_hoje('19:00') + interval '1 hour', 5, 2, 'ativa'),
  ('b0000000-0000-0000-0000-000000000005'::uuid,
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '08:00') at time zone 'America/Sao_Paulo',
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '09:00') at time zone 'America/Sao_Paulo', 8, 8, 'ativa'),

  -- Doces da Estrela — manhã, tarde, e uma JÁ ESGOTADA para ver esse estado
  ('b0000000-0000-0000-0000-000000000006'::uuid,
   public.janela_hoje('09:30'), public.janela_hoje('09:30') + interval '1 hour', 4, 1, 'ativa'),
  ('b0000000-0000-0000-0000-000000000006'::uuid,
   public.janela_hoje('16:30'), public.janela_hoje('16:30') + interval '45 minutes', 5, 5, 'ativa'),
  ('b0000000-0000-0000-0000-000000000006'::uuid,
   public.janela_hoje('15:00'), public.janela_hoje('15:00') + interval '30 minutes', 5, 0, 'esgotada'),
  ('b0000000-0000-0000-0000-000000000006'::uuid,
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '07:30') at time zone 'America/Sao_Paulo',
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '09:30') at time zone 'America/Sao_Paulo', 6, 6, 'ativa'),

  -- Hortifruti (Zaffari) — meio da manhã, fim de tarde, e amanhã
  ('b0000000-0000-0000-0000-000000000007'::uuid,
   public.janela_hoje('10:00'), public.janela_hoje('10:00') + interval '1 hour', 6, 3, 'ativa'),
  ('b0000000-0000-0000-0000-000000000007'::uuid,
   public.janela_hoje('18:30'), public.janela_hoje('18:30') + interval '1 hour', 4, 2, 'ativa'),
  ('b0000000-0000-0000-0000-000000000007'::uuid,
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '09:00') at time zone 'America/Sao_Paulo',
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '10:30') at time zone 'America/Sao_Paulo', 7, 7, 'ativa'),

  -- Padaria do Mercado (Zaffari) — almoço, noite, e amanhã bem cedo
  ('b0000000-0000-0000-0000-000000000008'::uuid,
   public.janela_hoje('13:00'), public.janela_hoje('13:00') + interval '1 hour', 8, 4, 'ativa'),
  ('b0000000-0000-0000-0000-000000000008'::uuid,
   public.janela_hoje('20:30'), public.janela_hoje('20:30') + interval '1 hour', 6, 6, 'ativa'),
  ('b0000000-0000-0000-0000-000000000008'::uuid,
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '06:30') at time zone 'America/Sao_Paulo',
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '08:00') at time zone 'America/Sao_Paulo', 5, 5, 'ativa')
) as v(bag_id, inicio, fim, total, disponivel, status)
join public.bags b on b.id = v.bag_id;

-- ---------------------------------------------------------------------------
-- 4. Check: the feed, grouped the way the app groups it
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
  l.categoria,
  'R$ ' || l.preco as preco,
  l.quantidade_disponivel || '/' || l.quantidade_total as estoque,
  l.status
from public.listings l
join public.establishments e on e.id = l.establishment_id
where l.janela_fim > now()
order by l.janela_inicio;
