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
| 🔵 | **Distâncias e tempo a pé** | Medidas do endereço que a pessoa salvou e marcou como principal (C7). Sem endereço salvo **não aparecem** — o app não sabe onde a pessoa está e não inventa. O cabeçalho pede o endereço em vez de mostrar um. Tempo a pé assume 80 m/min. |
| 🟡 | **Fotos das sacolas** | Placeholder listrado só quando a loja não subiu foto. O destaque e o topo do C3 mostravam o listrado mesmo havendo foto — corrigido. |
| ✅ | **"Disponível hoje" era texto fixo** | O feed agora separa Hoje e Amanhã, e cada tela lê o dia real da janela. Destaque ("última unidade") é só de hoje. |

## C1a / C1b — Busca

| Tipo | Item | Detalhe |
| --- | --- | --- |
| 🔵 | Buscas recentes | Ficam no `localStorage` do aparelho. Não seguem o usuário entre celulares. |
| 🔴 | **Resultado de busca não diz quando é a retirada** | O card compacto mostra nome, loja e preço — e mais nada. Com várias janelas da mesma sacola (migration 0028), a busca lista "Sacola Doces da Estrela · Panificadora Estrela · R$ 16,90" **três vezes**, sem nada que as diferencie: uma é hoje 16h30, as outras amanhã 07h30 e 09h30. Não é problema de layout — o card não tem onde quebrar; falta o dado. |
| ✅ | Página de loja na busca | Os resultados "Lojas" abrem `/loja/[id]`. |

## C2 — Descobrir (mapa)

| Tipo | Item | Detalhe |
| --- | --- | --- |
| ⚪ | **Filtro de raio** | O filtro tem janela, preço e categoria. Falta o raio. Agora é possível: o endereço do usuário existe (C7). |
| 🔴 | **"Meu local" não atualiza as distâncias** | Centraliza o mapa e marca sua posição, mas as distâncias saem do endereço salvo, não do GPS. |
| 🟣 | Mapa (CARTO) | Camada gratuita com atribuição. Conferir os termos antes de uso comercial. |

## C3 — Detalhe da sacola

| Tipo | Item | Detalhe |
| --- | --- | --- |
| ⚪ | **Foto da LOJA no C3** | O topo do C3 mostra a foto da sacola (correto). A foto do estabelecimento (`establishments.foto_url`) aparece na página da loja; não é usada no C3. |
| ✅ | **Podia mostrar janela vencida** | A tela agora resolve uma OFERTA pelo id dela, não "alguma oferta desta sacola". Não há mais para onde cair. |

## C4 — Reserva + pagamento

| Tipo | Item | Detalhe |
| --- | --- | --- |
| 🟡 | **Pagamento** | Nada é cobrado. O método escolhido é gravado (`orders.metodo_pagamento`) para a integração futura. A tela avisa isso. |
| 🟣 | Provedor de pagamento | Mercado Pago × Pagar.me ainda não decidido. |
| ✅ | **Reservar deslogado perde a sacola** | Corrigido. A causa estava no middleware, que apagava a query string em todo redirecionamento. O destino agora viaja como `?next=`, pelo login e pelo cadastro. |
| ✅ | "Hoje, 18h40 – 19h00" | Lê o dia real da janela. |

## C5 — Código de retirada

| Tipo | Item | Detalhe |
| --- | --- | --- |
| ⚪ | **QR code** | Removido de propósito: o antigo era falso (não codificava nada) e o P2 ainda não lê. Volta junto com a câmera. |
| ✅ | **"pago hoje, 14h20"** | Lê a data da reserva; pedido de semanas atrás mostra "28 jul, 14h20". |
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
| 🟡 | **Horário não é validado no formulário** | Nada impede publicar para as 22h se a loja fecha 19h30 — mas o P1 avisa depois ("sacola fora do seu horário"). Publicar para uma janela que já passou hoje **é** bloqueado: o formulário desabilita "Hoje" e a action recusa. |
| ⚪ | **Publicar para depois de amanhã** | Só hoje e amanhã, de propósito: comida excedente é imprevisível e uma loja que promete sacola para daqui a quatro dias cancela. |

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
| ✅ | **Editar um modelo muda sacolas já publicadas** | Resolvido pela migration 0024: a oferta guarda nome, preço, conteúdo, alérgenos e foto no momento em que é publicada. Editar o modelo agora só vale para a próxima. |
| ✅ | **Perfil público** | Feito: foto, descrição e horários, com página pública em `/loja/[id]`. |
| 🟡 | **Repasse e dados bancários** | A tela existe e salva (tabela `dados_bancarios`, só a própria loja lê). Nenhum repasse acontece — depende do provedor. |

## P6 — Cadastrar meu negócio

