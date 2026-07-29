-- GoodFood — Data API grants for the two tables added in 0019
-- Paste into Supabase SQL Editor → Run.
--
-- Missed in 0019. Row level security decides WHICH ROWS a role may see, but
-- it only ever narrows what a role can already reach: without a table grant
-- the request is refused before any policy is consulted, with
-- "42501 permission denied for table". Migration 0001 does this explicitly
-- for the original tables; these two need the same.
--
-- Neither table gets anything for anon. Saved addresses and payout details
-- are private by definition, and a signed-out visitor has no business
-- reaching either — the policies in 0019 already restrict rows to the owner,
-- and this keeps the door shut one step earlier.

grant select, insert, update, delete on
  public.enderecos, public.dados_bancarios
  to authenticated;
