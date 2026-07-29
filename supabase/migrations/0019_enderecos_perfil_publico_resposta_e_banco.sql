-- GoodFood — everything the "antes dos parceiros" list needs from the database
-- Paste into Supabase SQL Editor → Run.
--
-- One migration instead of five, because each of these is a couple of columns
-- and running them separately only multiplies the chances of one being
-- forgotten. Every statement is idempotent: running this twice is harmless.
--
--   1. enderecos          — saved addresses (screen 11), which also replace
--                           the hardcoded "Av. Osvaldo Aranha, 540"
--   2. establishments     — descrição and foto, for the public shop page (B, H)
--   3. reviews            — the shop's reply (G), written through a function
--                           so a shop can never edit the customer's words
--   4. dados_bancarios    — payout details (B), in their OWN table because
--                           establishments is world-readable
--   5. storage "lojas"    — bucket for the shop photo


-- =====================================================================
-- 1. ENDEREÇOS SALVOS
--    Today every distance in the app is measured from one address written
--    into the code, so "450 m" is only true for someone standing in the Bom
--    Fim. This is the table that makes the number mean something.
-- =====================================================================
create table if not exists public.enderecos (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  rotulo      text not null default 'Casa',
  endereco    text not null,
  complemento text,
  bairro      text,
  lat         double precision,
  lng         double precision,
  principal   boolean not null default false,
  created_at  timestamptz not null default now()
);

comment on table public.enderecos is
  'Addresses a consumer saved. The one flagged principal is the origin for '
  'every distance and walking time shown in the app.';

create index if not exists enderecos_profile_id_idx
  on public.enderecos (profile_id);

-- At most one principal address per person. A partial unique index is what
-- enforces it: without this, two rows could both claim to be the main one and
-- the feed would silently pick whichever came back first.
create unique index if not exists enderecos_um_principal_idx
  on public.enderecos (profile_id) where principal;

alter table public.enderecos enable row level security;

-- Private data: an address is only ever readable by the person it belongs to.
drop policy if exists "enderecos: dono lê" on public.enderecos;
create policy "enderecos: dono lê" on public.enderecos
  for select to authenticated using (profile_id = auth.uid());

drop policy if exists "enderecos: dono insere" on public.enderecos;
create policy "enderecos: dono insere" on public.enderecos
  for insert to authenticated with check (profile_id = auth.uid());

drop policy if exists "enderecos: dono atualiza" on public.enderecos;
create policy "enderecos: dono atualiza" on public.enderecos
  for update to authenticated using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

drop policy if exists "enderecos: dono remove" on public.enderecos;
create policy "enderecos: dono remove" on public.enderecos
  for delete to authenticated using (profile_id = auth.uid());


-- =====================================================================
-- 2. PERFIL PÚBLICO DA LOJA
--    C3 and P5 both want a shop photo and neither has a column to read it
--    from. Categoria is deliberately NOT here: the bag type lives on the
--    sacola, not on the shop (decided 2026-07-27).
-- =====================================================================
alter table public.establishments
  add column if not exists descricao text;

comment on column public.establishments.descricao is
  'Short text the shop writes about itself, shown on its public page. '
  'Filled in at signup (P6) and editable in Loja (P5).';

alter table public.establishments
  add column if not exists foto_url text;

comment on column public.establishments.foto_url is
  'Public URL of the shop photo, stored in the "lojas" bucket. Null falls '
  'back to the same striped placeholder the sacolas use.';


-- =====================================================================
-- 3. RESPOSTA DO ESTABELECIMENTO À AVALIAÇÃO
-- =====================================================================
alter table public.reviews
  add column if not exists resposta text;

comment on column public.reviews.resposta is
  'The shop''s public reply. Reviews are world-readable, so consumers see '
  'this wherever they see the review.';

alter table public.reviews
  add column if not exists respondido_em timestamptz;

