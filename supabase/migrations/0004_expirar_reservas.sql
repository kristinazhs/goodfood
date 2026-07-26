-- GoodFood — no-show automation (step D)
-- After a pickup window closes, un-picked-up reservations become "não
-- retirada" (charged no-show). This runs on a schedule via pg_cron, so no
-- user action is needed for it to happen.
-- Paste into Supabase SQL Editor → Run.

-- 1. Enable the scheduler extension.
--    If this line errors (permissions), enable "pg_cron" via
--    Database → Extensions in the Supabase dashboard, then re-run the rest.
create extension if not exists pg_cron;

-- 2. The expiry function: a reserved order whose listing's pickup window
--    ended more than 10 minutes ago becomes "não retirada". Runs with
--    elevated rights (security definer) because the scheduler has no user.
create or replace function public.expirar_reservas()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.orders o
  set status = 'nao_retirado'
  from public.listings l
  where o.listing_id = l.id
    and o.status = 'reservado'
    and l.janela_fim < now() - interval '10 minutes';
end;
$$;

-- 3. Schedule it every 10 minutes (replace any existing job of this name).
do $$
begin
  perform cron.unschedule('expirar-reservas');
exception
  when others then null; -- no existing job to remove
end $$;

select cron.schedule(
  'expirar-reservas',
  '*/10 * * * *',
  $$ select public.expirar_reservas(); $$
);

-- 4. Run it once now so it takes effect immediately.
select public.expirar_reservas();
