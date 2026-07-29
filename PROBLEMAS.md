# Known defects

Things that are **wrong**, as opposed to merely missing — see `PENDENCIAS.md`
for the mocks and gaps. Audited from the code on 2026-07-28.

Severity:

- **ALTA** — shows something untrue, or loses the user's work
- **MÉDIA** — confusing or dead-end, but nothing is lost
- **BAIXA** — cosmetic or fragile, no user impact today

---

## Fixed already

| # | Issue | Found by |
| --- | --- | --- |
| ✅ | **Locate button did nothing.** Its geolocation error callback was an empty function, so denied permission / timeout / unsupported browser all produced no feedback at all. | Kristina |
| ✅ | Locate button sat in an odd spot, unrelated to the other controls. | Kristina |
| ✅ | "Abertas agora" / "Até R$ 20" chips duplicated the filter sheet. | Kristina |
| ✅ | **"Publicar hoje" could publish the same bag twice a day**, so the consumer feed showed one sacola twice. | Kristina |
| ✅ | **Publishing created a duplicate `bags` row every time**, quietly undoing the template model. | audit |
| ✅ | **The shop couldn't see who was collecting** — `profiles` is readable only by its owner. | audit |
| ✅ | **Recommended price band checked the wrong quantity** (discount vs price share), so it would have called every healthy price too cheap. | audit |
| ✅ | **Fake QR code** on the pickup screen: a hardcoded matrix encoding nothing. | audit |
| ✅ | Star ratings were hardcoded to 4.8 everywhere. | audit |
| ✅ | Reservations were accepted until the window closed, contradicting the "reservas até HH:MM" the screen promised. | audit |

---

## Open — ALTA

### 1. "Hoje" is hardcoded on three screens, and can be wrong

`Disponível hoje` (C1), `Hoje, 18h40 – 19h00` (C4) and `Retire hoje entre…`
(C5) are literal text. Migration 0008 rolls a pickup window to **tomorrow**
once today's has passed, so the app currently tells people to collect "hoje"
food they can only collect tomorrow. A customer could turn up on the wrong
day.

*Fix:* derive the word from `janelaInicio` — "hoje", "amanhã", or the date.

### 2. Payment time on C5 always says "hoje"

`Total pago · Cartão · hoje, 14h20` uses a literal "hoje" with
`reserved_at`. Open an order from last week and it claims you paid today.

*Fix:* same date helper as above.

### 3. Failed queries look like empty screens

Eleven data functions read `const { data } = await …` and never inspect
`error`. If a query fails — RLS change, dropped column, network — the screen
renders its empty state ("Nenhuma sacola disponível agora") instead of
admitting a problem. This is exactly how the locate button hid its own
failure, and it's how the missing-`alergenos` outage first appeared.

*Fix:* read `error`, log it server-side, and show a distinct "algo deu
errado" state.

### 4. Reserving while logged out loses the sacola

`reservar()` redirects to `/consumidor/entrar` with no return path. After
logging in the person lands on the feed and has to find the sacola again —
having already chosen quantity and pressed pay. The design is explicit that
login should appear "com a sacola já escolhida".

*Fix:* pass `?next=` through login and return to the checkout.

---

## Open — MÉDIA

### 5. Two dead controls on P4

- The period chips (**7 dias / 30 dias / Ano**) are rendered as `<span>` and
  filter nothing.
- **"Responder"** on a review does nothing when tapped.

P4 is a demo screen, so this is defensible — but both look interactive.
*Fix:* disable them visually, or note they're part of the demo.

### 6. Detail screen can show a stale pickup window

`getSacolaPorId` falls back to *any* listing when none is active:
`.filter(status === "ativa")[0] ?? listings[0]`. Reaching an old sacola by
URL shows yesterday's window as though it were current. The reserve bar
correctly refuses, but only after the person has read the wrong times.

*Fix:* when no active listing exists, say the sacola isn't available rather
than showing an expired one.

### 7. Share falls back silently

If the phone has no share sheet *and* the clipboard is blocked,
`CompartilharPedido` sets `copiado = false` and says nothing. The person taps
and nothing happens — the same failure shape as the locate button.

*Fix:* show the message in a selectable box so it can always be copied by
hand.

### 8. Nothing stops a sacola being published outside opening hours

P6 captures hours per weekday, and P3 says "as janelas ficam dentro desse
horário" — but no check enforces it. A bag can be published for 22h00 when
the shop closes at 19h30.

*Fix:* validate the window against `establishments.horarios` on publish.

### 9. CNPJ accepts anything

Not format-checked, not verified, not unique. Two shops can register the same
CNPJ; "00" is accepted.

*Fix:* at minimum a format check and a uniqueness constraint.

---

## Open — BAIXA

### 10. C5 parses a formatted string to find the closing time

`pedido.janela.split("–")[1]` re-parses text that was just formatted from
`janelaFim`, which is available as an ISO timestamp. Works, but breaks if the
dash or format ever changes.

### 11. Distances are true only from one address

Every distance and walking time is measured from the fixed `ORIGEM`
(Av. Osvaldo Aranha, 540). Tapping "locate me" centres the map but does
**not** update them — so a shop can read "310m" while you stand elsewhere.
Resolved by saved addresses.

### 12. Walking time assumes 80 m/min

Flat rate, ignores hills and crossings. Fine as an estimate; worth saying
"≈" if it ever looks authoritative.

### 13. `peso_kg` defaults to 1.5 kg

Every "kg de comida que você salvou" inherits this for bags whose shop never
set a weight.

---

## Not defects, but worth deciding

- **Demo data expires** and the feed empties. Working as designed; re-run
  migration 0008. Consider a longer default window.
- **Preview only updates on push.** Bit us twice: a screen looked broken when
  it simply hadn't been pushed.
- **CARTO basemap** terms unverified for commercial use.
