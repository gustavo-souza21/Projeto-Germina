# GERMINA — Auditoria de UI / Gap Analysis

**Referência:** protótipos oficiais de Sarah Batista de Freitas (8 capturas + deck `GERMINA_Reference_SarahBFreitas`).
**Código auditado:** `germina-next` (107 arquivos, Next.js App Router + Tailwind v4).
**Data:** agosto/2026.

As cores da coluna "Como deve ficar" não foram estimadas a olho — foram **amostradas por pixel** dos PNGs de referência com Pillow. Os hex citados são os valores dominantes reais de cada elemento.

---

## Paleta extraída dos protótipos (fonte da verdade)

| Papel | Hex da referência | Onde aparece no protótipo | Token atual | Situação |
|---|---|---|---|---|
| Fundo base (off-white) | `#F9F8F6` | Fundo de todas as telas do app | `#f3f6f0` | ❌ atual é esverdeado, referência é neutro quente |
| Fundo auth | `#EBEAE6` | Telas de login/splash | — | ❌ inexistente |
| Superfície de card | `#FFFFFF` / `#FCFCFC` | Todos os cards | `#ffffff` | ✅ |
| **Azul profundo (CTA primário)** | `#0B2349` → `#192851` | "ENTRAR", "ENVIAR RESPOSTA", FAB central | `#16283f` / `#24506e` | ❌ tom errado e papel errado |
| Verde botânico (CTA secundário) | `#1F4C38` | "VER RECOMPENSAS", "RESPONDER" | `#2f4d38` | ⚠️ próximo, mas mais claro |
| Verde de sucesso / progresso | `#378328` | Checks da timeline, barra de XP | — | ❌ inexistente |
| Verde-lima (tag de status) | `#D4E5AF` | Tag "Estudada" nos canteiros | — | ❌ inexistente |
| Cinza de bloqueio | `#B8B8B8` | Níveis e canteiros bloqueados | `slate-300/400` | ⚠️ aproximado |

---

# PILAR 1 — Arquitetura de Layout

## 1.1 Header: barra verde escura com HUD de recursos ❌ CRÍTICO

**O que temos hoje**
`components/Header.tsx` renderiza uma barra `sticky` sólida em `#2f4d38` (verde escuro), com avatar em círculo, badge "Nv.7", e um painel de moeda com **quatro contadores** (sementes, adubo, moedas, ofensiva) em `#16283f/60`, mais um selo "GERMINA Offline Sync".

**Como deve ficar**
O header da referência é **branco/off-white** (`#FBFBFB`), com apenas três elementos: logo GERMINA à esquerda, uma **pílula única de XP** ("🌿 2.850 XP") e o avatar com nome + nível à direita. Não existe HUD de sementes/adubo/moedas no header em nenhuma das 8 capturas — esses recursos aparecem só dentro do Jardim. O "Offline Sync" não existe no design.

**Tarefa acionável**

> **GER-UI-01 — Reescrever o Header para o padrão claro da referência**
> - Trocar `bg-[#2f4d38] text-white` por `bg-[#FBFBFB]` com `border-b border-black/5`.
> - Remover do header: contadores de sementes, adubo e ofensiva; selo "Offline Sync"; badge "Nv.X" sobre o avatar.
> - Manter **apenas**: marca à esquerda, pílula de XP (`bg-[#F1F5EC] text-[#1F4C38] rounded-full px-3 py-1` com ícone de folha), avatar + nome + nível à direita.
> - Mover os contadores de recursos para dentro de `JardimConhecimento` (já existe uma barra de inventário lá — passa a ser a única).
> - Ajustar `HeaderBar.tsx` para não repassar mais `gameState.sementes/adubo/streak`.

## 1.2 Bottom Navigation sem o FAB central ❌ CRÍTICO

**O que temos hoje**
`BottomNav.tsx` renderiza 5 itens planos e equidistantes (Início, Biblioteca, Jardim, Comunidade, Perfil), todos com o mesmo tratamento.

**Como deve ficar**
Em **todas as 20+ telas mobile** da referência a barra tem a mesma assinatura: 5 alvos com um **botão circular flutuante (+) no centro**, elevado acima da barra, em azul profundo `#112C4A`, com sombra. Os rótulos da referência são: Início · Biblioteca · **(+)** · Comunidade · Perfil.