-- The shop must be able to write a reply, but it must NOT be able to touch
-- nota or comentario — a marketplace where the seller can edit the review is
-- worth nothing. RLS grants whole rows, not columns, so the reply goes
-- through a function instead of an update policy: this is the only route by
-- which an establishment can write to reviews at all.
create or replace function public.responder_avaliacao(
  p_review_id uuid,
  p_resposta  text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_dono uuid;
begin
  select e.owner_id into v_dono
    from public.reviews r
    join public.establishments e on e.id = r.establishment_id
   where r.id = p_review_id;

  if v_dono is null then
    raise exception 'Avaliação não encontrada';
  end if;

  if v_dono <> auth.uid() then
    raise exception 'Só o estabelecimento avaliado pode responder';
  end if;

  update public.reviews
     set resposta      = nullif(btrim(p_resposta), ''),
         respondido_em = case
                           when nullif(btrim(p_resposta), '') is null then null
                           else now()
                         end
   where id = p_review_id;
end;
$$;

comment on function public.responder_avaliacao(uuid, text) is
  'Lets the owning establishment write or clear its reply to a review, '
  'without any ability to change the rating or the customer''s comment. '
  'Passing an empty string removes the reply.';

revoke all on function public.responder_avaliacao(uuid, text) from public;
grant execute on function public.responder_avaliacao(uuid, text) to authenticated;


-- =====================================================================
-- 4. DADOS BANCÁRIOS (REPASSE)
--    Deliberately a separate table. establishments is readable by anyone
--    ("establishments: public read"), so putting an account number on it
--    would publish it. Here nothing is readable except by the owner.
--
--    NOTE: no payout runs on this yet — the payment provider (Mercado Pago
--    vs Pagar.me) is still undecided, and the final field list is theirs to
--    dictate. Keep test data here until that decision is made.
-- =====================================================================
create table if not exists public.dados_bancarios (
  establishment_id uuid primary key
                     references public.establishments (id) on delete cascade,
  titular          text,
  documento        text,
  banco            text,
  agencia          text,
  conta            text,
  tipo_conta       text check (tipo_conta in ('corrente', 'poupanca')),
  chave_pix        text,
  atualizado_em    timestamptz not null default now()
);

comment on table public.dados_bancarios is
  'Payout details, one row per shop. Not wired to any payment provider yet. '
  'Kept out of establishments because that table is world-readable.';

alter table public.dados_bancarios enable row level security;

-- Every policy asks the same question: does the signed-in person own the
-- shop this row belongs to? There is no public read at all.
drop policy if exists "dados_bancarios: dono lê" on public.dados_bancarios;
create policy "dados_bancarios: dono lê" on public.dados_bancarios
  for select to authenticated using (
    exists (select 1 from public.establishments e
             where e.id = dados_bancarios.establishment_id
               and e.owner_id = auth.uid()));

drop policy if exists "dados_bancarios: dono insere" on public.dados_bancarios;
create policy "dados_bancarios: dono insere" on public.dados_bancarios
  for insert to authenticated with check (
    exists (select 1 from public.establishments e
             where e.id = dados_bancarios.establishment_id
               and e.owner_id = auth.uid()));

drop policy if exists "dados_bancarios: dono atualiza" on public.dados_bancarios;
create policy "dados_bancarios: dono atualiza" on public.dados_bancarios
  for update to authenticated using (
    exists (select 1 from public.establishments e
             where e.id = dados_bancarios.establishment_id
               and e.owner_id = auth.uid()))
  with check (
    exists (select 1 from public.establishments e
             where e.id = dados_bancarios.establishment_id
               and e.owner_id = auth.uid()));

drop policy if exists "dados_bancarios: dono remove" on public.dados_bancarios;
create policy "dados_bancarios: dono remove" on public.dados_bancarios
  for delete to authenticated using (
    exists (select 1 from public.establishments e
             where e.id = dados_bancarios.establishment_id
               and e.owner_id = auth.uid()));


-- =====================================================================
-- 5. BUCKET DA FOTO DA LOJA
--    Same shape as the "sacolas" bucket from migration 0015: public read,
--    because these photos sit on the open consumer pages.
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('lojas', 'lojas', true)
on conflict (id) do update set public = true;

drop policy if exists "lojas: leitura pública" on storage.objects;
create policy "lojas: leitura pública" on storage.objects
  for select using (bucket_id = 'lojas');

drop policy if exists "lojas: upload autenticado" on storage.objects;
create policy "lojas: upload autenticado" on storage.objects
  for insert to authenticated with check (bucket_id = 'lojas');

drop policy if exists "lojas: dono atualiza" on storage.objects;
create policy "lojas: dono atualiza" on storage.objects
  for update to authenticated using (bucket_id = 'lojas' and owner = auth.uid());

drop policy if exists "lojas: dono remove" on storage.objects;
create policy "lojas: dono remove" on storage.objects
  for delete to authenticated using (bucket_id = 'lojas' and owner = auth.uid());


-- =====================================================================
-- 6. DEMO — give the four demo shops a description so the public page and
--    the Loja screen have something to show before anyone types one.
-- =====================================================================
update public.establishments set descricao =
  'Casa de pães de fermentação natural no Bom Fim. O que sobra da vitrine '
  'no fim do dia vira sacola surpresa.'
where nome = 'Domenica Casa de Pães' and descricao is null;

update public.establishments set descricao =
  'Bistrô de cozinha do dia. As porções do almoço que não saíram viram '
  'sacola no fim da tarde.'
where nome = 'Madrecita Bistrô' and descricao is null;

update public.establishments set descricao =
  'Panificadora de bairro desde 1998. Pães, cucas e salgados do dia.'
where nome = 'Panificadora Estrela' and descricao is null;

update public.establishments set descricao =
  'Mercado de bairro em Moinhos de Vento. Frios, laticínios e hortifruti '
  'perto do fim da validade, com preço justo.'
where nome = 'Mercado Zaffari Moinhos' and descricao is null;
