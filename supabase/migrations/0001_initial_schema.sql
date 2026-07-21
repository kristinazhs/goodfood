-- GoodFood — initial database schema (step 1B)
-- Paste this whole file into Supabase: SQL Editor → New query → Run.
-- Safe to run once on a fresh project. "Success. No rows returned" = it worked.

-- =====================================================================
-- 1. PROFILES — one row per registered person, linked to Supabase auth.
--    A person is either a 'consumer' or an 'establishment' owner.
-- =====================================================================
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       text not null check (role in ('consumer', 'establishment')),
  nome       text,
  telefone   text,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- 2. ESTABLISHMENTS — a business (padaria, restaurante, mercado).
--    owner_id is null for now; we link it to a real account in step 1D.
-- =====================================================================
create table public.establishments (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid references public.profiles (id) on delete cascade,
  nome       text not null,
  cnpj       text,
  categoria  text check (categoria in ('padaria', 'refeicao', 'mercado')),
  endereco   text,
  bairro     text,
  lat        double precision,
  lng        double precision,
  horario    text,
  emoji      text,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- 3. BAGS — the RECURRING TEMPLATE of a surprise bag.
--    "Sacola Surpresa Doce": its name, price, description, contents.
--    This does NOT say how many are available today — that's a listing.
-- =====================================================================
create table public.bags (
  id               uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references public.establishments (id) on delete cascade,
  nome             text not null,
  descricao        text,
  categoria        text check (categoria in ('padaria', 'refeicao', 'mercado')),
  preco            numeric(10,2) not null,
  preco_original   numeric(10,2),
  emoji            text,
  cor_thumb        text,
  conteudos        jsonb not null default '[]',
  ativo            boolean not null default true,
  created_at       timestamptz not null default now()
);

-- =====================================================================
-- 4. LISTINGS — a specific day's offer of a bag.
--    "3 Sacola Surpresa Doce, today, pickup 18h40–19h00."
--    quantidade_disponivel is the number that stops overselling (step 2).
-- =====================================================================
create table public.listings (
  id                    uuid primary key default gen_random_uuid(),
  bag_id                uuid not null references public.bags (id) on delete cascade,
  establishment_id      uuid not null references public.establishments (id) on delete cascade,
  data                  date not null,
  janela_inicio         timestamptz not null,
  janela_fim            timestamptz not null,
  quantidade_total      integer not null check (quantidade_total >= 0),
  quantidade_disponivel integer not null check (quantidade_disponivel >= 0),
  status                text not null default 'ativa'
                          check (status in ('ativa', 'esgotada', 'encerrada')),
  created_at            timestamptz not null default now(),
  check (quantidade_disponivel <= quantidade_total)
);

-- =====================================================================
-- 5. ORDERS — a reservation made by a consumer.
--    codigo is the pickup code (e.g. GF-4827). Payment is charged at
--    pickup, so status tracks the whole lifecycle.
-- =====================================================================
create table public.orders (
  id           uuid primary key default gen_random_uuid(),
  listing_id   uuid not null references public.listings (id) on delete restrict,
  consumer_id  uuid not null references public.profiles (id) on delete cascade,
  quantidade   integer not null check (quantidade > 0),
  codigo       text not null unique,
  status       text not null default 'reservado'
                 check (status in ('reservado', 'retirado', 'nao_retirado', 'cancelado')),
  total        numeric(10,2) not null,
  reserved_at  timestamptz not null default now(),
  picked_up_at timestamptz,
  created_at   timestamptz not null default now()
);

-- =====================================================================
-- 6. REVIEWS — one rating per completed order.
-- =====================================================================
create table public.reviews (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null unique references public.orders (id) on delete cascade,
  establishment_id uuid not null references public.establishments (id) on delete cascade,
  consumer_id      uuid not null references public.profiles (id) on delete cascade,
  nota             integer not null check (nota between 1 and 5),
  comentario       text,
  created_at       timestamptz not null default now()
);

-- Indexes for the queries the app runs most often.
create index on public.bags (establishment_id);
create index on public.listings (establishment_id);
create index on public.listings (data);
create index on public.orders (consumer_id);
create index on public.orders (listing_id);
create index on public.reviews (establishment_id);

-- =====================================================================
-- SECURITY (Row Level Security)
-- Turn RLS on for every table, then declare who may see and change what.
-- Public catalog (establishments, bags, listings, reviews) is readable by
-- anyone. Private data (profiles, orders) is reachable only by the people
-- it belongs to. auth.uid() is the id of the currently logged-in user.
-- =====================================================================
alter table public.profiles       enable row level security;
alter table public.establishments enable row level security;
alter table public.bags           enable row level security;
alter table public.listings       enable row level security;
alter table public.orders         enable row level security;
alter table public.reviews        enable row level security;

-- Let the Data API roles reach the tables (RLS still filters the rows).
grant select on
  public.establishments, public.bags, public.listings, public.reviews
  to anon, authenticated;
grant select, insert, update, delete on
  public.profiles, public.establishments, public.bags,
  public.listings, public.orders, public.reviews
  to authenticated;

-- ---- profiles: you can only see and edit your own row ----------------
create policy "profiles: self read" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "profiles: self insert" on public.profiles
  for insert to authenticated with check (id = auth.uid());
create policy "profiles: self update" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ---- establishments: anyone can read, only the owner can change ------
create policy "establishments: public read" on public.establishments
  for select using (true);
create policy "establishments: owner insert" on public.establishments
  for insert to authenticated with check (owner_id = auth.uid());
create policy "establishments: owner update" on public.establishments
  for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "establishments: owner delete" on public.establishments
  for delete to authenticated using (owner_id = auth.uid());

-- ---- bags: anyone can read, only the owning establishment can change --
create policy "bags: public read" on public.bags
  for select using (true);
create policy "bags: owner write" on public.bags
  for all to authenticated
  using (exists (
    select 1 from public.establishments e
    where e.id = bags.establishment_id and e.owner_id = auth.uid()))
  with check (exists (
    select 1 from public.establishments e
    where e.id = bags.establishment_id and e.owner_id = auth.uid()));

-- ---- listings: anyone can read, only the owning establishment writes --
create policy "listings: public read" on public.listings
  for select using (true);
create policy "listings: owner write" on public.listings
  for all to authenticated
  using (exists (
    select 1 from public.establishments e
    where e.id = listings.establishment_id and e.owner_id = auth.uid()))
  with check (exists (
    select 1 from public.establishments e
    where e.id = listings.establishment_id and e.owner_id = auth.uid()));

-- ---- orders: the consumer who placed it, or the establishment it's for
create policy "orders: consumer or establishment read" on public.orders
  for select to authenticated using (
    consumer_id = auth.uid()
    or exists (
      select 1 from public.listings l
      join public.establishments e on e.id = l.establishment_id
      where l.id = orders.listing_id and e.owner_id = auth.uid()));
create policy "orders: consumer insert" on public.orders
  for insert to authenticated with check (consumer_id = auth.uid());
create policy "orders: consumer or establishment update" on public.orders
  for update to authenticated using (
    consumer_id = auth.uid()
    or exists (
      select 1 from public.listings l
      join public.establishments e on e.id = l.establishment_id
      where l.id = orders.listing_id and e.owner_id = auth.uid()));

-- ---- reviews: anyone can read, only the order's author can write ------
create policy "reviews: public read" on public.reviews
  for select using (true);
create policy "reviews: author insert" on public.reviews
  for insert to authenticated with check (
    consumer_id = auth.uid()
    and exists (
      select 1 from public.orders o
      where o.id = reviews.order_id and o.consumer_id = auth.uid()));
create policy "reviews: author update" on public.reviews
  for update to authenticated using (consumer_id = auth.uid()) with check (consumer_id = auth.uid());