Repare que isso muda a contagem: **4 itens de navegação + 1 ação**, não 5 itens de navegação. O Jardim, nas capturas mais recentes (`192623`), é acessado pelo card do Início e pela sidebar no desktop — não ocupa slot na barra mobile.

**Tarefa acionável**

> **GER-UI-02 — Implementar a Bottom Nav com FAB central**
> - Reestruturar `NAV_ITEMS` para 4 entradas (Início, Biblioteca, Comunidade, Perfil) e renderizar o FAB entre a 2ª e a 3ª.
> - FAB: `w-14 h-14 rounded-full bg-[#112C4A] text-white shadow-lg -translate-y-5`, ícone `Plus` 24px, `aria-label="Ações rápidas"`.
> - Definir a ação do FAB com a Sarah antes de codar. A referência não deixa explícito; o candidato natural é abrir o **Desafio Diário**, que hoje não tem entrada fixa na navegação.
> - Compensar a elevação do FAB com `pb-28` no `<main>` do layout.

```tsx
// components/BottomNav.tsx — estrutura alvo
const NAV_ITEMS = [
  { href: '/inicio',     label: 'Início',     icon: Home },
  { href: '/biblioteca', label: 'Biblioteca', icon: BookOpen },
  null, // slot do FAB
  { href: '/comunidade', label: 'Comunidade', icon: MessageCircle },
  { href: '/perfil',     label: 'Perfil',     icon: User },
];

// no render, para o slot null:
<Link
  href="/desafio-diario"
  aria-label="Desafio diário"
  className="w-14 h-14 -translate-y-5 rounded-full bg-[#112C4A] text-white
             shadow-lg shadow-[#112C4A]/30 flex items-center justify-center
             ring-4 ring-[#F9F8F6] shrink-0"
>
  <Plus className="w-6 h-6" strokeWidth={2.5} />
</Link>
```

## 1.3 Sidebar de desktop existe no código, mas está órfã ❌ CRÍTICO

**O que temos hoje**
`components/Navigation.tsx` contém uma sidebar de desktop completa (logo, itens, rodapé institucional com selos ODS) — **e não é importada em lugar nenhum**. `app/(app)/layout.tsx` usa só `HeaderBar` + `BottomNav`, o que significa que **em desktop o app exibe a barra inferior de celular**, esticada na largura toda.

**Como deve ficar**
As capturas `192623` e `192641` mostram o layout desktop: sidebar fixa à esquerda (~256px) com avatar + nível + barra de XP no topo, 9 itens de menu, e abaixo um card "Seu progresso" com badge hexagonal, XP e botão "VER RECOMPENSAS", terminando num bloco de 3 estatísticas (15 espécies estudadas · 15 plantas no herbário · 7 espécies raras RENISUS).

**Tarefa acionável**

> **GER-UI-03 — Ligar a sidebar no layout e torná-la responsiva**
> - Em `app/(app)/layout.tsx`: renderizar `<Sidebar>` com `hidden md:flex` e `<BottomNav>` com `md:hidden`.
> - Refatorar `Navigation.tsx`: hoje ele mistura bottom-nav e sidebar no mesmo arquivo e usa callbacks (`activeTab`/`onTabChange`) incompatíveis com o App Router. Extrair só a parte `<aside>` para `components/Sidebar.tsx`, trocando os `<button onClick>` por `<Link href>` + `usePathname()`, no mesmo padrão do `BottomNav`.
> - Acrescentar à sidebar o card "Seu progresso" e o bloco de 3 estatísticas da referência.
> - `<main>` passa a `md:ml-64`.
> - Deletar o `Navigation.tsx` antigo após a extração — código morto que já divergiu do resto (ainda usa hex soltos e o padrão de abas).

## 1.4 Cards com borda verde em vez de sombra neutra ⚠️ MÉDIO

**O que temos hoje**
Padrão repetido em ~40 lugares: `bg-white rounded-2xl border border-[#8fb996]/30 shadow-sm` — a borda verde-clara é visível e define o card.

**Como deve ficar**
Nos protótipos o card é definido pela **sombra**, não pela borda: fundo `#FFFFFF`, raio ~16px, sombra difusa e baixa opacidade, e no máximo uma hairline neutra. A borda verde dá ao conjunto um aspecto de "formulário" que a referência não tem.

**Tarefa acionável**

