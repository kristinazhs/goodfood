-- GoodFood — the same sacola can't be published twice for the same window
-- Paste into Supabase SQL Editor → Run.
--
-- The feed was showing "Cute dog" twice: same shop, same bag, same window,
-- same price. Two rows in listings that mean one offer. Beyond looking
-- broken, it splits the stock — 1 unit here and 1 there instead of 2 — so
-- the shop's own counts stop adding up.
--
-- Migration 0017 cleaned duplicates up once and P5 has a "já publicada hoje"
-- guard, but the main publish form never checked, so they came back. A guard
-- in the app is a request not to; an index is a refusal.
--
-- WHY PARTIAL (where status = 'ativa'):
--
--   1. It installs with nothing deleted. There is exactly one duplicate pair
--      in the database today, and only one of the two is still 'ativa', so
--      scoped this way there are zero conflicts. Orders are the record that
--      somebody paid; deleting them to satisfy an index would be the wrong
--      trade even if the foreign key allowed it (it doesn't — orders.listing_id
--      is ON DELETE RESTRICT).
--   2. History stays untouched. Closed and sold-out listings keep whatever
--      shape they already had.
--   3. A shop can republish the same bag and window tomorrow, or again after
--      closing today's — only two LIVE offers of the same thing are refused.
--
-- What it deliberately still allows: the same bag published for several
-- DIFFERENT windows on one day. That is a real thing bakeries do (a 14h30
-- batch and an 18h40 batch), and janela_inicio is part of the key so both fit.

create unique index if not exists listings_oferta_unica_idx
  on public.listings (bag_id, data, janela_inicio)
  where status = 'ativa';

comment on index public.listings_oferta_unica_idx is
  'One live offer per bag per window. Partial so that closed listings and '
  'republishing on another day stay possible.';
