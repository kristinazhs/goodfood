# GoodFood — o que ainda falta

Lista completa, tela por tela, de tudo que hoje é **placeholder**, **botão que
não faz nada**, **função que ainda não existe** ou **defeito conhecido**.
Levantado a partir do código em 2026-07-28, depois das 16 telas do design v2.

Tipo:

- ✅ **feito** — resolvido depois do levantamento inicial
- 🟡 **placeholder** — aparece na tela mas não tem nada por trás
- ⚪ **não existe** — falta construir
- 🔴 **defeito** — está errado, não só ausente
- 🔵 **estimativa** — dado real, mas baseado numa suposição
- 🟣 **decisão** — depende de escolha de negócio, não de código

---

# LADO CONSUMIDOR

## C0 — Abertura (splash + entrada)

Nada pendente. A animação foi refeita em 2026-07-29 (ver *Já corrigido*).

## C0b — Criar conta

| Tipo | Item | Detalhe |
| --- | --- | --- |
| ⚪ | **Entrar com Google** | Botão e fluxo prontos, desligados por `GOOGLE_ATIVO = false`. Falta ativar o provedor no Supabase (credenciais do Google Cloud). Depois é uma linha. |
| 🟡 | Termos de uso / política de privacidade | Páginas existem mas dizem que o texto está sendo preparado. Precisam de texto jurídico real. |

## C1 — Início (feed)

| Tipo | Item | Detalhe |
| --- | --- | --- |
| 🔵 | **Distâncias e tempo a pé** | Agora medidas do endereço que a pessoa salvou e marcou como principal (C7). Quem está deslogado ou não salvou nenhum cai no endereço padrão do Bom Fim — e o rótulo na tela diz qual endereço está sendo usado. Tempo a pé assume 80 m/min. |
| 🟡 | **Fotos das sacolas** | Placeholder listrado quando a loja não subiu foto. O upload já funciona (P3). |
| 🔴 | **"Disponível hoje" é texto fixo** | A janela pode ser de amanhã (a migration 0008 empurra para o dia seguinte). O app pode dizer "hoje" para comida que só sai amanhã. |

## C1a / C1b — Busca

| Tipo | Item | Detalhe |
| --- | --- | --- |
| 🔵 | Buscas recentes | Ficam no `localStorage` do aparelho. Não seguem o usuário entre celulares. |
| ⚪ | Página de loja na busca | A página existe agora (`/loja/[id]`) e o nome da loja no detalhe da sacola leva até ela. Falta ligar os resultados de busca "Lojas" nela. |

## C2 — Descobrir (mapa)

| Tipo | Item | Detalhe |
| --- | --- | --- |
| ⚪ | **Filtro de raio** | O filtro tem janela, preço e categoria. Falta o raio. Agora é possível: o endereço do usuário existe (C7). |
| 🔴 | **"Meu local" não atualiza as distâncias** | Centraliza o mapa e marca sua posição, mas os "310m" continuam medidos do endereço fixo. |
| 🟣 | Mapa (CARTO) | Camada gratuita com atribuição. Conferir os termos antes de uso comercial. |

## C3 — Detalhe da sacola

| Tipo | Item | Detalhe |
| --- | --- | --- |
| 🟡 | **Foto da loja (topo)** | A coluna existe (`establishments.foto_url`, migration 0019) e a loja sobe a foto no Perfil público. Falta usá-la no topo do C3, que ainda mostra o padrão listrado. |
| 🔴 | **Pode mostrar janela vencida** | Se a sacola não tem oferta ativa, a tela cai para qualquer oferta antiga e mostra o horário de ontem como se fosse hoje. O botão recusa, mas só depois. |

## C4 — Reserva + pagamento

| Tipo | Item | Detalhe |
| --- | --- | --- |
| 🟡 | **Pagamento** | Nada é cobrado. O método escolhido é gravado (`orders.metodo_pagamento`) para a integração futura. A tela avisa isso. |
| 🟣 | Provedor de pagamento | Mercado Pago × Pagar.me ainda não decidido. |
| ✅ | **Reservar deslogado perde a sacola** | Corrigido. A causa estava no middleware, que apagava a query string em todo redirecionamento. O destino agora viaja como `?next=`, pelo login e pelo cadastro. |
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
| ✅ | **Endereços salvos** | Feito. Cadastrar, editar, remover e escolher qual vale. O principal é a origem de todas as distâncias do app. |
| ⚪ | **Formas de pagamento** | Depende do provedor. |
| ⚪ | **Notificações** | Não existe infraestrutura de push. É um projeto à parte, não uma tela. |
| 🟡 | **Ajuda e contato / Enviar feedback** | Hoje são links `mailto:` para contato@goodfood.app — não são formulários no app. O e-mail precisa existir e ser monitorado. |

---

# LADO ESTABELECIMENTO

## P1 — Hoje (fila do dia)

| Tipo | Item | Detalhe |
| --- | --- | --- |
| ⚪ | **Alerta de desconto** ("baixar para R$ 16,90?") | Precisa de preço por dia: hoje o preço mora no modelo (`bags`), não na oferta do dia (`listings`). Mexe no preço em todo o app do consumidor. |
| ✅ | "aberta" no cabeçalho | Agora lê o horário cadastrado (`establishments.horarios`), mostra "aberta até 19h30" / "fechada · abre 07h00", e avisa quando uma sacola cai fora do horário. Loja sem horário não recebe rótulo nenhum. |

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
| ✅ | **Botão "Responder"** | Feito, na tela Avaliações (G), com avaliações reais. A resposta aparece para o cliente. |
| ⚪ | "média do RS: 89%", "sábado rende 2,3×" | Precisam de dados agregados de várias lojas. Não dá para calcular com uma. |

## P5 — Loja

| Tipo | Item | Detalhe |
| --- | --- | --- |
| ✅ | **Perfil público** | Feito: foto, descrição e horários, com página pública em `/loja/[id]`. |
| 🟡 | **Repasse e dados bancários** | A tela existe e salva (tabela `dados_bancarios`, só a própria loja lê). Nenhum repasse acontece — depende do provedor. |

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
| 🔴 | **Erro de consulta vira tela vazia** | Ainda vale para a maioria das funções: leem `const { data } = await …` e nunca olham o `error`, então uma falha aparece como "nada disponível". As novas (`getEnderecos`, `getAvaliacoes`, `getDadosBancarios`, `getLojaPublica`) já lançam erro em vez de mentir. Falta varrer as antigas. |
| ✅ | **Foto do estabelecimento** | Coluna `establishments.foto_url` + bucket `lojas` (0019). Falta usar no topo do C3. |
| 🟡 | **Página de loja** | Existe: `/loja/[id]`. Ligada no detalhe da sacola. Falta ligar na busca (C1b) e no histórico (C6). |
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
reserva aceita depois do prazo que a tela prometia · abertura que saltava em vez
de deslizar (o verde ia direto de `100dvh` para `auto`, que não é animável, e o
logo trocava de alinhamento em vez de se mover).

Na leva de 2026-07-29 (lista "antes dos parceiros"): pin de loja esgotada que
abria uma sacola impossível de reservar · cancelamento sem confirmação, e que
caía em Pedidos em vez do Início · Dados pessoais sem barra de abas · Perfil
deslogado mostrando um perfil vazio · cadastro de negócio sem nenhuma
confirmação · avaliações repetidas em Desempenho e Avaliações · "categoria" no
Perfil público, que não é atributo de loja · "Salvar modelo" que voltava para o
próprio formulário.