> **GER-UI-04 — Criar o primitivo `<Card>` e padronizar a superfície**
> - Criar `components/ui/Card.tsx` com `bg-white rounded-2xl shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)] border border-black/[0.04]`.
> - Substituir as ~40 ocorrências do padrão manual. Fazer em uma única PR, com busca por `border-[#8fb996]/30`.

## 1.5 Banners com gradiente diagonal não existem no design ⚠️ MÉDIO

**O que temos hoje**
`InicioDashboard.tsx` abre com `bg-gradient-to-r from-[#2f4d38] via-[#4d7a52] to-[#24506e]`, emoji 🌿 gigante em `opacity-10` no canto, e pílula "Jardim do Conhecimento Botânico". `JardimConhecimento.tsx` abre com bloco sólido `#2f4d38`.

**Como deve ficar**
O protótipo abre a tela de Início com **texto sobre o fundo off-white**: "Olá, Ana! 🌿" em verde escuro, subtítulo cinza, e logo abaixo o card branco de nível. Nenhuma das 8 capturas usa gradiente de três cores nem emoji decorativo em marca-d'água.

**Tarefa acionável**

> **GER-UI-05 — Remover os banners em gradiente**
> - Em `InicioDashboard` e `JardimConhecimento`, trocar o bloco colorido por um cabeçalho de texto simples: `<h1>` em `text-[#1F4C38] text-2xl font-bold` + `<p>` em `text-slate-500 text-sm`.
> - Remover o emoji decorativo em `opacity-10` e a pílula "Jardim do Conhecimento Botânico".

---

# PILAR 2 — Identidade Visual e Tipografia

## 2.1 Fundo base com tonalidade errada ⚠️ MÉDIO

**O que temos hoje** `--color-bg-base: #f3f6f0` — off-white **esverdeado**.
**Como deve ficar** `#F9F8F6` no app e `#EBEAE6` nas telas de autenticação — off-white **neutro quente**. A diferença é sutil isolada, mas com verde por cima o fundo atual "puxa" a tela inteira para o verde e reduz o contraste dos cards brancos.

## 2.2 Cor do botão primário invertida ❌ CRÍTICO

**O que temos hoje**
Contagem real no código: **26 usos de `bg-[#2f4d38]` (verde) contra 8 de `bg-[#24506e]` (azul)**. Os CTAs principais — "Plantar", "Comprar Sementes", "Aceitar Desafio" — são verdes.

**Como deve ficar**
O briefing e os protótipos são consistentes: **azul profundo é a cor da ação primária**. "ENTRAR" (`#0B2349`), "ENVIAR RESPOSTA" (`#192851`) e o FAB (`#112C4A`) são todos azul-marinho. O verde é reservado a **elementos naturais e a estados de sucesso**: "VER RECOMPENSAS" (`#1F4C38`), checks de progresso, tags de planta estudada.

Essa é a divergência de identidade visual mais visível do projeto: hoje o app inteiro lê como monocromático verde, e o azul — que a referência usa como âncora de ação e é metade da identidade da marca (as raízes de circuito do logo) — quase não aparece.

**Tarefa acionável**

> **GER-UI-06 — Inverter a hierarquia de cor dos botões**
> - Criar `components/ui/Button.tsx` com três variantes: `primary` (`bg-[#12294E] hover:bg-[#0B2349] text-white`), `secondary` (`bg-[#1F4C38] hover:bg-[#173A2B] text-white`) e `ghost` (`bg-transparent text-[#12294E] border border-black/10`).
> - Regra de aplicação: ação que **avança um fluxo** (entrar, enviar resposta, confirmar, comprar) → `primary` azul. Ação **sobre o organismo vivo** (plantar, adubar, colher) e confirmação de sucesso → `secondary` verde.
> - Migrar os 26 botões verdes conforme a regra. Auditar caso a caso, não com find/replace cego.

## 2.3 Tokens declarados mas não usados ⚠️ MÉDIO

**O que temos hoje**
`app/globals.css` declara 7 tokens em `@theme`, mas o código tem **69 ocorrências de hex hardcoded** (`bg-[#2f4d38]` etc.). Só as telas de auth e o Desafio Diário usam `var(--color-*)`. Existem, na prática, dois sistemas de cor concorrentes.

**Tarefa acionável**

> **GER-UI-07 — Tornar o `@theme` a única fonte da verdade de cor**
> - Reescrever os tokens com os valores amostrados (abaixo) e migrar as 69 ocorrências para as classes utilitárias derivadas.
> - Adicionar regra de lint (`eslint-plugin-tailwindcss` ou grep no CI) proibindo `bg-[#` e `text-[#` em `components/`.

