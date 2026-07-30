-- GoodFood — deliberate reset: clear the test data, restore the demo catalog
-- Paste into Supabase SQL Editor → Run.
--
-- ###########################################################################
-- ## THIS DELETES DATA AND CANNOT BE UNDONE. Read the list before running. ##
-- ###########################################################################
--
-- WHAT IS DESTROYED
--
--   · all 12 orders, and the 3 reviews hanging off them (reviews.order_id is
--     ON DELETE CASCADE, so they go with the orders — no separate delete)
--   · every listing, including the closed ones
--   · the test models at Domenica: Cinnamon, Cute dog, Cute dog EDITADO,
--     Pão de amanhã cedo, Test
--   · the shops Fruteira Miranda, Sao Francisco Padaria and Z Cafe, with
--     their sacolas
--
-- Deleting the orders is the part with no way back. An order is the record
-- that money moved, which is exactly why orders.listing_id is ON DELETE
-- RESTRICT — the database refuses to let a listing be deleted out from under
-- one. Nothing here bypasses that rule; the orders are deleted first, openly.
-- No money has actually moved yet (payment is still simulated), and several
-- of these totals are wrong anyway: GF-0EC9 at R$ 60,00 and GF-CF44 at
-- R$ 66,00 were charged at the model's price by the bug migration 0025 just
-- fixed. Keeping them would mean testing against known-bad numbers.
--
-- WHAT SURVIVES
--
--   · every account (delete those in the Auth dashboard — see the end)
--   · the 2 saved addresses — they drive every distance in the app
--   · the 4 demo shops and their 4 original sacolas
--   · uploaded photos: files in Storage are NOT touched by deleting rows
--
-- WHAT IT LEAVES YOU WITH, on purpose
--
--   Three demo shops with offers on the feed, and Domenica — the shop your
--   partner account owns — with NONE. Publishing Domenica's sacola yourself
--   from P3 is the partner-side test, and it exercises the price freeze
--   (0024) and the price fix (0025) for real instead of on seeded rows.

-- ---------------------------------------------------------------------------
-- 1. Orders (and their reviews, by cascade)
--    First, because everything below is blocked until they are gone.
-- ---------------------------------------------------------------------------
delete from public.orders;

-- ---------------------------------------------------------------------------
-- 2. Every listing
-- ---------------------------------------------------------------------------
delete from public.listings;

-- ---------------------------------------------------------------------------
-- 3. Sacolas that are not one of the four originals
--    The four seed bags have fixed ids (b0000000-…-0001 to 0004). Anything
--    else was made during testing.
-- ---------------------------------------------------------------------------
delete from public.bags
where id not in (
  'b0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000004'
);

-- ---------------------------------------------------------------------------
-- 4. Shops that are not one of the four demo shops
--    Same idea, fixed ids e0000000-…-0001 to 0004.
-- ---------------------------------------------------------------------------
delete from public.establishments
where id not in (
  'e0000000-0000-0000-0000-000000000001',
  'e0000000-0000-0000-0000-000000000002',
  'e0000000-0000-0000-0000-000000000003',
  'e0000000-0000-0000-0000-000000000004'
);

-- ---------------------------------------------------------------------------
-- 5. Put the four demo shops back to their seeded identity
--
--    Domenica's bairro was changed to "Petropolis" by hand in the table
--    editor, but its endereco and its lat/lng were never changed with it —
--    so the app was labelling it Petrópolis while the map pin sat in Bom
--    Fim. Address, bairro and coordinates have to agree or the distances
--    lie. This restores all three together.
--
--    owner_id is left ALONE: Domenica stays with your partner account.
--    descricao, foto_url and horarios are left alone too — those you edited
--    through the app, which is the real feature working.
-- ---------------------------------------------------------------------------
update public.establishments set
  endereco = 'Rua Padre Chagas, 314',    bairro = 'Bom Fim',
  lat = -30.0331, lng = -51.2100
where id = 'e0000000-0000-0000-0000-000000000001';

update public.establishments set
  endereco = 'Rua Fernandes Vieira, 512', bairro = 'Bom Fim',
  lat = -30.0345, lng = -51.2115
where id = 'e0000000-0000-0000-0000-000000000002';

update public.establishments set
  endereco = 'Av. Osvaldo Aranha, 890',   bairro = 'Bom Fim',
  lat = -30.0360, lng = -51.2150
where id = 'e0000000-0000-0000-0000-000000000003';

