# Changelog — GERMINA

Todas as mudanças relevantes da fase de estabilização (Release Candidate).

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

---

## [RC.1] — Estabilização e padronização

### Resumo executivo

O front-end está **selado**: 34 rotas compilando, typecheck limpo, design system unificado e core
loop funcional de ponta a ponta — plantar → crescer → colher → ganhar XP → subir de nível →
desbloquear canteiro → comprar na loja → plantar de novo.

A auditoria de QA encontrou **17 pendências, das quais 5 blockers**. Todos os blockers, todos os
itens de atenção e os itens acionáveis de polimento foram resolvidos.

**O achado estruturante:** os cinco blockers eram a **mesma falha de modelagem** — um dado que
deveria ser derivado estava sendo armazenado, com mais de um lugar livre para alterá-lo. A
correção não foi corrigir cada sintoma, e sim adotar *single source of truth* com estado derivado.

| Persistido | Derivado |
|---|---|
| `xp` | `nivel_atual` |
| `plantado_em` | `fase` do cultivo |
| `ultimo_desafio_em` | `streak` |
| `quantidade` (catálogo) | textos e crédito da loja |

> **Nota para o backend:** persistir os derivados como colunas no Supabase faz os cinco bugs
> retornarem, agora com dados errados gravados.

---

### Corrigido — Lógica e Core Loop

#### `fix(core)` · O jardim nunca crescia — QA-01

`tempo_restante_segundos` era gravado ao plantar e **nunca decrementado**: não havia timer no
projeto inteiro. Uma semente ficava na fase `semente` para sempre e, como só um canteiro vinha
pré-semeado como `pronto`, **depois da primeira colheita não existia mais nenhuma colheita
possível**.

- `fase` deixou de ser armazenada e passou a ser derivada de `plantado_em` (epoch ms).
- Cálculo por **timestamp absoluto**: `(agora − plantado_em) + bonus_adubo_ms`. A planta cresce com
  o app fechado — um contador regressivo pausaria com a aba minimizada.
- `useEffect` com `setInterval` de 1s **apenas avança o relógio**; não muta terreno algum. Se o
  navegador estrangular o timer, nada se perde. `clearInterval` no cleanup.
- `agoraInicial` vem do Server Component: servidor e cliente derivam a mesma fase no primeiro
  render, evitando erro de hidratação na virada de fase.
- Adubo **adianta o relógio** (`+90s`) em vez de encurtar contador.
- Guarda no handler: colher exige fase `pronto`, mesmo que a UI já esconda o botão.
- Contador regressivo visível em cada canteiro.

**Validado:** progressão conferida nos limites exatos (59s/60s, 179s/180s, 359s/360s, 599s/600s);
salto de 10 min sem nenhum tick chega a `pronto`; colheita antecipada bloqueada.

#### `fix(gamificacao)` · Nível congelado e teto de XP — QA-02, QA-04

Três handlers faziam `xp: prev.xp + N` sem recalcular o nível. Simulando 60 colheitas: 5.250 XP
com `nivel_atual` travado em 5. Como o desbloqueio compara `nivel_atual >= nivel_necessario`, os
**canteiros 6, 7 e 8 nunca abriam**.

- Novo `lib/gamificacao.ts`. `aplicarGanho()` é a **única** função autorizada a escrever em `xp` e
  `nivel_atual`.
- Um **terceiro** ponto de mutação foi descoberto durante a correção (`InicioClient.tsx`) e
  centralizado junto. Varredura atual: zero mutações soltas.
- `calcularNivel()` **satura no Nível 8** para qualquer XP ≥ 5.000. O XP acumulado **não é
  truncado** — serve de base para ranking e estatísticas da dissertação.
- `BarraXP` exibe "Nível máximo" no lugar da fração ao atingir o teto.
- Guardas: XP negativo é contido em 0; `NaN` cai no nível 1.
- Promoção de nível passou a ser anunciada — antes acontecia em silêncio.

| | Antes | Depois |
|---|---|---|
| `nivel_atual` após 60 colheitas | 5 (congelado) | 8 |
| Canteiros liberados | 5/8 | 8/8 |

#### `fix(loja)` · Economia creditava menos que o anunciado — QA-03

O modal anunciava "+3 adubos" e "+5 sementes"; o handler creditava **1**. A quantidade existia em
três lugares independentes — texto do card, texto do toast e `+ 1` chumbado — sem nada que os
obrigasse a concordar.

- Novo `lib/loja.ts` como fonte única. `quantidade` virou dado; textos e crédito são **derivados**.
- Contrato alterado de `onComprarItem(tipo, custo, nome)` para `onComprarItem(itemId)`: preço e
  quantidade não trafegam mais pela UI.
