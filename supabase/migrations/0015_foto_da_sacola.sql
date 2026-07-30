-- GoodFood — photos for sacolas (design v2, screen P3)
-- Paste into Supabase SQL Editor → Run.
--
-- The photo field has been disabled ("em breve") since the first prototype,
-- and it is the change the review says moves conversion most: in a food
-- marketplace the picture is what decides the purchase. Every card and hero
-- in the app already renders a striped placeholder that accepts a `src`,
-- so this is the last piece missing.

-- 1. Where the URL lives -----------------------------------------------------
alter table public.bags
  add column if not exists foto_url text;

comment on column public.bags.foto_url is
  'Public URL of the shop-window photo, stored in the "sacolas" bucket. '
  'Null falls back to the striped placeholder.';

-- 2. The bucket --------------------------------------------------------------
-- Public read: these photos appear on the open consumer feed, so there is no
-- point signing every URL. Nothing private is ever put here.
insert into storage.buckets (id, name, public)
values ('sacolas', 'sacolas', true)
on conflict (id) do update set public = true;

-- 3. Who may write --------------------------------------------------------
-- Anyone signed in may upload to this bucket, and change or remove only the
-- files they uploaded (storage records the uploader in owner).
drop policy if exists "sacolas: leitura pública" on storage.objects;
create policy "sacolas: leitura pública" on storage.objects
  for select using (bucket_id = 'sacolas');

drop policy if exists "sacolas: upload autenticado" on storage.objects;
create policy "sacolas: upload autenticado" on storage.objects
  for insert to authenticated with check (bucket_id = 'sacolas');

drop policy if exists "sacolas: dono atualiza" on storage.objects;
create policy "sacolas: dono atualiza" on storage.objects
  for update to authenticated using (bucket_id = 'sacolas' and owner = auth.uid());

drop policy if exists "sacolas: dono remove" on storage.objects;
create policy "sacolas: dono remove" on storage.objects
  for delete to authenticated using (bucket_id = 'sacolas' and owner = auth.uid());
