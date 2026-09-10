# GERMINA

Aplicação gamificada para o ensino de plantas medicinais da Amazônia.

Desenvolvida no âmbito da pesquisa de mestrado de **Sarah Batista de Freitas** — PPGCTS/ICET/UFAM,
bolsista FAPEAM, Itacoatiara/AM.

---

## Como rodar

Requer Node.js 18.17 ou superior.

```bash
npm install
npm run dev
```

Abra `http://localhost:3000/splash`.

> O primeiro build baixa a fonte Inter via `next/font` e precisa de internet.

### Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção (34 rotas) |
| `npm run start` | Serve o build |
| `npm run typecheck` | `tsc --noEmit` |

---

## Stack

- **Next.js 15** (App Router) + **React 19**
- **Tailwind CSS v4** com design tokens em `@theme`
- **TypeScript** estrito
- **lucide-react** para ícones
- **Supabase** — dependências instaladas, integração pendente

---

## Estrutura

```
app/
  (auth)/          splash, login, cadastro, recuperação, tutorial
  (app)/           telas internas — herdam Header + Sidebar/BottomNav
  termos/          fora de (app): acessível sem conta
  privacidade/
  layout.tsx       root layout + next/font
  globals.css      design tokens (@theme)

components/
  ui/              Card, Button, BotaoVoltar — primitivos do design system
  gamificacao/     BarraXP, BadgeHexagonal, MedalhaConquista, TimelineEvolucao
  jardim/          Canteiro (3 estados), FundoHorta, IlustracaoPlanta, LojaModal
  desafio-diario/  fluxo do quiz
  perfil/ comunidade/ configuracoes/

lib/
  gamificacao.ts   ÚNICO ponto de mutação de XP e nível
  jardim.ts        estado do canteiro + crescimento por timestamp
  ofensiva.ts      cálculo de streak por data local
  loja.ts          catálogo (fonte única de preço e quantidade)
  paletaJardim.ts  cores da cena (ilustração, fora do @theme)
  queries/         camada de dados — hoje mocks, amanhã Supabase

data/
  plantasData.ts        15 espécies + trilha de 8 níveis
  desafioDiarioQuiz.ts  60 perguntas, 4 eixos

docs/                   documentação do projeto
```

---

## Princípio de arquitetura: estado derivado

A fase de QA revelou que **cinco bugs críticos tinham a mesma causa**: um dado que deveria ser
derivado estava sendo armazenado, com vários lugares livres para alterá-lo.

| Persistir | Derivar (nunca guardar) |
|---|---|
| `xp` | `nivel_atual` → `calcularNivel(xp)` |
| `plantado_em` | `fase` do cultivo → `calcularProgresso()` |
| `ultimo_desafio_em` | `streak` → `lerOfensiva()` |
| `planta_id` | ocupação do canteiro |

**Ao escrever as migrations do Supabase, manter este critério.** Persistir os derivados como
colunas faz os cinco bugs voltarem — agora com dados errados gravados.

---

## Design System

Tokens em `app/globals.css` (`@theme`). Nenhum hex solto em `components/`.

| Papel | Token |
|---|---|
| Ação primária | `blue-main` `#12294e` |
| Natureza / secundário | `green-deep` `#1f4c38` |
| Progresso / sucesso | `green-main` `#378328` |
| Tag de status | `green-soft` `#d4e5af` |
| Fundo | `bg-base` `#f9f8f6` |

**Única exceção:** `components/jardim/` consome `lib/paletaJardim.ts` — cores de ilustração da
cena da horta, que não pertencem ao `@theme` para não virarem utilitários do app.

Sugestão de trava no CI:

```bash
grep -rE "bg-\[#|text-\[#|border-\[#" --include=*.tsx components/ \
  | grep -v "components/jardim/" && exit 1 || exit 0
```

---

## Conteúdo científico

As 15 espécies e as 60 perguntas derivam **estritamente** da curadoria oficial. Cada pergunta
declara `campo_fonte` e `fonte` (citação literal), exibidos no app para validação pelo Comitê
Ad Hoc.

**Nenhuma pergunta pode ser escrita sem lastro na curadoria.**

---

## Estado atual

✅ Front-end completo — 34 rotas, design system unificado, core loop funcional
⏳ Backend — `supabase/migrations/` vazia, `lib/queries/*` retorna mocks
⏳ Autenticação — telas prontas, Supabase Auth não conectado

Ver `docs/00-roteiro-desenvolvimento.md` para o histórico completo e `CHANGELOG.md` para as
mudanças da fase de estabilização.