```css
/* app/globals.css — token system alinhado à referência */
@theme {
  /* Superfícies */
  --color-bg-base:    #f9f8f6;  /* off-white neutro do app */
  --color-bg-auth:    #ebeae6;  /* off-white das telas de entrada */
  --color-card-bg:    #ffffff;

  /* Azul profundo — AÇÃO PRIMÁRIA e navegação */
  --color-blue-deep:  #0b2349;  /* pressed / texto sobre claro */
  --color-blue-main:  #12294e;  /* fundo de botão primário */
  --color-blue-soft:  #1d2c4d;  /* hover / bordas de ênfase */

  /* Verde botânico — NATUREZA e SUCESSO */
  --color-green-deep: #1f4c38;  /* botão secundário */
  --color-green-main: #378328;  /* progresso, checks, sucesso */
  --color-green-soft: #d4e5af;  /* tags de status, fundos leves */

  /* Neutros */
  --color-locked:     #b8b8b8;  /* níveis e canteiros bloqueados */
  --color-hairline:   rgba(16, 24, 40, 0.06);
}
```

## 2.4 Tipografia entregue à fonte do sistema ⚠️ MÉDIO

**O que temos hoje**
`font-family: system-ui, -apple-system, …` no `:root`. Nenhum `next/font`. Na prática o app renderiza em San Francisco no iPhone, Roboto no Android e Segoe UI no Windows — **três identidades diferentes**, nenhuma delas a do protótipo.

**Como deve ficar**
Todos os protótipos usam uma sans-serif geométrica/humanista única, com pesos bem separados: títulos em ~700, rótulos de dado em ~600 e corpo em 400. O código atual abusa de `font-black` (900) — há **31 ocorrências** —, peso que não aparece na referência e que engrossa demais os títulos em telas pequenas.

**Tarefa acionável**

> **GER-UI-08 — Fixar a tipografia com `next/font`**
> - Adicionar Inter (ou Plus Jakarta Sans, se a Sarah confirmar a fonte do Canva) via `next/font/google` no root layout, expondo `--font-sans`.
> - Trocar o `font-family` do `:root` por `var(--font-sans)`.
> - Definir a escala e aplicar: `text-2xl/700` para título de tela, `text-base/600` para título de card, `text-sm/400` para corpo, `text-xs/600 uppercase tracking-wide` para rótulos.
> - Substituir as 31 ocorrências de `font-black` por `font-bold`.
> - ⚠️ **Confirmar a fonte exata com a autora antes de implementar** — o deck é `.pptx`, então a fonte usada no Canva pode ser recuperada do arquivo original.

---

# PILAR 3 — Componentes de Gamificação

## 3.1 A timeline evolutiva não existe no código ❌ CRÍTICO

**O que temos hoje**
`NIVEIS_EVOLUCAO` (6 níveis, com nome, faixa de XP, ícone e descrição) está definido em `data/plantasData.ts` e é importado em 3 arquivos — mas **em todos eles só para fazer `.find()` do nível atual**. A timeline horizontal nunca é renderizada em lugar nenhum do app.

**Como deve ficar**
É um dos elementos mais presentes na referência: aparece na tela "Sua jornada" (mobile), na "Jornada do Conhecimento" (desktop) e no infográfico institucional. O padrão é uma **trilha horizontal** com um badge por nível, rótulo (nome + "Nível N") abaixo, uma linha conectora, **check verde `#378328`** nos níveis concluídos, marcador destacado no atual e **cadeado cinza `#B8B8B8`** nos futuros.

**Tarefa acionável**

> **GER-UI-09 — Criar `<TimelineEvolucao>`**
> - Novo componente `components/gamificacao/TimelineEvolucao.tsx`, recebendo `niveis: NivelEvolucao[]` e `nivelAtual: number`.
> - Três estados por nó: **concluído** (badge colorido + check verde), **atual** (badge em escala 1.15 com anel `ring-4 ring-[#378328]/20`), **bloqueado** (badge dessaturado `grayscale opacity-60` + cadeado).
> - Linha conectora: `h-1 bg-[#378328]` até o nível atual, `bg-[#B8B8B8]/40` depois.
> - Mobile: `overflow-x-auto snap-x` com o nó atual centralizado no mount (`scrollIntoView({ inline: 'center' })`).
> - Renderizar em `/perfil` e no topo de `/inicio`.

