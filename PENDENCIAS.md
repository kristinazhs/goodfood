# What is still mocked, missing or approximate

Audit of the `design-v2` branch, 2026-07-28, after all 16 screens were built.
Compiled from the code, not from memory.

Legend:

- **MOCK** — looks real on screen, isn't backed by anything
- **MISSING** — visibly marked "em breve" or simply absent
- **ESTIMATE** — real data, but derived from an assumption worth revisiting
- **DECISION** — blocked on a business choice, not on code

---

## A. Consumer side

| Screen | Item | Type | Notes |
| --- | --- | --- | --- |
| C0b | Sign in with Google | MISSING | Fully built and wired, disabled behind `GOOGLE_ATIVO = false` in `auth-actions.ts`. Needs the Google provider enabled in Supabase. One line to flip. |
| C1 | Address "Av. Osvaldo Aranha, 540" | MOCK | `ORIGEM` in `lib/distancia.ts`. Not tappable, and there is no saved-addresses table. |
| C1/C2/C3 | Distances ("310m") and walking time | ESTIMATE | Real haversine from the shop's real coordinates — but measured from the fixed `ORIGEM` above, so they're only correct for someone standing there. Walking time assumes 80 m/min. |
| C2 | Filter sheet: raio and categoria | MISSING | "Abertas agora" and "Até R$ 20" **do work**. The design also lists radius and category, which aren't there. |
| C2 | Map tiles | DECISION | CARTO Positron, free tier, attribution included. Check their terms before commercial launch. |
| C3 | "foto da loja" hero | MISSING | Bags have photos (`bags.foto_url`, uploaded on P3). **Establishments have no photo column at all.** |
| C4 | Payment | MOCK | No money moves. Method chosen is stored (`orders.metodo_pagamento`) so the real integration has somewhere to reconcile. Screen says so explicitly. |
| C5 | QR code | MISSING | Removed on purpose — the old one was a hardcoded matrix encoding nothing, and P2 can't scan. Returns with the camera reader. |
| C5 | "Peça pra um amigo" | PARTIAL | Really shares a message with the code and address. It does **not** transfer the order to another account. |
| C7 | Endereços salvos | MISSING | Needs an addresses table; would also make C1's address real. |
| C7 | Formas de pagamento | MISSING | Follows the payment provider decision. |
| C7 | Notificações | MISSING | No push infrastructure exists at all — this is a separate build, not a screen. |
| C7 | Ajuda e contato / feedback | PARTIAL | Real `mailto:` links to contato@goodfood.app, not in-app forms. The address must exist and be monitored. |
| — | Store page | MISSING | Search results and order history link to a *sacola*, because there is no per-shop page. |

## B. Establishment side

| Screen | Item | Type | Notes |
| --- | --- | --- | --- |
| P1 | Discount alert ("baixar para R$ 16,90?") | MISSING | Needs a per-day price override: price lives on `bags` (template), not `listings` (the day). Changes pricing across the consumer app. |
| P1 | Shop open/closed | ESTIMATE | Derived from having active listings. The design's open/close switch was never built and needs an `establishments.aberta` column. |
| P2 | Camera / QR reader | MISSING | Typed code works and is verified end to end. The camera needs a QR library and a permission flow. |
| P3 | Recommended price band | MISSING | Removed deliberately — no sales data to support a benchmark. |
| P4 | **The entire screen** | MOCK | Every number from `lib/parceiro-mock.ts`. Labelled on screen as "Dados de exemplo". |
| P4 | Period chips (7 dias / 30 / Ano) | MOCK | Rendered as static spans — they don't filter anything. |
| P4 | "Responder" on a review | MOCK | The only button in the app that does nothing when tapped. Needs a replies column. |
| P4 | "média do RS: 89%", "sábado rende 2,3×" | MOCK | Need aggregate data across many establishments. Not computable from one shop. |
| P5 | Shop photo ("foto loja") | MISSING | Same missing column as C3's hero. |
| P5 | Perfil público | MISSING | Marked "em breve", no destination. |
| P5 | Repasse e dados bancários | MISSING | Marked "Ainda não configurado". Follows the provider decision. |
| P6 | CNPJ | PARTIAL | Stored as typed. **Not format-checked, not verified against Receita Federal, not deduplicated** — two shops can register the same CNPJ. |
| P6 | Commission rate | DECISION | Removed from the screen pending your decision. Payments cannot split without it. |
| P6 | Opening hours vs pickup windows | PARTIAL | Hours are captured per weekday (`establishments.horarios`). **Nothing yet stops a sacola being published for after closing time.** |

## C. Data-level assumptions

| Item | Type | Notes |
| --- | --- | --- |
| `bags.peso_kg` | ESTIMATE | Drives "kg de comida que você salvou". Defaults to 1.5 kg; nobody weighs a surprise bag. |
| Ratings | REAL | Now genuinely computed from `reviews`. A shop with no reviews shows no star. |
| Demo catalogue | MOCK | The four seed shops and their sacolas are fictional. Migration 0008 refreshes them. |
| Test accounts | — | `kristina.teste`, `padaria.teste`, `padaria.mapa`, `padaria.aranha`, plus the partner account created during testing. Delete before launch. |

## D. Outside the redesign entirely

| Item | Notes |
| --- | --- |
| `/painel` (desktop owner) | Entirely on `lib/mock-data.ts`. Untouched by design-v2. |
| `/admin` (internal dashboard) | Entirely on `lib/admin-mock-data.ts`. Untouched. |

## E. Pre-launch, not features

| Item | Notes |
| --- | --- |
| `/termos`, `/privacidade`, `/contrato-parceria` | Placeholder pages saying the documents are being prepared. Need real legal text. |
| Supabase email confirmation | Switched OFF for convenience. Re-enable. |
| Storage policy | Any signed-in user can upload to the `sacolas` bucket. Scope it per shop. |
| `design-v2` never merged | The redesign has never been on the live site. |
