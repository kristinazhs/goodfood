# GoodFood — o que ainda falta

Lista completa, tela por tela, de tudo que hoje é **placeholder**, **botão que
não faz nada**, **função que ainda não existe** ou **defeito conhecido**.
Levantado a partir do código em 2026-07-28, depois das 16 telas do design v2.

Tipo:

- 🟡 **placeholder** — aparece na tela mas não tem nada por trás
- ⚪ **não existe** — falta construir
- 🔴 **defeito** — está errado, não só ausente
- 🔵 **estimativa** — dado real, mas baseado numa suposição
- 🟣 **decisão** — depende de escolha de negócio, não de código

---

# LADO CONSUMIDOR

## C0 — Abertura (splash + entrada)

| Tipo | Item | Detalhe |
| --- | --- | --- |
| 🔴 | **Animação travada / com salto** | O verde deveria encolher suavemente até virar o cabeçalho. Hoje o movimento não está fluido. Precisa ser refeito — provavelmente animando `height`/`transform` em vez de trocar classes de layout. |

## C0b — Criar conta

| Tipo | Item | Detalhe |
| --- | --- | --- |
| ⚪ | **Entrar com Google** | Botão e fluxo prontos, desligados por `GOOGLE_ATIVO = false`. Falta ativar o provedor no Supabase (credenciais do Google Cloud). Depois é uma linha. |
| 🟡 | Termos de uso / política de privacidade | Páginas existem mas dizem que o texto está sendo preparado. Precisam de texto jurídico real. |

## C1 — Início (feed)

| Tipo | Item | Detalhe |
| --- | --- | --- |
| 🟡 | **Endereço "Av. Osvaldo Aranha, 540"** | Fixo no código (`ORIGEM`). Não é clicável e não há tabela de endereços salvos. |
| 🔵 | **Distâncias e tempo a pé** | Cálculo real a partir das coordenadas reais das lojas — mas sempre a partir daquele endereço fixo. Só valem para quem está no Bom Fim. Tempo a pé assume 80 m/min. |
| 🟡 | **Fotos das sacolas** | Placeholder listrado quando a loja não subiu foto. O upload já funciona (P3). |
| 🔴 | **"Disponível hoje" é texto fixo** | A janela pode ser de amanhã (a migration 0008 empurra para o dia seguinte). O app pode dizer "hoje" para comida que só sai amanhã. |

## C1a / C1b — Busca

| Tipo | Item | Detalhe |
| --- | --- | --- |
| 🔵 | Buscas recentes | Ficam no `localStorage` do aparelho. Não seguem o usuário entre celulares. |
| ⚪ | Página de loja | "Lojas" nos resultados leva para uma *sacola*, porque não existe página por estabelecimento. |

## C2 — Descobrir (mapa)

| Tipo | Item | Detalhe |
| --- | --- | --- |
| ⚪ | **Filtro de raio** | O filtro tem janela, preço e categoria. Falta o raio — só faz sentido junto com endereço do usuário. |
| 🔴 | **"Meu local" não atualiza as distâncias** | Centraliza o mapa e marca sua posição, mas os "310m" continuam medidos do endereço fixo. |
| 🟣 | Mapa (CARTO) | Camada gratuita com atribuição. Conferir os termos antes de uso comercial. |

## C3 — Detalhe da sacola

| Tipo | Item | Detalhe |
| --- | --- | --- |
| ⚪ | **Foto da loja (topo)** | As sacolas têm foto; **estabelecimentos não têm coluna de foto nenhuma**. |
| 🔴 | **Pode mostrar janela vencida** | Se a sacola não tem oferta ativa, a tela cai para qualquer oferta antiga e mostra o horário de ontem como se fosse hoje. O botão recusa, mas só depois. |

## C4 — Reserva + pagamento

| Tipo | Item | Detalhe |
| --- | --- | --- |
| 🟡 | **Pagamento** | Nada é cobrado. O método escolhido é gravado (`orders.metodo_pagamento`) para a integração futura. A tela avisa isso. |
| 🟣 | Provedor de pagamento | Mercado Pago × Pagar.me ainda não decidido. |
| 🔴 | **Reservar deslogado perde a sacola** | Manda para o login e volta para o feed — a pessoa já tinha escolhido quantidade e apertado pagar. |
| 🔴 | "Hoje, 18h40 – 19h00" | Texto fixo, mesmo problema do C1. |

## C5 — Código de retirada

| Tipo | Item | Detalhe |
| --- | --- | --- |
| ⚪ | **QR code** | Removido de propósito: o antigo era falso (não codificava nada) e o P2 ainda não lê. Volta junto com a câmera. |
| 🔴 | **"pago hoje, 14h20"** | Diz "hoje" mesmo em pedido de semanas atrás. |
| 🟡 | **"Peça pra um amigo"** | Compartilha mensagem com código e endereço de verdade — mas **não transfere o pedido** para outra conta. |
| 🔴 | Compartilhar pode falhar em silêncio | Sem share sheet e sem clipboard, o toque não faz nada visível. |
| 🔵 | "aberto até HH:MM" | Extraído de texto já formatado em vez do horário original. Funciona, mas é frágil. |

## C6 — Pedidos

| Tipo | Item | Detalhe |
| --- | --- | --- |
| 🔵 | "kg de comida que você salvou" | Usa `bags.peso_kg`, que é estimativa (padrão 1,5 kg). Ninguém pesa sacola surpresa. |
| 🟡 | Fotos | Mesmo placeholder do C1. |

## C7 — Perfil

