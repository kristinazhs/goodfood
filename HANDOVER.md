# GoodFood — handover

Written 2026-07-28 at the end of the design-v2 redesign; **updated
2026-07-30** after a long session of bug-fixing and follow-up features
(migrations 0019–0024). This file exists so a fresh Claude Code session (or
a new developer) can pick the project up without the previous conversation.

Read this, then `PENDENCIAS.md`. Trust both over any assumption.

---

## What GoodFood is

A "sacola surpresa" (surprise-bag) marketplace for surplus food in Porto
Alegre, Brazil — like Too Good To Go. Interface in Brazilian Portuguese,
mobile-first. Two user types: **consumidor** (buys bags) and
**estabelecimento/parceiro** (shops that publish them).

Kristina is a non-coder: she runs SQL in the Supabase dashboard and clicks
in the browser; the assistant writes all code and SQL, and explains in
small steps.

## Stack

Next.js 15 (App Router) + TypeScript + Tailwind 4 · Supabase (Postgres,
Auth, RLS, Storage) · Leaflet + CARTO tiles for the map · Vercel.

- Live: <https://goodfood-iota-swart.vercel.app> (auto-deploys from `main`)
- GitHub: `kristinazhs/goodfood`
- Supabase project: `https://kvfwnzhajqlbypozdadg.supabase.co`
  (URL is public and hardcoded in `src/lib/supabase-config.ts`; the anon key
  comes from `.env.local`, which is gitignored and must be copied by hand)

**Never put the service_role key in code, git or chat.**

---

## Where the work stands

**`design-v2` was merged into `main` on 2026-07-30** and is live. The
redesign *is* the product now; there is no longer a "previous version"
running anywhere. Work from `main` and branch off it.

### Design source

A Claude Design review, "GoodFood UX Review" — 16 screens (C0, C0b, C1–C7,
P1–P6). Kristina has the `.zip` (a `.dc.html` canvas) and a `.pptx` of the
same content. It preserves the existing palette and typography entirely;
every change is hierarchy, logic and flow. **There is no design-token pass
to do.**

### Screens rebuilt on `design-v2`

| Screen | State |
| --- | --- |
| C0 Abertura + C0b Cadastro | done |
| C1 Início (incl. C1a/C1b search) | done |
| C2 Descobrir (map) | done |
| C3 Detalhe | done |
| C6 Pedidos | done |
| P1 Hoje + P2 Retirada | done |
| P3 Publicar sacola | done |
| P5 Loja | done |
| P4 Desempenho | **demo only — not connected**, see `src/lib/parceiro-mock.ts` |
| P6 Cadastrar negócio | done |
| C7 Perfil | done — and it made the ★ ratings real |
| C4 Reserva + pagamento | done — payment itself is still simulated |
| C5 Código de retirada | done — includes cancelling inside the refund window |

**All 16 screens are built.** What remains is listed screen by screen in
`PENDENCIAS.md`: placeholders, dead controls, missing functions and known
defects. Read that file before planning any work.

### What changed on 2026-07-30

A "before I show this to partners" pass. Everything below is done, pushed
and verified in the browser unless stated:

- **Saved addresses (C7)** exist and drive *every* distance in the app. With
  no saved address the app shows **no distance at all** and the header asks
  for one — it never invents a location. The address button on the feed
  opens a picker (Casa / Trabalho / write a new one).
- **Public shop page** at `/loja/[id]`, editable by the shop under Loja →
  Perfil público (photo, description, hours). Linked from the sacola detail,
  search results and order history.
- **Reviews are real on the partner side** and can be answered. The reply is
  written through `responder_avaliacao()` so a shop can never edit the
  customer's rating or words. Consumers see the reply in Pedidos.
- **"Aberta" reads the registered schedule**, and P1 warns when a published
  window falls outside opening hours.
- **Shops can publish for TOMORROW** (today + tomorrow only). The feed groups
  Hoje / Amanhã; urgency ("última unidade") is today-only.
