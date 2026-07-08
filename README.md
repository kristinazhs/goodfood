# GoodFood

Marketplace de "sacolas surpresa": conecta padarias, restaurantes e supermercados de Porto Alegre a consumidores que compram o excedente do dia com desconto.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Estrutura

- `/` — landing: escolha entre Consumidor e Estabelecimento
- `/consumidor/...` — feed, detalhe da sacola, checkout, pagamento (mock), confirmação, pedidos, perfil
- `/parceiro/...` — dashboard, desempenho, criar sacola, avaliações, perfil da loja
- `src/lib/mock-data.ts` — dados de exemplo (sem backend nesta fase)
- `mockups/` — mockups HTML de referência visual

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS 4 · pt-BR · mobile-first

Nesta fase não há backend, banco, auth nem pagamento real — o fluxo de pagamento é simulado.
