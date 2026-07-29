# GoodFood — handover

Written 2026-07-28, at the end of the design-v2 redesign work. This file
exists so a fresh Claude Code session (or a new developer) can pick the
project up without the previous conversation.

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

`main` holds the previous, working version. **All redesign work is on the
`design-v2` branch** and has never been merged.

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
- **Open/close shop switch**, **saved addresses**, **payout/bank details** —
  all shown as "em breve" rather than as dead controls.

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

All have been run against the live database.

## Pre-launch housekeeping

- Re-enable Supabase email confirmation.
- Delete test accounts and their sacolas (`kristina.teste`, `padaria.teste`,
  `padaria.mapa`, `padaria.aranha`, plus the partner account Kristina made).
- Write real `/termos`, `/privacidade` and `/contrato-parceria` — all three
  are placeholders saying the documents are being prepared.
- Tighten the storage policy: any signed-in user can currently upload to the
  `sacolas` bucket. Scope it per shop.
- `/painel` and `/admin` (desktop surfaces) are still on mock data and were
  not part of this redesign.
- Decide the commission rate.
- Decide the payment provider (Mercado Pago vs Pagar.me, marketplace split).