- **A published offer keeps its own terms** — see Product decisions.
- **Payout details** page (`dados_bancarios`), stored but not wired to any
  provider.
- **CPF + phone required** at signup and in Dados pessoais.
- Bug fixes: the splash animation, losing your sacola when logging in,
  duplicate React keys, sold-out map pins, the model-rewriting bug, models
  that could not be deleted.

### Ratings are real

The `reviews` table existed from migration 0001 and nothing ever wrote to
it, so every ★ was hardcoded to 4.8. C7 now writes reviews, and a shop with
none shows no star at all rather than an invented one.

### The two-sided loop works end to end

Verified on the redesigned screens: consumer reserves → order appears in the
partner's P1 queue with the customer's name → partner types the code in P2 →
"Entregar sacola" → consumer's order flips to "Retirado", stock decrements
atomically and the listing auto-closes when it hits zero.

---

## Product decisions already made

- **Payment is charged AT RESERVATION**, not at pickup (decided 2026-07-27).
  This reverses the original mockups and the comment in
  `supabase/migrations/0001` — treat that comment as stale.
  Refund window: 15 minutes after ordering, shown as a clock time.
- **Reservations close 15 minutes BEFORE the pickup window ends**, so someone
  passing the shop at 18h30 can still buy a bag whose window ends at 19h00.
  Enforced inside `reservar_sacola()` (migration 0009), shown on C3.
- **Photos** are real: uploaded on P3 to the `sacolas` storage bucket, shown
  on the consumer cards. Where a photo is missing, a striped placeholder is
  used — never a hidden element.
- **Commission rate is NOT settled.** The design put "25% por sacola vendida"
  on P6; it was removed deliberately. Don't reintroduce a rate until Kristina
  confirms one.
- **The bag type (categoria) lives on the sacola, not the shop.** The consumer
  filter reads the sacola. P6 no longer asks for a shop-level type.
- **A published offer carries its own terms** (migration 0024). `listings`
  stores nome, preço, categoria, conteúdos, alérgenos, foto and peso as they
  were *when it was published*. Editing the model afterwards only affects the
  NEXT one. This is not a nicety: it stops a price changing under someone who
  already paid, and stops an allergen list — a safety declaration — being
  rewritten retroactively.
- **The customer works with OFFERS, not templates.** `/consumidor/sacola/[id]`
  and the reservation key on the `listing` id. Keying on the bag meant two
  live windows of one sacola resolved to whichever the lookup picked.
- **A model is one you chose to keep** (migration 0023, `bags.modelo`).
  Publishing creates a bag because a listing needs one; that is not a model.
  "Remover dos modelos" clears the flag — it never deletes the bag, because
  `bags → listings` is ON DELETE CASCADE and would take published offers with
  it.
- **Publishing is capped at today + tomorrow.** Surplus food is unpredictable;
  a shop promising a bag four days out will cancel, and cancellations are what
  destroy trust in this category.
- **Cancellation stays a flat 15 minutes**, including for next-day pickups
  (decided 2026-07-30; Food to Save gives 5).
- **CPF and telefone are REQUIRED at signup** (decided 2026-07-30). This
  reverses the earlier decision that kept the phone out of signup — the
  comment about it in `auth-actions.ts` is stale. CPF is validated by its
  check digits, not against the Receita.

## Things deliberately left out, and why

Reintroduce these only when the data exists to support them:

- **Recommended price band on P3** ("faixa recomendada 50–70%") — no sales
  data behind it; a made-up benchmark would push shops to price against
  nothing.
- **P4's comparisons** ("média do RS: 89%", "sábado rende 2,3×") — need
  aggregate data across many establishments.
- **P1's discount alert** ("baixar para R$ 16,90?") — needs a per-day price
  override, because price lives on `bags` (the template), not on `listings`
  (the day). That changes pricing across the consumer app.