- O card passou a **exibir** o retorno antes da compra — o dado existia e nunca era renderizado.

#### `fix(gamificacao)` · Ofensiva contava sessão, não dia — QA-05

`jaCompletouHoje` era `useState(false)`: recarregar a página permitia **inflar a ofensiva
infinitas vezes no mesmo dia**.

- Novo `lib/ofensiva.ts`. `streak` derivado de `ultimo_desafio_em` (data local `YYYY-MM-DD`).
- **Data-only, não timestamp:** ofensiva é regra de calendário — 23h50 de segunda e 00h10 de terça
  são dois dias seguidos.
- **Fuso horário local, não `toISOString()`.** Verificado em `TZ=America/Manaus` (UTC-4):

  | Hora local | `diaLocal()` | `toISOString()` |
  |---|---|---|
  | 20:30 | 2026-08-17 | **2026-08-18** |
  | 23:50 | 2026-08-17 | **2026-08-18** |

  Com UTC, **todo estudo após as 20h em Itacoatiara cairia no dia seguinte**, quebrando a ofensiva
  de quem estuda à noite.
- `diferencaEmDias()` ancora ao meio-dia UTC: horário de verão nunca vira a contagem.
- Data futura (relógio adiantado) é tratada como "hoje", em vez de quebrar a sequência.

**Validado:** concluir + 10 reloads mantém streak em 5 (antes ia a 15); virada de mês, de ano e
ano bissexto conferidos.

---

### Alterado — Design System e UI/UX

#### `style(ui)` · Erradicação de valores legados — QA-08, QA-09

| Métrica | Antes | Depois |
|---|---|---|
| Hex legados (`#2f4d38`, `#8fb996`…) | 191 | **0** |
| Chamadas `var(--color-*)` | 68 | **0** |
| `font-black` / `font-extrabold` | 24 | **0** |

Migração em 5 lotes, 21 arquivos: Herbário e Ficha Botânica → Perfil → Dashboard e Comunidade →
Configurações → Desafio Diário.

Cada lote foi validado por **comparação estrutural**: os arquivos foram confrontados com a versão
anterior removendo o conteúdo de todo `className`. Estruturas idênticas em todos — nenhuma regra
de negócio, hook, import ou JSX alterado.

Cores semânticas preservadas (âmbar RENISUS, esmeralda sucesso, vermelho destrutivo).

#### `style(ui)` · Contraste WCAG — QA-09

O `GER-UI-07` alterou os **valores** dos tokens sem que o Desafio Diário fosse revisado; aquelas
telas herdaram cores novas sem revisão visual. Razões de contraste foram **calculadas**, não
estimadas:

| Uso | Antes | Depois |
|---|---|---|
| Rótulo desabilitado `blue-deep/30` | **1,89:1** ❌ | 4,05:1 |
| Legenda `blue-deep/50` | **3,19:1** ❌ | 4,76:1 ✅ |
| Rótulo `blue-deep/60` | **4,29:1** ❌ | 4,76:1 ✅ |
| Badge sobre `surface-alt` | 4,31:1 ❌ | 8,85:1 ✅ |

Achado do teste: `ink-muted` passa sobre branco (4,76:1) mas **reprova sobre `surface-alt`**
(4,31:1) — onde o fundo é `surface-alt`, o texto subiu para `green-deep`.

**Duas colisões semânticas resolvidas:**
1. O banner de resposta incorreta usava `bg-blue-main` — a mesma cor do botão primário. Um painel
   de feedback com a cor de "avançar" sugere clique onde não há clique. Passou a `bg-blue-deep`.
2. "Próxima pergunta" era verde, mas avança um fluxo → passou a azul primário.

A barra de progresso do quiz passou de azul para verde, alinhada ao resto do app.

> O botão desabilitado fica em 4,05:1 **de propósito**: a WCAG 1.4.3 isenta componentes inativos, e
> forçá-lo a 4,5:1 o faria parecer clicável.

#### `fix(ui)` · Responsividade — QA-10, QA-13

**Colisão de rótulos no mobile.** Em 360px cada canteiro tem ~96px com gap de 8px; a pílula
"Desbloqueie no nível 6" media ~130px e **transbordava 34px** sobre o canteiro vizinho. A medição
revelou que o estado *vazio* era pior: "Estude uma planta na Biblioteca", ~175px, **79px de
transbordo**.

Resolvido por **troca de texto por breakpoint**, não truncamento — cortar com reticências
esconderia justamente o número:

| Breakpoint | Bloqueado |
|---|---|
| mobile | `Nível 6` |
| `sm` | `Desbloqueie no nível 6` |
| `md` | `Desbloqueie no nível 6 · Flor da Saúde` |

