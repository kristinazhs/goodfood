-- GoodFood — refresh the demo catalog with STAGGERED pickup windows
-- Paste into Supabase SQL Editor → Run. Safe to re-run any time the demo
-- goes stale (the seed sacolas expire once their window passes, by design).
--
-- Why this replaces the refresh in 0005:
--   0005 gave every seed listing the SAME window (now → now + 1 day). That
--   made the feed look uniform and, more importantly, it can't exercise the
--   new "Acabando agora" rule — which now only highlights a sacola when its
--   window closes within 90 min or 2 units or fewer remain.
--
-- Everything below is relative to now(), so the demo is correct whenever it
-- is run. Windows are deliberately different so the feed has a real shape:
--
--   Domenica Casa de Pães   1 un · closes in 45 min  -> the spotlight
--   Panificadora Estrela    3 un · in 2–4 h
--   Madrecita Bistrô        5 un · in 3–5 h
--   Mercado Zaffari         2 un · in 5–7 h          (scarce, but not urgent)

-- Domenica Casa de Pães — the urgent one (last unit, window closing).
update public.listings
set data                  = current_date,
    janela_inicio         = now() - interval '20 minutes',
    janela_fim            = now() + interval '45 minutes',
    quantidade_total      = 8,
    quantidade_disponivel = 1,
    status                = 'ativa'
where establishment_id = 'e0000000-0000-0000-0000-000000000001';

-- Panificadora Estrela
update public.listings
set data                  = current_date,
    janela_inicio         = now() + interval '2 hours',
    janela_fim            = now() + interval '4 hours',
    quantidade_total      = 6,
    quantidade_disponivel = 3,
    status                = 'ativa'
where establishment_id = 'e0000000-0000-0000-0000-000000000003';

-- Madrecita Bistrô
update public.listings
set data                  = current_date,
    janela_inicio         = now() + interval '3 hours',
    janela_fim            = now() + interval '5 hours',
    quantidade_total      = 6,
    quantidade_disponivel = 5,
    status                = 'ativa'
where establishment_id = 'e0000000-0000-0000-0000-000000000002';

-- Mercado Zaffari Moinhos
update public.listings
set data                  = current_date,
    janela_inicio         = now() + interval '5 hours',
    janela_fim            = now() + interval '7 hours',
    quantidade_total      = 5,
    quantidade_disponivel = 2,
    status                = 'ativa'
where establishment_id = 'e0000000-0000-0000-0000-000000000004';