- **Google sign-in** — built and wired, but behind `GOOGLE_ATIVO = false` in
  `src/lib/auth-actions.ts`. Supabase builds a valid-looking OAuth URL even
  when the provider is disabled, so without the flag the user lands on raw
  JSON at supabase.co. Flip it only after enabling Google in Supabase.
- **Open/close shop switch** — still absent; "aberta" is derived from the
  registered schedule instead. Saved addresses and payout details are now
  **built** (see 2026-07-30 above).

## Known gotchas

- **Demo data expires.** Seed listings die once `janela_fim` passes and the
  pg_cron closes them, so the feed goes empty. Re-run migration **0008** —
  it is idempotent, uses real clock times, and rolls to tomorrow once passed.
- **Never run `npm run build` while the dev server is running** — it corrupts
  `.next`. Stop the preview first.
- **Don't ship code selecting a new column before the migration is run** —
  every consumer screen dies with Postgres error 42703. Hand over the
  migration first, or say plainly that the app is briefly broken.
- Benign server log `Invalid Refresh Token` on stale cookies — expected.
- Supabase **email confirmation is OFF** for convenience. Re-enable before
  launch.

## Migrations

`0001`–`0005` predate the redesign. `0006`–`0018` are the redesign's:

| # | What |
| --- | --- |
| 0008 | Demo refresh with real clock times + Doceria category (supersedes 0006/0007) |
| 0009 | `bags.alergenos` + the 15-minute reservation cutoff |
| 0010 | `bags.peso_kg` (drives "kg de comida que você salvou") |
| 0011 | `orders.cliente_nome` — the shop cannot read `profiles`, so the name is copied onto the order |
| 0012–0014 | Demo ownership plumbing so a partner account owns a shop with real activity |
| 0015 | `bags.foto_url` + the public `sacolas` storage bucket and policies |
| 0016 | `establishments.horarios` (jsonb, per weekday) + `whatsapp` |
| 0017 | Removes duplicate listings of the same bag on the same day |
| 0018 | `orders.metodo_pagamento` + `cancelar_reserva()` (15-min window, restores stock) |
| 0019 | `enderecos` table · `establishments.descricao`/`foto_url` · `reviews.resposta` + `responder_avaliacao()` · `dados_bancarios` table · `lojas` bucket |
| 0020 | Data API grants missed in 0019 (RLS narrows rows; it does not grant reach) |
| 0021 | `profiles.cpf`, unique where present |
| 0022 | Partial unique index: one live offer per bag per window |
| 0023 | `bags.modelo` — a model is one you chose to keep |
| 0024 | `listings` carries its own nome/preço/categoria/conteúdos/alérgenos/foto/peso |
| 0025 | `reservar_sacola()` charges the OFFER's price, not the model's |
| 0026 | Deliberate reset: test data cleared, demo catalog restored |

All have been run against the live database.

`supabase/inventario.sql` is not a migration — it is a read-only listing of
every account, shop, model, offer, order and stored photo, in one query.
Run it before any clean-up so the deleting is done with the contents in view.

**0025 is the lesson worth remembering.** 0024 froze each offer's terms onto
the listing and moved every *screen* to `listings.preco` — but not
`reservar_sacola()`, which kept reading `bags.preco`. So the half that showed
the price was fixed and the half that took the money was not: edit a model
after publishing and the customer was charged a price they were never shown.
When a value moves table, the RPCs move with it, not just the queries.

**Two rules learned the hard way:**
- RLS decides *which rows*; a table also needs a `grant` for the Data API to
  reach it at all (0020 exists because 0019 forgot).
- Anything private must not live on `establishments` — that table has a
  `public read` policy, which is why payout details got their own table.

## Pre-launch housekeeping