## 3.2 Emblemas: emoji genérico em vez de hexágono ❌ CRÍTICO

**O que temos hoje**
`components/perfil/ConquistasTab.tsx` renderiza **todas** as conquistas com o mesmo emoji `🏆` dentro de um `w-10 h-10 rounded-xl` — o campo `conquista.icone` (`'Sprout'`, `'Award'`, `'Wheat'`, `'ShieldAlert'`, `'Flame'`) **é ignorado no render**.

**Como deve ficar**
A referência tem dois formatos distintos, com semântica própria:
- **Nível** → **hexágono** com gradiente verde e a ilustração da planta dentro (aparece em "Seu progresso", no header do perfil e na timeline).
- **Conquista** → **medalha circular** com anel metálico (bronze / prata / ouro conforme a raridade) e check verde no canto quando desbloqueada; as bloqueadas ficam dessaturadas.

**Tarefa acionável**

> **GER-UI-10 — Criar `<BadgeHexagonal>` e `<MedalhaConquista>`**
> - `BadgeHexagonal`: usar `clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)`, gradiente `from-[#378328] to-[#1F4C38]`, tamanhos `sm|md|lg`.
> - `MedalhaConquista`: círculo com `ring-4`, cor do anel por nível de raridade; `grayscale opacity-50` quando bloqueada; check `#378328` em `absolute -bottom-1 -right-1`.
> - **Passar a usar o campo `icone`** que já existe no dado: montar um mapa `Record<string, LucideIcon>` em vez do `🏆` fixo.

```tsx
// components/gamificacao/BadgeHexagonal.tsx
const HEX = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';

export function BadgeHexagonal({
  icone: Icone, tamanho = 'md', bloqueado = false,
}: { icone: LucideIcon; tamanho?: 'sm' | 'md' | 'lg'; bloqueado?: boolean }) {
  const dim = { sm: 'w-10 h-10', md: 'w-16 h-16', lg: 'w-24 h-24' }[tamanho];
  const ico = { sm: 'w-4 h-4', md: 'w-7 h-7', lg: 'w-10 h-10' }[tamanho];

  return (
    <div
      style={{ clipPath: HEX }}
      className={`${dim} flex items-center justify-center bg-gradient-to-b
        ${bloqueado ? 'from-[#B8B8B8] to-[#8A8A8A]' : 'from-[#378328] to-[#1F4C38]'}`}
    >
      <Icone className={`${ico} text-white`} strokeWidth={1.75} aria-hidden />
    </div>
  );
}
```

## 3.3 Barra de XP pesada demais ⚠️ MÉDIO

**O que temos hoje**
`h-4`, `p-0.5`, borda `#8fb996/40`, `shadow-inner` e preenchimento com **gradiente de três cores** (`from-[#8fb996] via-[#4d7a52] to-[#2f4d38]`).

**Como deve ficar**
Barra fina (~6px), trilho `#EDEDED`, preenchimento **verde sólido** `#378328`, sem borda e sem sombra interna. O rótulo fica acima, no formato "2.850 / 5.000 XP" — a referência mostra sempre **XP absoluto sobre a meta**, nunca a porcentagem que o código exibe hoje.

**Tarefa acionável**

> **GER-UI-11 — Criar `<BarraXP>`**
> - `h-1.5 rounded-full bg-[#EDEDED]`, fill `bg-[#378328] transition-[width] duration-500`.
> - Rótulo no formato `{xp.toLocaleString('pt-BR')} / {xpMax.toLocaleString('pt-BR')} XP` (a referência usa separador de milhar).
> - Remover a exibição de `{percentualXp}%`.
> - Acessibilidade: `role="progressbar"` com `aria-valuenow/min/max` — hoje a barra é uma `<div>` muda para leitor de tela.

## 3.4 ⚠️ DECISÃO PENDENTE — os protótipos divergem entre si nos nomes dos níveis

Não é um bug do código: **as próprias referências não concordam**.

| Fonte | Níveis 1 → 6 |
|---|---|
| `192335`, `192608` (Jornada do Conhecimento) | Semente · Broto · **Muda** · **Flores** · **Árvore** · **Frutos** |
| `192641` (Sua evolução) | Semente · Broto · **Folha** · **Muda** · **Guardião Verde** · **Curador Botânico** |
| **Código atual** (`NIVEIS_EVOLUCAO`) | Semente · Broto · Muda · Flores · Árvore · Frutos |

