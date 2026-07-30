-- GoodFood — a published offer keeps its own terms
-- Paste into Supabase SQL Editor → Run.
--
-- Today a listing stores only bag_id, so every screen reads the name, the
-- price and the contents from the bag. Editing the model therefore rewrites
-- what an offer ALREADY ON SALE says — including its price, for someone who
-- has already paid, and including the allergens, which is a safety
-- declaration and not a label.
--
-- An offer is a promise made at a moment. It has to hold still. From here on
-- publishing copies the terms onto the listing, and the model becomes what it
-- always should have been: a starting point for the NEXT one.
--
-- What is copied and why:
--   nome, descricao   what the customer thinks they bought
--   preco, preco_original   money, and the discount shown against it
--   categoria         what they filtered by to find it
--   conteudos         "o que pode vir"
--   alergenos         a safety declaration
--   foto_url          part of the offer, not decoration
--   peso_kg           feeds "kg de comida que você salvou" on past orders
--
-- Deliberately NOT copied: emoji and cor_thumb. They are decoration; a shop
-- changing its emoji has no business failing a migration over it.

-- 1. The columns ------------------------------------------------------------
alter table public.listings
  add column if not exists nome           text,
  add column if not exists descricao      text,
  add column if not exists categoria      text,
  add column if not exists preco          numeric(10,2),
  add column if not exists preco_original numeric(10,2),
  add column if not exists conteudos      jsonb,
  add column if not exists alergenos      text[],
  add column if not exists foto_url       text,
  add column if not exists peso_kg        numeric(5,2);

-- 2. Freeze what is already published ---------------------------------------
-- Existing offers take the bag's current values. That is the best available
-- truth: it is what those offers have been showing all along.
update public.listings l
set nome           = coalesce(l.nome, b.nome),
    descricao      = coalesce(l.descricao, b.descricao),
    categoria      = coalesce(l.categoria, b.categoria),
    preco          = coalesce(l.preco, b.preco),
    preco_original = coalesce(l.preco_original, b.preco_original),
    conteudos      = coalesce(l.conteudos, b.conteudos),
    alergenos      = coalesce(l.alergenos, b.alergenos),
    foto_url       = coalesce(l.foto_url, b.foto_url),
    peso_kg        = coalesce(l.peso_kg, b.peso_kg)
from public.bags b
where b.id = l.bag_id;

-- 3. Make the important ones mandatory --------------------------------------
-- After the backfill nothing is null, so this cannot fail — and from now on
-- an insert that forgets to copy the terms fails loudly instead of quietly
-- producing an offer with no name and no price.
alter table public.listings
  alter column nome  set not null,
  alter column preco set not null;

comment on column public.listings.preco is
  'The price THIS offer was published at. Editing the bag afterwards must '
  'never change it: someone may already have paid it.';

comment on column public.listings.alergenos is
  'Allergens as declared when this offer was published. Frozen on purpose — '
  'a retroactive change here is a safety problem, not a copy edit.';
