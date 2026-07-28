-- GoodFood — point Domenica at a partner account whose password YOU chose
-- Paste into Supabase SQL Editor → Run. (Demo data only; safe to revert.)
--
-- Use this if you don't know the password of padaria.teste@goodfood.app.
-- First create a new establishment account in the app at /parceiro/cadastro
-- with any e-mail and a password you pick. That signup also creates an empty
-- establishment; this script hands Domenica Casa de Pães to your new account
-- and removes the empty one, so the partner screens have real activity.
--
-- ▼▼▼ REPLACE the e-mail on BOTH lines below with the one you signed up with.

update public.establishments
set owner_id = (
  select id from auth.users
  where email = 'SEU_EMAIL_AQUI'
)
where nome = 'Domenica Casa de Pães';

delete from public.establishments
where owner_id = (
  select id from auth.users
  where email = 'SEU_EMAIL_AQUI'
)
  and nome <> 'Domenica Casa de Pães';

-- ▲▲▲
--
-- Check it worked — should return one row, Domenica, with an owner:
--   select nome, owner_id from public.establishments
--   where nome = 'Domenica Casa de Pães';
--
-- Revert with:
--   update public.establishments set owner_id = null
--   where nome = 'Domenica Casa de Pães';