| Tipo | Item | Detalhe |
| --- | --- | --- |
| ⚪ | **Endereços salvos** | Marcado "em breve". É o item de maior alavancagem: resolve também o endereço do C1, o raio do C2 e todas as distâncias. |
| ⚪ | **Formas de pagamento** | Depende do provedor. |
| ⚪ | **Notificações** | Não existe infraestrutura de push. É um projeto à parte, não uma tela. |
| 🟡 | **Ajuda e contato / Enviar feedback** | Hoje são links `mailto:` para contato@goodfood.app — não são formulários no app. O e-mail precisa existir e ser monitorado. |

---

# LADO ESTABELECIMENTO

## P1 — Hoje (fila do dia)

| Tipo | Item | Detalhe |
| --- | --- | --- |
| ⚪ | **Alerta de desconto** ("baixar para R$ 16,90?") | Precisa de preço por dia: hoje o preço mora no modelo (`bags`), não na oferta do dia (`listings`). Mexe no preço em todo o app do consumidor. |
| 🔵 | "aberta" no cabeçalho | Deduzido de existir oferta ativa. O interruptor abrir/fechar do design nunca foi feito (falta coluna `establishments.aberta`). |

## P2 — Retirada (leitura de código)

| Tipo | Item | Detalhe |
| --- | --- | --- |
| ⚪ | **Câmera / leitor de QR** | Digitar o código funciona e está testado ponta a ponta. A câmera precisa de biblioteca de QR e fluxo de permissão. |

## P3 — Publicar sacola

| Tipo | Item | Detalhe |
| --- | --- | --- |
| ⚪ | **Faixa de preço recomendada** | Removida de propósito — não há dados de venda para sustentar uma recomendação. |
| ⚪ | **Horário não é validado** | A tela diz que a janela fica dentro do horário da loja, mas nada impede publicar para as 22h se a loja fecha 19h30. |

## P4 — Desempenho e avaliações

| Tipo | Item | Detalhe |
| --- | --- | --- |
| 🟡 | **A tela inteira** | Todos os números vêm de `lib/parceiro-mock.ts`. Rotulada "Dados de exemplo" na própria tela. Feita para mostrar a parceiros. |
| 🔴 | **Chips 7 dias / 30 dias / Ano** | São texto, não filtram nada. |
| 🔴 | **Botão "Responder"** | Não faz nada ao ser tocado. Precisa de coluna de resposta nas avaliações. |
| ⚪ | "média do RS: 89%", "sábado rende 2,3×" | Precisam de dados agregados de várias lojas. Não dá para calcular com uma. |

## P5 — Loja

| Tipo | Item | Detalhe |
| --- | --- | --- |
| ⚪ | **Foto da loja** | Mesma coluna faltante do C3. |
| ⚪ | **Perfil público** | "Em breve", sem destino. |
| ⚪ | **Repasse e dados bancários** | "Ainda não configurado". Depende do provedor. |

## P6 — Cadastrar meu negócio

| Tipo | Item | Detalhe |
| --- | --- | --- |
| 🔴 | **CNPJ não é conferido** | Não valida formato, não consulta a Receita, não impede duplicado — duas lojas podem usar o mesmo. |
| 🟣 | **Comissão** | Retirada da tela até você definir a taxa. Pagamentos não conseguem dividir sem ela. |
| 🟡 | Contrato de parceria | Página placeholder. |

---

# TRANSVERSAL (vale para várias telas)

| Tipo | Item | Detalhe |
| --- | --- | --- |
| 🔴 | **Erro de consulta vira tela vazia** | Onze funções leem `const { data } = await …` e nunca olham o `error`. Se a consulta falha, aparece "Nenhuma sacola disponível agora" em vez de um aviso de erro. Foi assim que o botão "meu local" escondeu a própria falha. |
| ⚪ | **Foto do estabelecimento** | Não existe coluna. Afeta C3 e P5. |
| ⚪ | **Página de loja** | Não existe. Afeta busca (C1b) e histórico (C6). |
| 🟡 | Catálogo de demonstração | As quatro lojas e suas sacolas são fictícias. A migration 0008 renova (as janelas expiram e o feed esvazia). |
| 🟡 | `/painel` (desktop do parceiro) | Totalmente em dados fictícios. Não fez parte do redesenho. |
| 🟡 | `/admin` (painel interno) | Totalmente em dados fictícios. Não fez parte do redesenho. |

---

# ANTES DE LANÇAR (não é funcionalidade)

| Item | Detalhe |
| --- | --- |
| Textos jurídicos | `/termos`, `/privacidade` e `/contrato-parceria` são placeholders. |
| Confirmação de e-mail | Desligada no Supabase por conveniência. Religar. |
| Política do Storage | Qualquer usuário logado pode subir arquivo no bucket `sacolas`. Restringir por loja. |
| Contas de teste | `kristina.teste`, `padaria.teste`, `padaria.mapa`, `padaria.aranha` e a conta de parceiro criada nos testes. Apagar. |
| `design-v2` nunca foi para o ar | O redesenho só existe no localhost e na preview da Vercel. |
| Comissão e provedor | As duas decisões que travam pagamentos. |

---

# JÁ CORRIGIDO (para não voltar)

Botão "meu local" que falhava em silêncio · chips duplicados no mapa ·
"Publicar hoje" publicando a mesma sacola duas vezes no dia · publicação
criando modelo duplicado toda vez · loja sem conseguir ver quem retira ·
faixa de preço comparando a grandeza errada · QR falso · nota ★ fixa em 4,8 ·
reserva aceita depois do prazo que a tela prometia.
