-- GoodFood — what is actually in the database right now
-- Paste into Supabase SQL Editor → Run. READ-ONLY: this changes nothing.
--
-- Written to be run BEFORE any clean-up, so the deleting is done with the
-- real contents in view instead of from memory. It is one single query on
-- purpose — the SQL Editor only shows the result of the last statement, so
-- several separate SELECTs would hide everything but the last one.
--
-- Read the result top to bottom: contas → lojas → modelos → ofertas →
-- pedidos → resto.

with contas as (
  select
    1 as ordem,
    'CONTA' as secao,
    coalesce(u.email, '(sem e-mail)') as item,
    coalesce(p.role, '(sem profile)') || ' · ' || coalesce(p.nome, 'sem nome')
      || ' · criada ' || to_char(u.created_at at time zone 'America/Sao_Paulo', 'DD/MM')
      as detalhe
  from auth.users u
  left join public.profiles p on p.id = u.id
),
lojas as (
  select
    2, 'LOJA', e.nome,
    coalesce(e.bairro, 'sem bairro')
      || ' · dono: ' || coalesce((select email from auth.users where id = e.owner_id), 'NINGUÉM')
      || ' · ' || (select count(*) from public.bags b where b.establishment_id = e.id) || ' sacolas'
      || ' · ' || (select count(*) from public.listings l where l.establishment_id = e.id) || ' ofertas'
      || case when e.id::text like 'e0000000%' then ' · DEMO' else '' end
  from public.establishments e
),
modelos as (
  select
    3, 'SACOLA', b.nome,
    e.nome || ' · R$ ' || b.preco
      || case when b.modelo then ' · é modelo' else ' · não é modelo' end
      || ' · ' || (select count(*) from public.listings l where l.bag_id = b.id) || ' ofertas'
  from public.bags b
  join public.establishments e on e.id = b.establishment_id
),
ofertas as (
  select
    4, 'OFERTA', l.nome,
    e.nome || ' · ' || to_char(l.janela_inicio at time zone 'America/Sao_Paulo', 'DD/MM HH24hMI')
      || '–' || to_char(l.janela_fim at time zone 'America/Sao_Paulo', 'HH24hMI')
      || ' · R$ ' || l.preco
      || ' · ' || l.quantidade_disponivel || '/' || l.quantidade_total
      || ' · ' || l.status
  from public.listings l
  join public.establishments e on e.id = l.establishment_id
),
pedidos as (
  select
    5, 'PEDIDO', o.codigo,
    coalesce(o.cliente_nome, 'sem nome') || ' · ' || l.nome
      || ' · R$ ' || o.total || ' · ' || o.status
      || ' · ' || to_char(o.reserved_at at time zone 'America/Sao_Paulo', 'DD/MM HH24hMI')
  from public.orders o
  join public.listings l on l.id = o.listing_id
),
resto as (
  select 6, 'RESTO', 'avaliações',      count(*)::text from public.reviews
  union all
  select 6, 'RESTO', 'endereços',       count(*)::text from public.enderecos
  union all
  select 6, 'RESTO', 'dados bancários', count(*)::text from public.dados_bancarios
  union all
  select 6, 'RESTO', 'fotos em sacolas', count(*)::text from storage.objects where bucket_id = 'sacolas'
  union all
  select 6, 'RESTO', 'fotos em lojas',   count(*)::text from storage.objects where bucket_id = 'lojas'
)
select secao, item, detalhe from (
  select * from contas
  union all select * from lojas
  union all select * from modelos
  union all select * from ofertas
  union all select * from pedidos
  union all select * from resto
) t(ordem, secao, item, detalhe)
order by ordem, item;
