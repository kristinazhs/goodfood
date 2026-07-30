-- GoodFood — a shop may only write its own photos
-- Paste into Supabase SQL Editor → Run.
--
-- ###########################################################################
-- ## RUN THIS ONLY AFTER THE VERCEL DEPLOY OF THE COMMIT THAT FILES PHOTOS ##
-- ## UNDER {establishment_id}/ HAS FINISHED. Run it before, and every      ##
-- ## upload is rejected until that deploy lands.                           ##
-- ###########################################################################
--
-- WHAT WAS WRONG
--
-- Migrations 0015 and 0019 opened both buckets with:
--
--     for insert to authenticated with check (bucket_id = 'sacolas')
--
-- Signed in is the ONLY condition. Any consumer account — anyone who can
-- complete the signup form — could write files into the buckets that feed
-- the public consumer pages, as many and as large as they liked. Nothing
-- checked that they owned a shop, let alone the right one.
--
-- It stayed harmless only because nobody knew the URL. That is not a
-- control; that is an audience.
--
-- WHY THE PATH IS THE FIX
--
-- The old code wrote {uuid}.{ext} at the bucket root — one flat namespace
-- with every shop's photos in it. A flat namespace cannot express ownership:
-- there is nothing in "a1b2c3.jpg" to check a policy against. Photos are now
-- written to {establishment_id}/{uuid}.{ext}, so the first folder names the
-- shop, and the policy asks the only question that matters: do you own it?
--
-- storage.foldername(name) splits the path, so (…)[1] is that first folder.
--
-- WHAT THIS DOES NOT DO
--
-- Reading stays fully public on both buckets. These photos appear on the
-- open consumer feed, which anyone may browse without an account — signing
-- every URL would buy nothing and cost a round trip per card.

-- ---------------------------------------------------------------------------
-- 1. Limits the client cannot talk its way past
--
--    Both upload forms already refuse files over 5 MB and only offer an
--    image picker. That is a courtesy to the person uploading, not a defence:
--    it is JavaScript in a browser the uploader controls. Declared on the
--    bucket, the same two limits are enforced by the server.
-- ---------------------------------------------------------------------------
update storage.buckets
set file_size_limit = 5242880,   -- 5 MB, matching what the forms promise
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp',
      'image/heic', 'image/heif'   -- what iPhones send
    ]
where id in ('sacolas', 'lojas');

-- ---------------------------------------------------------------------------
-- 2. Who may write into which folder
--
--    One helper, used by both buckets, so the rule exists in a single place
--    and the six policies below cannot drift apart.
-- ---------------------------------------------------------------------------
create or replace function public.pasta_da_minha_loja(p_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.establishments e
    where e.owner_id = auth.uid()
      and e.id::text = (storage.foldername(p_name))[1]
  );
$$;

comment on function public.pasta_da_minha_loja(text) is
  'True when the first folder of a storage path is the id of a shop the '
  'caller owns. The photo path is the permission check: a flat bucket root '
  'had nothing ownable in it.';

grant execute on function public.pasta_da_minha_loja(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. sacolas — the photo on a published offer
-- ---------------------------------------------------------------------------
drop policy if exists "sacolas: leitura pública" on storage.objects;
create policy "sacolas: leitura pública" on storage.objects
  for select using (bucket_id = 'sacolas');

drop policy if exists "sacolas: upload autenticado" on storage.objects;
drop policy if exists "sacolas: loja envia" on storage.objects;
create policy "sacolas: loja envia" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'sacolas' and public.pasta_da_minha_loja(name));

drop policy if exists "sacolas: dono atualiza" on storage.objects;
create policy "sacolas: dono atualiza" on storage.objects
  for update to authenticated
  using (bucket_id = 'sacolas' and public.pasta_da_minha_loja(name));

drop policy if exists "sacolas: dono remove" on storage.objects;
create policy "sacolas: dono remove" on storage.objects
  for delete to authenticated
  using (bucket_id = 'sacolas' and public.pasta_da_minha_loja(name));

-- ---------------------------------------------------------------------------
-- 4. lojas — the shop's own photo
-- ---------------------------------------------------------------------------
drop policy if exists "lojas: leitura pública" on storage.objects;
create policy "lojas: leitura pública" on storage.objects
  for select using (bucket_id = 'lojas');

drop policy if exists "lojas: upload autenticado" on storage.objects;
drop policy if exists "lojas: loja envia" on storage.objects;
create policy "lojas: loja envia" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'lojas' and public.pasta_da_minha_loja(name));

drop policy if exists "lojas: dono atualiza" on storage.objects;
create policy "lojas: dono atualiza" on storage.objects
  for update to authenticated
  using (bucket_id = 'lojas' and public.pasta_da_minha_loja(name));

drop policy if exists "lojas: dono remove" on storage.objects;
create policy "lojas: dono remove" on storage.objects
  for delete to authenticated
  using (bucket_id = 'lojas' and public.pasta_da_minha_loja(name));

-- ---------------------------------------------------------------------------
-- 5. The files already in there
--
--    Everything uploaded before today sits at the bucket root with no folder,
--    so (storage.foldername(name))[1] is null and no owner matches. Those
--    files stay READABLE — public read is unchanged, so Domenica's shop photo
--    keeps showing — but nobody can now overwrite or delete them through the
--    app. That costs nothing in practice: neither form ever updates a file.
--    Both upload a new one under a fresh uuid and repoint foto_url, leaving
--    the old file orphaned. Clear the strays by hand in Storage.
-- ---------------------------------------------------------------------------

-- Check: both buckets limited, 5 MB, 5 mime types, and 4 policies each
-- (read / insert / update / delete).
select b.id as bucket,
       b.public as leitura_publica,
       b.file_size_limit,
       array_length(b.allowed_mime_types, 1) as tipos_permitidos,
       (select count(*) from pg_policies p
        where p.tablename = 'objects'
          and p.policyname like b.id || ':%') as politicas
from storage.buckets b
where b.id in ('sacolas', 'lojas');