O código segue a primeira versão. As capturas mais recentes (`192623`, `192641`, que também trazem a versão mais elaborada do Jardim) usam a segunda, e nelas o XP máximo também muda: 5.000 em vez de 2.000.

> **GER-UI-12 — Fechar a nomenclatura dos níveis com a autora** *(bloqueante para 3.1 e 3.2)*
> Não implementar a timeline antes desta definição: os rótulos aparecem em 4 telas diferentes e refazer depois custa o triplo. Levar as duas versões para a Sarah escolher, e registrar a decisão no `ROTEIRO.md`.

---

# PILAR 4 — Jardim do Conhecimento (Core Visual)

Este é o maior gap do projeto. A referência trata o Jardim como o **diferencial competitivo** ("O que mais impressiona: Jardim do Conhecimento — um ambiente visual onde cada planta estudada cresce"), e é justamente a tela mais distante do design.

## 4.1 Não é uma cena de horta; é um grid de cards ❌ CRÍTICO

**O que temos hoje**
`grid grid-cols-2 sm:grid-cols-3` de cards brancos retangulares. Cada card tem cabeçalho "Canteiro #1", um emoji ao centro (`🌱🌿🪴🌸✨`) com `animate-pulse`, o nome da planta e a linha "Fase: muda".

**Como deve ficar**
Uma **cena contínua de horta**: fundo ilustrado de jardim ocupando todo o painel, com **canteiros circulares de terra** dispostos em 3 fileiras sobre ele. Cada canteiro traz a ilustração da planta plantada, o nome logo abaixo e uma **tag de status verde-lima `#D4E5AF`**. Não há moldura branca, não há numeração de canteiro, não há emoji.

**Tarefa acionável**

> **GER-UI-13 — Reconstruir o Jardim como cena**
> - Container: `rounded-2xl overflow-hidden bg-[url('/jardim/fundo-horta.jpg')] bg-cover min-h-[420px] p-6`.
> - Canteiros em `grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8`, cada um sem card — só o círculo de terra + rótulo.
> - **Asset necessário**: o fundo da horta. Solicitar à Sarah o PNG/JPG usado no Canva; sem ele, usar um gradiente terroso como fallback (`from-[#8FA86B] to-[#6B7F4A]`) e marcar como provisório.
> - **Aproveitar o que já temos**: as 25 fotos reais das plantas em `public/plantas/` podem preencher o círculo do canteiro imediatamente, com `rounded-full object-cover`. Isso elimina os emoji hoje e não depende de ilustração nova.

## 4.2 Os três estados não estão componentizados ❌ CRÍTICO

**O que temos hoje**
Um **ternário aninhado de três níveis** dentro do `.map()`, misturando marcação dos três estados com as regras de negócio dos botões, tudo em um bloco de ~120 linhas dentro de `JardimConhecimento.tsx`. Não é testável isoladamente e qualquer mudança em um estado arrisca os outros.

**Como deve ficar**
Um componente `<Canteiro>` com uma união discriminada de estado, e um subcomponente por estado — exatamente os três que o briefing exige: **Bloqueado**, **Vazio**, **Cultivado**.

**Tarefa acionável**

> **GER-UI-14 — Extrair `<Canteiro>` com os três estados**

```tsx
// components/jardim/Canteiro.tsx
type EstadoCanteiro =
  | { tipo: 'bloqueado'; nivelNecessario: number }
  | { tipo: 'vazio' }
  | { tipo: 'cultivado'; planta: PlantaCatalogo; fase: FaseCultivo; pronto: boolean };

export function Canteiro({ estado, onPlantar, onAdubar, onColher }: CanteiroProps) {
  switch (estado.tipo) {
    case 'bloqueado':  return <CanteiroBloqueado nivel={estado.nivelNecessario} />;
    case 'vazio':      return <CanteiroVazio onPlantar={onPlantar} />;
    case 'cultivado':  return <CanteiroCultivado {...estado} onAdubar={onAdubar} onColher={onColher} />;
  }
}
```

