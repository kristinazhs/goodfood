-- GoodFood — demo seed data (step 1C, part 1)
-- Fills the catalog with a few establishments, bags and today's listings
-- so the app has real sacolas to show. This is throwaway demo data — we can
-- delete it later. Paste into SQL Editor → Run, AFTER the schema.

-- Interpret the pickup times below as Porto Alegre local time.
set timezone to 'America/Sao_Paulo';

-- 1. Establishments ----------------------------------------------------
insert into public.establishments
  (id, nome, categoria, endereco, bairro, lat, lng, horario, emoji)
values
  ('e0000000-0000-0000-0000-000000000001', 'Domenica Casa de Pães',   'padaria',  'Rua Padre Chagas, 314',    'Bom Fim',          -30.0331, -51.2100, 'Seg–Sáb · 7h–19h',       '🥖'),
  ('e0000000-0000-0000-0000-000000000002', 'Madrecita Bistrô',        'refeicao', 'Rua Fernandes Vieira, 512','Bom Fim',          -30.0345, -51.2115, 'Seg–Sex · 11h–15h',      '🥗'),
  ('e0000000-0000-0000-0000-000000000003', 'Panificadora Estrela',    'padaria',  'Av. Osvaldo Aranha, 890',  'Bom Fim',          -30.0360, -51.2150, 'Seg–Sáb · 6h–20h',       '🍞'),
  ('e0000000-0000-0000-0000-000000000004', 'Mercado Zaffari Moinhos', 'mercado',  'Rua 24 de Outubro, 1300',  'Moinhos de Vento', -30.0250, -51.2050, 'Todos os dias · 8h–22h', '🧀');

-- 2. Bags (the recurring templates) ------------------------------------
insert into public.bags
  (id, establishment_id, nome, descricao, categoria, preco, preco_original, emoji, cor_thumb, conteudos)
values
  ('b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
   'Sacola Surpresa Doce',
   'Uma seleção surpresa dos pães, croissants e doces que sobraram do dia na Domenica Casa de Pães. Tudo preparado nas últimas 24 horas.',
   'padaria', 27.90, 45.00, '🥐', '#FCEFE3',
   '[{"emoji":"🥐","label":"Croissants amanteigados","tag":"Provável"},{"emoji":"🍞","label":"Pão de fermentação natural","tag":"Provável"},{"emoji":"🧁","label":"Mini bolos ou muffins","tag":"Possível"}]'),

  ('b0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002',
   'Sacola Almoço do Dia',
   'Uma seleção surpresa dos pratos do buffet do dia no Madrecita Bistrô. Comida caseira preparada hoje.',
   'refeicao', 24.90, 39.00, '🥗', '#E9F1E6',
   '[{"emoji":"🍛","label":"Prato executivo do dia","tag":"Provável"},{"emoji":"🥗","label":"Salada da estação","tag":"Provável"},{"emoji":"🍮","label":"Sobremesa da casa","tag":"Possível"}]'),

  ('b0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003',
   'Sacola Mista Pães',
   'Pães variados do dia na Panificadora Estrela: francês, integral, cacetinho e o que mais sobrar da fornada da tarde.',
   'padaria', 21.90, 34.00, '🍞', '#F2E8DC',
   '[{"emoji":"🥖","label":"Pães da fornada do dia","tag":"Provável"},{"emoji":"🍞","label":"Pão integral ou de milho","tag":"Provável"},{"emoji":"🥨","label":"Salgados de padaria","tag":"Possível"}]'),

  ('b0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004',
   'Sacola Frios e Laticínios',
   'Queijos, iogurtes e frios próximos da data de validade, perfeitos para consumir nos próximos dias.',
   'mercado', 34.90, 54.00, '🧀', '#E7EEF5',
   '[{"emoji":"🧀","label":"Queijos variados","tag":"Provável"},{"emoji":"🥛","label":"Iogurtes e bebidas lácteas","tag":"Provável"},{"emoji":"🥓","label":"Frios fatiados","tag":"Possível"}]');

-- 3. Listings (today's offers of those bags) ---------------------------
insert into public.listings
  (bag_id, establishment_id, data, janela_inicio, janela_fim, quantidade_total, quantidade_disponivel, status)
values
  ('b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
   current_date, current_date + interval '18 hours 40 minutes', current_date + interval '19 hours',        4, 1, 'ativa'),
  ('b0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002',
   current_date, current_date + interval '14 hours 30 minutes', current_date + interval '15 hours',        6, 3, 'ativa'),
  ('b0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003',
   current_date, current_date + interval '18 hours',            current_date + interval '19 hours',        8, 5, 'ativa'),
  ('b0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004',
   current_date, current_date + interval '20 hours',            current_date + interval '21 hours',        5, 2, 'ativa');
