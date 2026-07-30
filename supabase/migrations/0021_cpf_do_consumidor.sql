-- GoodFood — CPF on the consumer profile (screens C0b and C7 "Dados pessoais")
-- Paste into Supabase SQL Editor → Run.
--
-- profiles.telefone already exists (0002); only the CPF is new.
--
-- Decided 2026-07-29: CPF and telefone are now REQUIRED at signup. This
-- reverses the earlier call that kept the phone out of signup (a shop only
-- needed it to warn about one order, so it was collected then). Treat that
-- comment in auth-actions.ts as stale.
--
-- The column is nullable on purpose even though the form requires it: the
-- accounts created before today have no CPF, and a NOT NULL would have to
-- invent one for them. The requirement lives in the form, where it can
-- explain itself; the database only stores what it is given.

alter table public.profiles
  add column if not exists cpf text;

comment on column public.profiles.cpf is
  'Consumer CPF, digits only. Required by the signup form since 2026-07-29; '
  'null on accounts created before that. Not verified against the Receita — '
  'the format is checked, the person is not.';

-- Two accounts must not share a CPF. A partial unique index rather than a
-- constraint, so the rows that predate this (cpf null) don't collide with
-- each other — in Postgres every NULL is distinct, but being explicit here
-- documents the intent and keeps the index small.
create unique index if not exists profiles_cpf_unico_idx
  on public.profiles (cpf) where cpf is not null;