update public.establishments set
  endereco = 'Rua 24 de Outubro, 1300',   bairro = 'Moinhos de Vento',
  lat = -30.0250, lng = -51.2050
where id = 'e0000000-0000-0000-0000-000000000004';

-- The four originals are models again, so they show up in Loja.
update public.bags set modelo = true, ativo = true
where id in (
  'b0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000004'
);

-- ---------------------------------------------------------------------------
-- 6. Fresh offers
--
--    Real clock times, using janela_hoje() from migration 0008: it returns
--    that time today, or tomorrow if it has already passed — so this stays
--    sensible whatever hour you run it, and never produces a 23h10–01h10
--    window.
--
--    Each offer copies its terms from the bag, because since 0024 a listing
--    carries its own nome and preco (both NOT NULL) instead of reading the
--    model's.
--
--    The last row is pinned to TOMORROW at 07h00 so the feed's Hoje / Amanhã
--    split always has something in both groups. 07h00 is chosen so it can
--    never collide with what janela_hoje() produces for the same bag — two
--    live offers of one bag in one window are refused by the unique index
--    from migration 0022.
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
  'ativa',
  b.nome, b.descricao, b.categoria, b.preco, b.preco_original,
  b.conteudos, b.alergenos, b.foto_url, b.peso_kg
from (values
  -- Madrecita Bistrô — almoço, 14h30–15h00
  ('b0000000-0000-0000-0000-000000000002'::uuid,
   public.janela_hoje('14:30'),
   public.janela_hoje('14:30') + interval '30 minutes', 6, 5),

  -- Panificadora Estrela — fim de tarde, 18h00–19h00
  ('b0000000-0000-0000-0000-000000000003'::uuid,
   public.janela_hoje('18:00'),
   public.janela_hoje('18:00') + interval '1 hour', 6, 3),

  -- Mercado Zaffari — 20h00–21h00, com 2 unidades: aciona o destaque
  -- "últimas unidades" (regra de 2 ou menos), que é só de hoje.
  ('b0000000-0000-0000-0000-000000000004'::uuid,
   public.janela_hoje('20:00'),
   public.janela_hoje('20:00') + interval '1 hour', 5, 2),

  -- Estrela de novo — fornada da manhã, SEMPRE amanhã, 07h00–09h00
  ('b0000000-0000-0000-0000-000000000003'::uuid,
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '07:00')
     at time zone 'America/Sao_Paulo',
   ((now() at time zone 'America/Sao_Paulo')::date + 1 + time '09:00')
     at time zone 'America/Sao_Paulo', 8, 8)
) as v(bag_id, inicio, fim, total, disponivel)
join public.bags b on b.id = v.bag_id;

-- ---------------------------------------------------------------------------
-- 7. Check: what you should see now
--    3 shops with offers, Domenica with none, no orders, no stray sacolas.
-- ---------------------------------------------------------------------------
select
  e.nome as loja,
  coalesce((select count(*) from public.bags b     where b.establishment_id = e.id), 0) as sacolas,
  coalesce((select count(*) from public.listings l where l.establishment_id = e.id), 0) as ofertas,
  coalesce((select email from auth.users where id = e.owner_id), '—') as dono
from public.establishments e
order by e.nome;

-- ---------------------------------------------------------------------------
-- AFTERWARDS — two things SQL cannot do for you
--
-- a) ACCOUNTS. Deleting a login happens in Authentication → Users in the
--    Supabase dashboard; the profile follows by itself (the 0002 trigger).
--    Safe to delete now that the shops and orders are gone — try it before
--    this migration and the delete fails on a foreign key, because
--    padaria.aranha owned a shop with an order against it.
--      padaria.teste@goodfood.app   — owns nothing
--      padaria.mapa@goodfood.app    — owned Fruteira Miranda
--      padaria.aranha@goodfood.app  — owned Sao Francisco Padaria + Z Cafe
--    Keep kristina.teste (consumer, has the saved addresses) and
--    kristina.parceira (partner, owns Domenica). Oksana and Varvara are
--    worth keeping too: a second consumer proves the shop sees the right
--    name on each order in P1.
--
-- b) PHOTOS. Storage → sacolas has 4 files and lojas has 2. Deleting rows
--    never deletes files. The sacola photos belonged to the test models and
--    are now orphaned; remove them in Storage if you want it tidy. Leave
--    the lojas files — one of them is Domenica's shop photo.
-- ---------------------------------------------------------------------------
