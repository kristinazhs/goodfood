-- GoodFood — opening hours and counter WhatsApp (design v2, screen P6)
-- Paste into Supabase SQL Editor → Run.
--
-- P6 asks for opening hours per weekday, with a switch for closed days.
-- establishments.horario today is a single free-text field ("Seg–Sáb 7h–19h"),
-- which can't answer the question the app actually needs to ask: is a pickup
-- window inside the hours this shop is open? A bag published for after
-- closing time is a customer standing at a locked door.
--
-- Shape, keyed by weekday:
--   {"seg":{"aberto":true,"inicio":"07:00","fim":"19:30"},
--    "dom":{"aberto":false}}

alter table public.establishments
  add column if not exists horarios jsonb not null default '{}'::jsonb;

comment on column public.establishments.horarios is
  'Opening hours per weekday: {"seg":{"aberto":true,"inicio":"07:00",'
  '"fim":"19:30"}}. Pickup windows are meant to sit inside these.';

-- The counter's WhatsApp. It belongs to the SHOP, not to the person who
-- signed up: staff change, the shop line doesn't. profiles.telefone stays
-- as the personal contact of the account holder.
alter table public.establishments
  add column if not exists whatsapp text;

comment on column public.establishments.whatsapp is
  'Counter WhatsApp, shown to the team and used for pickup questions.';

-- Give the demo shops plausible hours so P6 and P5 have something to show.
update public.establishments
set horarios = '{
  "seg": {"aberto": true, "inicio": "07:00", "fim": "19:30"},
  "ter": {"aberto": true, "inicio": "07:00", "fim": "19:30"},
  "qua": {"aberto": true, "inicio": "07:00", "fim": "19:30"},
  "qui": {"aberto": true, "inicio": "07:00", "fim": "19:30"},
  "sex": {"aberto": true, "inicio": "07:00", "fim": "20:00"},
  "sab": {"aberto": true, "inicio": "08:00", "fim": "18:00"},
  "dom": {"aberto": false}
}'::jsonb
where horarios = '{}'::jsonb;