| Tipo | Item | Detalhe |
| --- | --- | --- |
| 🔴 | **CNPJ não é conferido** | Não valida formato, não consulta a Receita, não impede duplicado — duas lojas podem usar o mesmo, e o campo nem é obrigatório. O CPF do consumidor já é validado (dígitos verificadores) e é único; vale fazer o mesmo aqui. **Em 30/07 o formulário passou a avisar que não conferimos** — o aviso é o curativo, não a solução. Fazer de verdade precisa de migration (not null + único) e vai recusar loja já cadastrada sem CNPJ. |
| 🔴 | **Endereço não é conferido** | O cadastro já geocodifica, mas **em silêncio**: endereço que o geocoder não acha grava `lat`/`lng` nulos e a loja simplesmente nunca aparece no mapa, sem avisar ninguém. O formulário passou a dizer que não validamos (30/07); falta mostrar o resultado ("achamos este endereço — confere?") e recusar o que não resolve. Não precisa de migration. |
| 🔴 | **`bairro` nunca é preenchido** | O cadastro grava `endereco`, `lat` e `lng`, mas não o bairro — e não há tela que o edite depois. Só que o bairro **aparece** no feed, no detalhe, no mapa e no histórico (`[endereco, bairro].join(" — ")`). Loja cadastrada pelo P6 fica sem bairro para sempre. Os valores "Petropolis" que existiam vieram digitados à mão no editor do Supabase. |
| 🔴 | **Uma conta pode ter duas lojas** | Nada impede. Quando acontece, o Perfil público edita a **mais antiga** (`order created_at asc limit 1`, `parceiro-actions.ts:493`) e a segunda fica inalcançável. A migration 0014 já tinha esbarrado nisso. Faltam duas coisas: recusar o segundo cadastro, ou assumir várias lojas por conta e deixar escolher. |
| 🟣 | **Comissão** | Retirada da tela até você definir a taxa. Pagamentos não conseguem dividir sem ela. |
| 🟡 | Contrato de parceria | Página placeholder. |

---

# COMO O QUE NÃO EXISTE APARECE NA TELA

Desde 30/07 há **um** jeito só de dizer "isso ainda não funciona", em
`src/components/ui/em-breve.tsx`:

| Peça | Onde usar |
| --- | --- |
| `<SeloEmBreve>` | pílula âmbar num botão ou linha que aparece mas não age |
| `<LinhaEmBreve>` | linha de ajustes tracejada, apagada, sem toque |
| `<AvisoDemo>` | faixa no topo de uma página que vale ler mas não é real |

Âmbar é "em obra" e só isso — vermelho é para o que deu errado, e nada
disso deu errado. **Nada foi escondido**: quem vê o Desempenho entende o que
o produto vai ser; quem encontra um espaço vazio só acha que a tela quebrou.

Quando uma função ficar pronta, apagar o uso da peça é a limpeza inteira.

---

# TRANSVERSAL (vale para várias telas)

| Tipo | Item | Detalhe |
| --- | --- | --- |
| 🔴 | **Erro de consulta vira tela vazia** | Ainda vale para a maioria das funções: leem `const { data } = await …` e nunca olham o `error`, então uma falha aparece como "nada disponível". As novas (`getEnderecos`, `getAvaliacoes`, `getDadosBancarios`, `getLojaPublica`) já lançam erro em vez de mentir. Falta varrer as antigas. |
| ✅ | **Foto do estabelecimento** | Coluna `establishments.foto_url` + bucket `lojas` (0019). Falta usar no topo do C3. |
| ✅ | **Página de loja** | `/loja/[id]`, ligada no detalhe da sacola, na busca e no histórico. |
| ✅ | **Mesma sacola publicada duas vezes no mesmo dia** | Resolvido pela migration 0022: índice único parcial em `listings (bag_id, data, janela_inicio) where status = 'ativa'`. Nada foi apagado. |
| 🟡 | Catálogo de demonstração | As quatro lojas e suas sacolas são fictícias. A migration 0008 renova (as janelas expiram e o feed esvazia). |
| 🟡 | `/painel` (desktop do parceiro) | Totalmente em dados fictícios. Não fez parte do redesenho. |
| 🟡 | `/admin` (painel interno) | Totalmente em dados fictícios. Não fez parte do redesenho. |

---

# ANTES DE LANÇAR (não é funcionalidade)

| Item | Detalhe |
| --- | --- |
| Textos jurídicos | `/termos`, `/privacidade` e `/contrato-parceria` são placeholders. |
| Confirmação de e-mail | Desligada no Supabase por conveniência. Religar. |
| Política do Storage | ✅ Resolvido (migration 0027). As fotos vão para `{establishment_id}/{uuid}.{ext}` e a política só aceita a pasta de uma loja que você é dono — o caminho **é** a permissão. Os buckets também passaram a recusar arquivo acima de 5 MB e qualquer coisa que não seja imagem, no servidor e não só no formulário. Leitura continua pública nos dois: essas fotos aparecem no feed aberto. |
| Contas de teste | ✅ Limpas em 30/07. Ficaram `kristina.teste` (consumidor), `kristina.parceira` (parceira, dona da Domenica), `oksanapteste` e `varvarazteste`. Apagar todas antes do lançamento real. |
| ~~`design-v2` nunca foi para o ar~~ | ✅ Fundido no `main` em 30/07 (`f854f8c`). O redesenho **é** o site publicado — os placeholders desta lista estão no ar. |
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
