-- GoodFood — a model is something you chose to keep, not everything published
-- Paste into Supabase SQL Editor → Run.
--
-- Two reports, one cause:
--
--   "Published sacolas are saved as models even though Save model was not
--    pressed"
--   "Impossible to delete a model in Loja"
--
-- A listing points at a bag, so publishing HAS to create one. getModelos then
-- listed every bag the shop had ever had, which is why "Salvar modelo" looked
-- like it did nothing: publishing already did it. And there was no way to take
-- one out of the list again.
--
-- This column separates the two ideas. Deleting a bag was never the answer:
-- bags -> listings is ON DELETE CASCADE, so removing a model would silently
-- delete the offers published from it (and fail outright once any of those had
-- an order). Flipping this flag takes it out of the list and touches nothing
-- else.

alter table public.bags
  add column if not exists modelo boolean not null default false;

comment on column public.bags.modelo is
  'True when the shop explicitly saved this as a reusable model. Publishing '
  'creates a bag with false: it exists because a listing needs it, not '
  'because anyone asked to keep it. "Remover dos modelos" sets it back to '
  'false rather than deleting, which would cascade into published listings.';

-- Everything that exists today stays visible. The shop curates from here on;
-- nothing disappears from Loja the moment this runs.
update public.bags set modelo = true where modelo = false;

create index if not exists bags_modelo_idx
  on public.bags (establishment_id) where modelo;
