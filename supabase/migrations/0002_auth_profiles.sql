-- GoodFood — auth: auto-create a profile on signup (step 1D)
-- Paste into Supabase SQL Editor → Run, after 0001_initial_schema.sql.
--
-- When someone signs up, Supabase creates a row in auth.users. This trigger
-- then creates the matching public.profiles row, reading the role/name/phone
-- the app attaches to the signup as "user metadata".

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role, nome, telefone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'consumer'),
    new.raw_user_meta_data ->> 'nome',
    new.raw_user_meta_data ->> 'telefone'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