`max-w-full truncate` como trava estrutural: a colisão passa a ser impossível por construção.

**Container ultrawide.** `max-w-5xl` deixava 1.280px vazios em 2560px. Expansão escalonada
(`max-w-5xl xl:max-w-6xl 2xl:max-w-7xl`) — pular direto para `7xl` esticaria as linhas das fichas
botânicas além do confortável para leitura. O `Header` usava `max-w-7xl` fixo contra o `max-w-5xl`
do conteúdo e foi alinhado à mesma cadeia.

#### `fix(herbario)` · Filtros derivados do catálogo — QA-07

Os botões de categoria estavam chumbados em 5 valores, mas o catálogo tem 6: **Amora, Abacate e
Cuia-mansa** eram inalcançáveis por filtro. A lista passou a ser derivada com contagem por
categoria — acrescentar uma categoria a uma ficha faz o botão aparecer sozinho, e a contagem torna
impossível existir botão vazio.

---

### Adicionado

#### `fix(rotas)` · Termos de Uso e Política de Privacidade — QA-06

Quatro links apontavam para rotas inexistentes (404).

- Criadas `app/termos/` e `app/privacidade/` **fora do grupo `(app)`**: os links partem do splash e
  do cadastro, onde o usuário ainda não tem conta. Dentro de `(app)`, herdariam header com XP,
  sidebar e bottom nav, e chamariam `getPerfil()` para quem não se cadastrou.
- Conteúdo sem texto jurídico inventado: aviso de elaboração + o vínculo com a pesquisa +, nos
  Termos, o alerta de que o conteúdo botânico **não substitui orientação médica ou farmacêutica**,
  coerente com a diretriz da ANVISA que abre a curadoria.
- `BotaoVoltar` como Client Component isolado, com `router.back()` e `fallbackHref` para acesso
  direto por URL.

**Auditoria completa:** os 12 hrefs internos foram cruzados contra as 18 rotas — nenhum órfão.

#### Acessibilidade

- `:focus-visible` global — antes havia `focus:outline-none` sem nada no lugar, deixando a
  navegação por teclado sem indicação.
- `prefers-reduced-motion` respeitado.
- `role="progressbar"` com `aria-valuenow/min/max` nas barras de XP e de missões.
- `sr-only` nos rótulos responsivos do Jardim: leitores de tela recebem a frase completa, não a
  versão curta do mobile.
- `aria-current="page"` nos itens de navegação ativos.
- Modais com `role="dialog"`, `aria-modal`, fechamento por `Esc`, trava de scroll e foco ao abrir.
- Alvos de toque com altura mínima de 56px na BottomNav.
- `maximumScale: 5` — o zoom não é travado.

#### `style(ui)` · Remoção de texto de desenvolvedor — QA-16

`"Em breve — mover o fluxo do Login pra cá"` aparecia na tela de Configurações. Substituído por
`"Disponível em breve"` — e não simplesmente removido, porque o `onClick` do item é um no-op: um
subtítulo comum faria o item parecer funcional e não fazer nada ao toque.

---

## Pendente

### Backend — maior bloco restante
- `supabase/migrations/` vazia: nenhuma tabela criada.
- Todo `lib/queries/*` retorna mock. As assinaturas já estão no formato final.
- Supabase Auth não conectado (telas prontas).

### Produto — decisão da autora
- Economia sem sumidouro: colher dá +2 sementes e plantar custa 1.
- Erro no quiz concede 5 pontos; espécies RENISUS não valem XP dobrado no quiz.
- Fonte tipográfica: Inter é provisória.

### Conteúdo — validação científica
- Cumaru: campo "Dados sobre o uso" descreve a composição do óleo, não um preparo.
- Cuia-mansa: "escassez de material" em fitoquímica e contraindicações.
- Boldinho japonês: *Mentha alverensis* (tabela) × *Mentha arvensis* (ficha).
- Cidreira: crédito de foto aponta para a página da Terramicina.
- Validação das 60 perguntas pelo Comitê Ad Hoc (planilha em `docs/`).

---

## Anterior — desenvolvimento

- Banco de perguntas ampliado de 9 para **60** (15 espécies × 4 eixos), todas com `campo_fonte` e
  citação literal da curadoria.
- Eixos criados: **Segurança e Contraindicação** e **Identificação Botânica**.
- Trilha de evolução de 6 para **8 níveis**, unificando as duas versões divergentes dos protótipos.
- **Scanner IA descontinuado** e removido por completo.
- Jardim reconstruído como cena em SVG plano, com canteiros elípticos e três estados
  componentizados.
- 16 cards de refatoração de UI (`GER-UI-01` a `GER-UI-16`) concluídos em 4 sprints.