- Re-enable Supabase email confirmation.
- Delete the remaining test accounts. As of 2026-07-30 the database holds
  `kristina.teste` (consumer), `kristina.parceira` (partner, owns Domenica),
  `oksanapteste` and `varvarazteste`. The three `padaria.*` accounts and all
  test sacolas were removed by migration 0026.
- The whole demo catalog — four fictional shops in Bom Fim and Moinhos —
  is still what the live site shows.
- Write real `/termos`, `/privacidade` and `/contrato-parceria` — all three
  are placeholders saying the documents are being prepared.
- Tighten the storage policy: any signed-in user can currently upload to the
  `sacolas` bucket. Scope it per shop.
- `/painel` and `/admin` (desktop surfaces) are still on mock data and were
  not part of this redesign.
- Decide the commission rate.
- Decide the payment provider (Mercado Pago vs Pagar.me, marketplace split).

---

## Branches — where things stand, and what to do next

**Done, 2026-07-30:** `design-v2` was merged into `main` as one merge commit
(`f854f8c`) and pushed. Production and the product are the same thing again.

For most of this project the two had swapped places: `main` was the old
pre-redesign app, while `design-v2` held all 16 screens and migrations
0006–0026 and *was* the product. Because the Supabase project is shared and
those migrations had long since been run, `main` was not merely old code — it
was old code pointing at a **newer database**, and it had not broken only
because nobody was using it. That gap was the risk; merging closed it.

`design-v2` still exists and is now identical to `main`. It can be deleted
whenever; nothing points at it.

### The discipline to keep from here

The advice Kristina was given — `main` + `dev`, branch off `dev` — is the
classic "git flow". It is designed for teams shipping versioned releases with
QA gates. For one person with Vercel, it usually adds a merge step without
adding safety.

What Vercel already gives, free:

- every branch pushed gets its **own preview URL**
- `main` is production

So the lighter shape is:

```
main ────────●──────────●────────►  production
              \        /
               ●──────●              feature branch, own preview URL
```

- one short-lived branch per change (`fix/foto-do-topo`, `feat/raio-no-mapa`)
- test it on its preview URL
- merge into `main` when it works; delete the branch

Add a permanent `dev` branch only if a moment arrives where several changes
must sit finished-but-unreleased at the same time. That is a real need in a
team with release trains; it is rare for one person.

**The one rule that matters more than the branch shape:** a migration must be
run before the code that reads it is merged into `main`, or production breaks
with Postgres error 42703. Keep hand-running the SQL first.

That rule has teeth now. Until 2026-07-30 `main` was a branch nobody visited,
so getting the order wrong cost nothing. It is the live site today: merging
code that reads a column before the SQL has been run takes the real app down
for everyone.

## Resetting the data again

Migration 0026 is the reset, and it is re-runnable. Things it exists to
remember:

- `auth.users` is separate from `public.profiles`; deleting an account is done
  in the Supabase **Auth dashboard**, and the profile follows via the 0002
  trigger. Delete accounts *after* clearing their shops and orders — otherwise
  the cascade hits `orders.listing_id` and the delete fails on a foreign key.
- Order of deletion matters: `orders` → `listings` → `bags` → `establishments`,
  because `orders.listing_id` is ON DELETE RESTRICT (deliberate — an order is
  the record that money moved).
- Photos live in the `sacolas` and `lojas` buckets and are **not** removed by
  deleting rows. Clear them in Storage if you want them gone.
- `janela_hoje()` (from 0008) gives a clock time today, or tomorrow if it has
  already passed. Use it for any seeded window; that is what keeps the demo
  from going stale and from producing 23h10–01h10 windows.

## Next steps, in order

1. **Legal texts** — `/termos`, `/privacidade` and `/contrato-parceria` are
   placeholders and are now publicly reachable on the live site.
2. **Tighten the `sacolas` storage policy** — any signed-in user can upload.
3. Work through `PENDENCIAS.md`.
4. The two decisions that unblock payments: **commission rate** and
   **provider** (Mercado Pago vs Pagar.me).