- **Bloqueado** — círculo de terra escura (`bg-[#3E2F23]`) com cadeado branco ao centro e, abaixo, a legenda **"Desbloqueie no nível 8"**. A referência nomeia o requisito; o código atual só diz "Bloqueado / Nível 4", que não informa o que fazer.
- **Vazio** — mesmo círculo de terra, mais claro (`bg-[#6B5240]`), com `+` tracejado ao centro e rótulo "Espaço livre". Clicar abre o seletor de semente. Hoje o seletor é um `<select>` único no topo da tela, longe do canteiro em que a ação acontece.
- **Cultivado** — foto/ilustração da planta em círculo, nome abaixo em `font-semibold`, e a **tag de status** `bg-[#D4E5AF] text-[#1F4C38] text-xs rounded-full px-2 py-0.5`.

## 4.3 "Fase: muda" expõe jargão de sistema ⚠️ MÉDIO

**O que temos hoje** `Fase: {terreno.fase}` — imprime o valor cru do enum (`'semente' | 'broto' | 'muda' | 'flor' | 'pronto'`), com `capitalize` por cima.

**Como deve ficar** A tag da referência descreve o **estado do conhecimento**, não o do banco: **"Estudada"**, "Nova planta". É a diferença entre nomear a coisa pelo que o usuário reconhece e nomeá-la pela modelagem interna.

> **GER-UI-15 — Mapear enum de fase para linguagem do usuário**
> Criar `const RÓTULO_FASE: Record<FaseCultivo, string>` (`semente: 'Recém-plantada'`, `broto: 'Crescendo'`, `muda: 'Em desenvolvimento'`, `flor: 'Florescendo'`, `pronto: 'Pronta para colher'`). Nunca renderizar o valor do enum direto.

## 4.4 A "Loja do Conhecimento" não existe na referência ⚠️ MÉDIO — decisão de produto

**O que temos hoje**
Um terço da tela do Jardim é ocupado pela "Loja do Conhecimento & Mercado Bioeconômico", com 3 itens compráveis (adubo, sementes, tema visual).

**Como deve ficar**
No protótipo, o espaço à direita/abaixo do Jardim é ocupado por: **Desafio Diário** (card com pergunta e alternativas), **Missões em andamento** (3 barras de progresso) e a faixa **"Como seu jardim cresce"** (5 cards ilustrados explicando o loop). A loja aparece apenas como um botão discreto "VER LOJA" dentro do card lateral de recompensas.

> **GER-UI-16 — Rebalancear a composição da tela do Jardim**
> Reduzir a loja a um botão "Ver loja" que abre um modal/rota própria, e ocupar o espaço com o Desafio Diário e as Missões, como na referência. **Confirmar com a Sarah** — é mudança de produto, não só de layout.

---

## Resumo executivo

| Pilar | Divergências | Críticas | Bloqueado por decisão |
|---|---|---|---|
| 1 — Arquitetura de Layout | 5 | 3 | — |
| 2 — Identidade Visual e Tipografia | 4 | 1 | fonte exata (2.4) |
| 3 — Gamificação | 4 | 2 | nomes dos níveis (3.4) |
| 4 — Jardim do Conhecimento | 4 | 2 | loja (4.4), asset de fundo (4.1) |
| **Total** | **17** | **8** | **4** |

### Ordem de execução sugerida

**Sprint 1 — fundação** (destrava todo o resto)
`GER-UI-07` tokens → `GER-UI-08` tipografia → `GER-UI-04` Card → `GER-UI-06` Button

**Sprint 2 — casca do app** (o que se vê em toda tela)
`GER-UI-01` Header → `GER-UI-02` FAB → `GER-UI-03` Sidebar → `GER-UI-05` banners

**Sprint 3 — gamificação** (após GER-UI-12)
`GER-UI-11` BarraXP → `GER-UI-10` badges → `GER-UI-09` timeline

**Sprint 4 — Jardim** (o diferencial; precisa do asset de fundo)
`GER-UI-14` componentização → `GER-UI-13` cena → `GER-UI-15` rótulos → `GER-UI-16` composição

### Pendências para a autora

1. **Nomes e quantidade de níveis** — as referências divergem (3.4). Bloqueia a Sprint 3.
2. **Fonte tipográfica** — recuperar do arquivo original do Canva/PPTX.
3. **Ação do botão (+)** da bottom nav — não explicitada nos protótipos.
4. **Imagem de fundo da horta** — necessária para a Sprint 4 com fidelidade total.
5. **Loja do Conhecimento** — manter em destaque ou recolher, como na referência?
