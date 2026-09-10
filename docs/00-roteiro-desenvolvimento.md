# GERMINA — Roteiro de Desenvolvimento

Estrutura Next.js (App Router) organizada a partir do protótipo AI Studio
(`germina__1_.zip`) + backlog de telas + schema de banco.

## Status por módulo

| # | Tela | Rota (App Router) | Componente reaproveitado | Status | Tabelas |
|---|------|-------------------|---------------------------|--------|---------|
| 1 | Splash | `app/(auth)/splash` | página própria | ✅ completa | — |
| 1 | Login | `app/(auth)/login` | página própria | ✅ completa | `auth.users` |
| 1 | Cadastro | `app/(auth)/cadastro` | página própria | ✅ completa | `auth.users`, `profiles` |
| 1 | Recuperar/Redefinir senha | `app/(auth)/recuperar-senha`, `/redefinir-senha` | página própria | ✅ completa | `auth.users` |
| 1 | Verificar e-mail / Tutorial | `app/(auth)/verificar-email`, `/tutorial` | página própria | ✅ completa | — |
| 2 | Navegação | layout de `(app)` | `BottomNav.tsx` + `HeaderBar.tsx` | ✅ completa (rotas reais) | — |
| 3 | Início | `app/(app)/inicio` | `InicioDashboard.tsx` + `InicioClient.tsx` | 🟡 UI completa, falta plugar Supabase | `game_state`, `atividades`, `desafios_diarios`* |
| — | Desafio Diário (Quiz) | `app/(app)/desafio-diario` | módulo `desafio-diario/` completo | 🟡 UI completa (3/15 plantas), falta plugar Supabase | `game_state` |
| 4 | Biblioteca | `app/(app)/biblioteca` | `HerbarioVirtual.tsx` + `BibliotecaClient.tsx` | 🟡 UI completa, dados corrigidos (curadoria Sarah), falta plugar Supabase | `plantas_catalogo`, `user_colecao` |
| 5 | Jardim do Conhecimento | `app/(app)/jardim` | `JardimConhecimento.tsx` + `JardimClient.tsx` | 🟡 UI completa, falta plugar Supabase | `game_state`, `terrenos_jardim`* |
| 7 | Comunidade | `app/(app)/comunidade` | `ComunidadeMural.tsx` | 🟡 UI completa (self-contained), falta plugar Supabase | `comunidade_posts`, `post_curtidas`* |
| 8 | Perfil | `app/(app)/perfil` | `PerfilEConfiguracoes.tsx` + `PerfilClient.tsx` | 🟡 UI completa, falta plugar Supabase | `profiles`, `conquistas`* |

**Todas as 8 telas do backlog original + o módulo de Desafio Diário agora têm rota navegável.**
O que resta pra virar produto de verdade: (1) rodar `create-next-app` de fato — hoje só existe a
árvore de arquivos, sem `node_modules`; (2) criar o projeto Supabase e trocar cada função de
`lib/queries/` pela chamada real; (3) as 3 tabelas que ainda faltam (`terrenos_jardim`,
`desafios_diarios`, `conquistas`); (4) completar os quizzes das 12 plantas restantes.

\* tabelas ainda não criadas no schema — ver `supabase/migrations/`.

🟢 pronto · 🟡 portado do protótipo, falta integrar com Supabase real · 🔴 não existe ainda

## O que foi feito nesta etapa
- Estrutura de pastas do App Router criada, separando `(auth)` de `(app)`.
- Componentes de UI do protótipo copiados para `components/`, com `'use client'`
  adicionado (usam `useState`/`useEffect`) e imports corrigidos.
- `types.ts` → `lib/types.ts` e `plantasData.ts` → `data/plantasData.ts` reaproveitados.
- ~~`server.ts` (Express) portado para `app/api/scan-plant/route.ts`~~ — removido junto com o Scanner IA.
- Clientes Supabase separados para browser (`lib/supabase/client.ts`) e
  servidor (`lib/supabase/server.ts`), necessário porque Next.js SSR trata
  sessão via cookies — diferente do client único que o protótipo usava.

## Backlog de Onboarding — resolvido

Fluxo completo de primeiro acesso, do cadastro até o Dashboard:

```
Splash → Cadastro → Verificar E-mail (pending) → Login → Tutorial (1ª vez) → Início
                                                      ↳ (já viu tutorial) → Início direto
```

- **Termos de Uso/LGPD**: já estava resolvido — checkbox obrigatório em `cadastro/page.tsx`.
- **Progressive Profiling**: decisão tomada — cadastro permanece em etapa única (nome, sobrenome,
  telefone, e-mail, senha) por ser mais simples de defender academicamente e já popular o
  `profiles` completo. Reversível se o time preferir depois.
- **Verificação de e-mail**: nova tela `app/(auth)/verificar-email/page.tsx`, para a qual o
  Cadastro redireciona. Tem "Já confirmei, ir para login" e "Reenviar e-mail" (mock).
- **Tutorial do core loop**: nova tela `app/(auth)/tutorial/page.tsx`, carousel de 3 slides
  (Estudar → Ganhar sementes/XP → Cuidar do Jardim). O Login decide se mostra o tutorial ou vai
  direto pro Início, usando uma flag em `localStorage` (`germina_tutorial_visto`) — placeholder até
  virar um campo em `profiles` no Supabase.
- **`OnboardingModal.tsx` removido**: era a versão antiga (pré-Next.js) de login/cadastro/recovery
  do protótipo, não um tutorial. Duplicava as páginas novas e não estava em uso — removido para
  evitar confusão.

## Perfil — campos de identidade completados

Checagem pedida: comparar o cartão de identidade do Perfil com o que uma tela de perfil normalmente
tem (nome, nickname, ID, e-mail, senha, sair, compartilhar). Faltavam 3: nickname, exibição do ID, e
um ponto de entrada pra alterar senha (hoje só existe dentro do fluxo de login/recuperação). Adicionado:

- **`Profile` (`lib/types.ts`)** ganhou o campo `nickname: string`. Populado em `getPerfil()`
  (`lib/queries/perfil.ts`) com `'sarah.freitas'` — mesmo padrão mockado dos outros campos.
- **Cartão de identidade** (`PerfilEConfiguracoes.tsx`): nickname exibido como `@sarah.freitas` logo
  abaixo do nome; ID (`profile.id`) exibido pequeno e discreto no rodapé do cartão, com ícone de
  impressão digital — só como referência/depuração, não é algo que o usuário normalmente edita.
- **Botão "Alterar Senha"**: adicionado ao lado do "Sair / Alternar Conta", na seção de Configurações.
  **Propositalmente não-funcional** (`disabled`, `cursor-not-allowed`, tooltip explicando o motivo) —
  por instrução do time: o fluxo de alterar senha vai ficar centralizado aqui dentro de uma futura
  seção de Configurações do Perfil; hoje ele só existe solto no Login (`/recuperar-senha` →
  `/redefinir-senha`), o que foi identificado como decisão equivocada de fluxo e será corrigido depois
  — por ora só o placeholder visual, sem lógica.

## Perfil (abas) + Configurações (rota própria) — extraídos dos protótipos

Extração e adaptação visual (branco + verde/azul, sem dark-mode/terracota) dos dois protótipos
enviados (`germina---botânica-e-herbário.zip` e `germina---configurações.zip`):

- **Perfil (`app/(app)/perfil`)** — cartão de identidade + métricas continuam no topo, mas o
  conteúdo abaixo virou **4 abas** (`components/perfil/ProfileTabs.tsx`): **Herbário** (grid das
  plantas que o usuário já estudou, adaptado do conceito de "specimens catalogados" do protótipo
  pro nosso modelo real de `user_colecao` sobre o catálogo curado — não um caderno de campo
  pessoal com números de catálogo, que conflitava com o escopo do GERMINA), **Conquistas**
  (mesmo conteúdo de antes, só extraído pra componente próprio, agora com barra de progresso),
  **Atividade** (feed de histórico, novo), **Conta** (resumo simples + atalho pra Configurações).
- **Configurações (`app/(app)/configuracoes`)** — nova rota separada do Perfil, com 6 seções
  extraídas do protótipo: Conta e Segurança (editar perfil, localização e excluir conta — todos
  com modal funcional; alterar senha continua "em breve"), Notificações (3 toggles),
  Privacidade (herbário público, disponível para trocas), Gerenciamento de Dados (exportar
  herbário em PDF/CSV simulado, limpar cache), Preferências (seletor de tema, migrado de dentro
  do Perfil pra cá), Sobre (Termos, feedback por e-mail) e Logout no rodapé.
- Tudo com dados mockados via `lib/queries/configuracoes.ts` (preferências) — pronto pra trocar
  por leitura/escrita real quando o Supabase for plugado.

## Refinamentos por tela (mapeamento de botões)

Processo: mapear todo elemento clicável de cada tela, avaliar se deveria virar rota própria,
e corrigir antes de seguir pra próxima. Feito até agora:

- **Biblioteca** → a Ficha Botânica (antes um modal) virou rota própria dinâmica
  `app/(app)/biblioteca/[slug]/page.tsx`, com `generateMetadata` (SEO/compartilhamento) e
  `generateStaticParams` (as 15 páginas pré-geradas no build). Slug gerado por `lib/slug.ts`
  (ex: `/biblioteca/hortela-pimenta`). O antigo `onEstudarPlanta` saiu do `HerbarioVirtual.tsx`
  (agora só filtra e lista) e passou para o novo `FichaBotanicaClient.tsx`.
- **Início** → os 4 cards de atalho (Herbário, Sementes, Conquistas) e o link do feed de
  atividades usavam uma função `onNavigateTab` (resquício de quando a navegação era por tabs em
  memória, não por rota). Trocados por `<Link>` de verdade. O card "Conquistas" também parou de
  mostrar "2/5" fixo — agora vem de `getConquistas()` (`lib/queries/dashboard.ts`), contando
  quantas de `CONQUISTAS_INICIAIS` estão `desbloqueada: true`.

- **Jardim do Conhecimento** → 3 correções feitas: (1) recompensa da colheita agora é consistente
  em toda a tela e no código (+40 XP, +15 Moedas, +2 Sementes sempre, sem dois textos
  diferentes prometendo coisas distintas); (2) removida a "colheita antecipada" — o botão
  "Colher" só aparece quando `fase === 'pronto'`, antes disso só dá pra Adubar; (3) o seletor de
  sementes agora só lista plantas que o usuário já estudou na Biblioteca (`colecaoUsuario`),
  ligando o Jardim ao Herbário — se nada foi estudado ainda, mostra aviso em vez do seletor vazio.

- ~~**Scanner IA**~~ — feature descontinuada; ver seção de remoção no fim deste documento.

- **Comunidade** → dois candidatos viraram funcionais: (1) "N Respostas" agora leva pra
  `app/(app)/comunidade/post/[id]/page.tsx`, uma rota própria por post com metadata (SEO), lista
  de respostas e formulário pra responder — antes esse botão não fazia nada; (2) "Compartilhar"
  agora copia o link real do post (ou abre o share nativo no mobile) — antes também não fazia
  nada; (3) "Propor Troca" abre um modal funcional (`TrocaModal.tsx`) com formulário de oferta +
  mensagem. Dados movidos de `useState` local pra `data/comunidadeData.ts` +
  `lib/queries/comunidade.ts`, pra lista e detalhe do post lerem a mesma fonte.

- **Perfil** → mapeados os 3 elementos clicáveis reais da tela (`PerfilEConfiguracoes.tsx`):
  1. **"Compartilhar"** (cartão de identidade) — funcionava, mas só com `navigator.clipboard`, sem o
     fallback de share nativo que a Comunidade já tinha. Unificado com o mesmo padrão de
     `ComunidadeMural.tsx`: tenta `navigator.share()` primeiro (abre o menu nativo de
     compartilhamento no mobile), cai pro clipboard com try/catch se indisponível ou cancelado.
  2. **Seletor de Tema** (4 botões) — já funcional, atualiza `gameState.tema_ativo` local via
     `onUpdateTema`; segue com `TODO` de persistir no Supabase quando o backend estiver plugado.
  3. **"Sair / Alternar Conta"** — já funcional, chama `onOpenAuthModal` (hoje só faz
     `router.push('/login')`); segue com `TODO` de `supabase.auth.signOut()`.

  **Bug encontrado e corrigido**: o card de métrica "Conquistas" mostrava `2 / 5` fixo no JSX,
  igual ao bug já corrigido antes na tela Início — não refletia o estado real (`CONQUISTAS_INICIAIS`
  hoje só tem 1 conquista `desbloqueada: true`). Trocado por `conquistasDesbloqueadas / conquistas.length`,
  calculado a partir do mesmo array que já alimenta o grid de medalhas logo abaixo.

  **Não são clicáveis** (mapeados e confirmados como decorativos por ora): avatar, badge de nível,
  os 4 cards de métricas (XP/Espécies/Ofensiva/Conquistas — diferente do Início, aqui não navegam
  pra lugar nenhum), e os cards individuais do grid de Conquistas e Medalhas.

  **Gaps identificados, não corrigidos agora** (fora do escopo de "mapear o clicável existente";
  ficam como candidatos a próxima rodada):
  - Não há como editar os dados do perfil (nome, e-mail, endereço, idade) — só exibição.
  - "Sair / Alternar Conta" combina duas ações num botão só, sem distinguir as duas; não há fluxo de
    troca de conta.
  - O campo `icone` de `Conquista` (`lib/types.ts`) nunca é usado — todo card de conquista mostra o
    mesmo emoji 🏆 fixo, independente do valor. Mesmo padrão (campo não lido) já existe em `Atividade`
    e `DesafioDiario` no Início — não é regressão desta tela, é dívida pré-existente do protótipo.

## Módulo: Desafio Diário (Quiz) — completo

Substituído o quiz simples do ciclo anterior por uma sessão completa, baseada no modelo
dedicado que a mestranda produziu no AI Studio (`germina---desafio-diário.zip`):

- **`data/desafioDiarioQuiz.ts`** — banco de perguntas: 3 plantas (Crajiru, Boldo, Amora),
  3 perguntas cada, sempre nos eixos **Indicação Terapêutica → Preparo Tradicional → Curiosidade
  ODS**, em dificuldade crescente (fácil → médio → difícil). **Pendente de revisão pelo professor
  e pela mestranda** antes de virar conteúdo final — faltam ainda 12 plantas do catálogo.
- **`components/desafio-diario/`** — `StartScreen` (seleção de planta + CTA) → `QuestionScreen`
  (pergunta + 4 alternativas) → `FeedbackScreen` (certo/errado + explicação) → `ResultScreen`
  (placar final, XP, streak, compartilhar, refazer). Recolorido do tema original (branco +
  verde/azul do AI Studio) para os nossos tokens exatos (`--color-green-*`, `--color-blue-*`).
- **`app/(app)/desafio-diario/page.tsx`** — rota própria; usa o `GameState` real (xp, streak) em
  vez do perfil isolado em `localStorage` do modelo original.
- **Correção de dado**: a planta Amora estava marcada `is_renisus: true` no arquivo da mestranda,
  mas não consta na lista oficial RENISUS — corrigido para `false` pra bater com nosso catálogo
  (`plantasData.ts`). Vale confirmar com ela.
- O card de Desafio Diário na tela Início, quando `tipo: 'quiz'`, agora navega pra
  `/desafio-diario` em vez de abrir um modal simples (versão anterior, removida).

## Fidelidade ao PDF de curadoria — regra do projeto

Decisão do time: o catálogo (`data/plantasData.ts`) tem que reproduzir **literalmente** o que está
escrito na curadoria oficial (`Curadoria_de_sp_SBFreitas_15_Especies_para_o_app_20-12.pdf`), inclusive
grafias e citações — nenhuma "correção silenciosa" de nome científico, composição fitoquímica ou
contraindicação sem registrar a mudança aqui e sem confirmar com a Sarah/orientador.

Nesta rodada, revertidas 3 divergências que uma sessão anterior tinha introduzido sem registro:
- **Crajiru**: nome científico voltou a `Fidericia chica (Bonpl.) (antiga Arrabidae chica)` — como está
  na ficha do PDF. Havia sido "corrigido" para `Fridericia chica (Bonpl.) L.G.Lohmann (antiga
  Arrabidaea chica)` (grafia botanicamente mais comum, mas ausente do documento fonte). A pergunta do
  Desafio Diário (`data/desafioDiarioQuiz.ts`) também foi ajustada para usar a mesma grafia.
- **Cumaru**: nome científico voltou a `Dipteryx odorata`, sem a autoridade `(Aubl.) Willd.` que havia
  sido adicionada e não consta na ficha do PDF.
- **Malvarisco**: composição fitoquímica voltou às grafias exatas do PDF (`lutedeína`, `erioductol`),
  que haviam sido silenciosamente trocadas por `luteolina`/`eriodictiol`.

Além disso, os campos `evidencias` (Composição fitoquímica), `preparo` (Dados sobre o uso) e
`contraindicacoes` (Contra indicações) de todas as 15 plantas foram reconferidos e, onde estavam
resumidos/sem citação, voltaram a ser o texto literal do PDF com as citações originais.

`PlantaCatalogo` (`lib/types.ts`) ganhou 4 campos novos para não perder rastreabilidade sem forçar
parafraseamento em nenhum lugar: `familia_fonte`, `morfologia_fonte`, `renisus_texto`, `fotos_fonte`.
Nenhum componente foi alterado ainda para exibi-los — são aditivos, então nada quebrou; ainda é preciso
decidir onde/como mostrá-los na Ficha Botânica (ex: crédito da foto, nota de rodapé com a fonte
taxonômica).

**Pendência conhecida, herdada do próprio PDF**: o link em "Fotos — Fonte" da Cidreira, na curadoria
original, aponta para a página da Alternanthera brasiliana (Terramicina) — provável erro de digitação
da autora. Reproduzido como está no `fotos_fonte` da Cidreira, com uma nota; vale confirmar com a Sarah
antes de usar esse link para buscar a foto real.

**Bug encontrado e corrigido logo em seguida**: o campo `habitat` de 3 plantas (Amora, Goiaba, Abacate)
ficou com texto genérico ("cultivada em quintais...") sem mencionar o Horto Municipal de Itacoatiara/AM,
enquanto as outras 12 diziam isso explicitamente. Pela legenda do PDF, **as 15 espécies** — tanto as `*`
(RENISUS) quanto as `**` (não-RENISUS) — estão presentes no Horto Municipal. Corrigido: as 15 agora
citam o Horto Municipal de Itacoatiara/AM no `habitat`.

## Fotos reais das 15 plantas — extraídas da curadoria

As 15 fotos foram extraídas diretamente dos arquivos de imagem embutidos no PDF da curadoria (não
baixadas das URLs da web — a Sarah já anexou as fotos no próprio documento, então usamos os bytes
originais que ela colou lá). Processo:

1. `pdfimages -all` no PDF extraiu 29 imagens (4 são logos da capa, 25 são fotos das plantas).
2. Cada página de ficha (2 a 16) tem 1 a 3 fotos lado a lado. Conferi visualmente (rasterizando cada
   página) qual foto aparece **primeiro da esquerda pra direita** em cada ficha, porque a ordem de
   extração do `pdfimages` (ordem interna do PDF) nem sempre bate com a ordem visual — Goiaba, Abacate,
   Boldo e Hortelã-pimenta tinham a 2ª foto da página como "primeira" na extração; corrigido escolhendo
   a foto certa como principal para cada planta.
3. Usei a primeira foto de cada ficha como `imagem_url` de cada planta (redimensionada para no máx.
   1200px de largura, JPEG qualidade 82, ~1MB total pras 15 fotos). Ficaram salvas em
   `public/plantas/<slug>.jpg` (slug = mesmo usado nas rotas `/biblioteca/[slug]`).
4. `data/plantasData.ts`: todos os 15 `imagem_url` trocados dos placeholders do Unsplash pros arquivos
   locais reais.
5. Crédito da foto: criado `lib/fotoCredito.ts` (extrai rótulo + link a partir do texto literal de
   `fotos_fonte`, que já vinha da curadoria) e `components/CreditoFoto.tsx` (selo semi-transparente com
   ícone de câmera, sobreposto no canto da foto — vira link clicável pra fonte original quando a
   curadoria informa uma URL; senão mostra só o texto do crédito, ex: "iStock", "Wikimedia Commons").
   Plugado na Ficha Botânica (`FichaBotanicaPlanta.tsx`) e nos cards da Biblioteca (`HerbarioVirtual.tsx`).

**Não usei as 2ª/3ª fotos ainda** (Amora, Goiaba, Abacate, Boldo, Corama, Terramicina, Hortelã-pimenta,
Cuia-mansa e Cumaru têm mais de uma foto na curadoria) — ficaram só extraídas em
`/home/claude/work/pdf_images/out2/` nesta sessão, não versionadas no projeto. Se quiser uma galeria com
todas as fotos na Ficha Botânica (não só uma capa), é um próximo passo natural — adicionaria um campo
`imagem_galeria?: string[]` no `PlantaCatalogo` e um carrossel simples na ficha.

**Pendência confirmada nesta checagem**: o link de "Fotos — Fonte" da Cidreira aponta pra página da
Terramicina — é erro do próprio PDF da curadoria (confirmado visualmente, não é bug do app). O selo de
crédito da Cidreira vai linkar pra essa URL errada até a Sarah confirmar/corrigir a fonte certa.

## Galeria de fotos extras — implementada

As 9 plantas com mais de uma foto na curadoria (Amora, Goiaba, Abacate, Boldo, Corama, Terramicina,
Hortelã-pimenta, Cuia-mansa, Cumaru) agora mostram todas as fotos, não só a capa:

- `PlantaCatalogo` ganhou `imagem_galeria: string[]` — todas as fotos da ficha, na mesma ordem em que
  aparecem na curadoria. Populado pras 15 plantas (as com 1 foto só têm um item no array).
- Fotos extras salvas em `public/plantas/galeria/<slug>-N.jpg`.
- `FichaBotanicaPlanta.tsx`: adicionada uma faixa de miniaturas clicáveis logo abaixo do header — clicar
  troca a foto grande em destaque (estado local `fotoAtiva`, sem precisar de biblioteca de carrossel).
  Só aparece quando a ficha tem mais de 1 foto. O selo de crédito (`CreditoFoto`) continua fixo, porque a
  curadoria cita uma única fonte por ficha, mesmo quando há 2–3 fotos.

**Bug pego nessa checagem, corrigido antes de gerar a galeria**: a ordem de extração do `pdfimages` (ordem
interna dos objetos no PDF) não é confiável como proxy pra ordem visual esquerda→direita da página — já
sabia disso de 4 casos (Goiaba, Abacate, Boldo, Hortelã-pimenta), mas ao reconferir individualmente
achei mais um: **Terramicina** estava com a foto principal errada (a folha rosa em close-up, que é a
2ª/direita na página, no lugar da planta inteira, que é a 1ª/esquerda). Corrigido comparando cada arquivo
extraído diretamente com o raster da página, não só confiando no padrão dos outros casos.

## Rodada: correção das fichas + banco completo de perguntas

Objetivo desta rodada: alinhar 100% dos campos das 15 fichas à curadoria e escrever as
perguntas faltantes com lastro documental.

### A. Correções nas fichas (`data/plantasData.ts`)

Conferência campo a campo das 15 espécies contra o PDF. Os campos transcritos literalmente
(`descricao`, `usos_tradicionais`, `preparo`, `evidencias`, `contraindicacoes`, `familia`,
`nome_cientifico`, `renisus_texto`) **já estavam fiéis** — a divergência estava nos dois campos
autorais do app:

1. **`seguranca` (15 alterados)** — era paráfrase livre e, em dois casos, **suavizava a fonte**:
   - Boldo: dizia apenas "uso pontual e moderado", **omitindo que a curadoria registra a planta
     como abortiva**. Corrigido.
   - Malvarisco: omitia o alerta de abortivo e má formação. Corrigido.
   - Amora/Goiaba/Corama: diziam "sem contraindicações", afirmação mais forte que a fonte.
     Agora: "a curadoria não registra contraindicações... ausência de relato não equivale a
     comprovação de segurança".
   Regra nova: `seguranca` é reformulação em linguagem simples do campo "Contra indicações",
   nunca omite nem enfraquece um alerta da fonte, nunca afirma segurança.

2. **`habitat` (15 alterados)** — trazia afirmações sem lastro ("nativa da Amazônia e Caatinga",
   "conhecida popularmente como cana-do-brejo", "amplamente disseminada no Brasil"). A curadoria
   só sustenta a presença no Horto Municipal de Itacoatiara/AM. Uniformizado.

3. **`categoria` da Corama** — estava `Cicatrizante`, mas *nenhum* uso cicatrizante consta na
   ficha dela; os usos são dominados por queixas gástricas. Alterado para `Digestiva`.

4. **Divergência interna da curadoria registrada**: a tabela da p.1 grafa o Boldinho japonês como
   *Mentha alverensis*, a ficha da espécie grafa *Mentha arvensis*. Mantida a grafia da ficha, com
   comentário no código. **Confirmar com a autora.**

Campos que continuam **sem fonte na curadoria** e seguem como decisão do app, agora explicitados:
`ods_relacionados` (vem do PROMPT, não do PDF) e `categoria` (taxonomia de filtro do app).

### B. Banco de perguntas (`data/desafioDiarioQuiz.ts`) — 9 → 60

- **15/15 plantas × 4 eixos = 60 perguntas.** Antes: 3 plantas, 9 perguntas.
- **Eixo novo — "Segurança e Contraindicação"**: 10 das 15 fichas têm contraindicação explícita e
  a curadoria abre com a diretriz da ANVISA (2010); o tema não era coberto por nenhuma pergunta.
- **Eixo novo — "Identificação Botânica"** (morfologia/família/composição), que alimenta o
  repertório botânico do usuário.
- **Eixo "Curiosidade ODS" saiu do banco principal**: sua fonte é o PROMPT institucional, não a
  curadoria. As 3 perguntas antigas foram preservadas em `PERGUNTAS_ODS_COMPLEMENTARES`, sem uso
  no fluxo, para a autora decidir se descarta, reintegra como eixo institucional ou reescreve.
- **As 4 perguntas divergentes da rodada anterior foram reescritas**: Crajiru/fácil e
  Crajiru/médio (falavam em banho e na cor da infusão, ausentes da ficha — a ficha registra só
  "chá das folhas, uso oral"), Boldo/médio (preparo não descrito na ficha, e tratava decocção como
  alternativa errada quando a ficha a cita como uso válido) e Amora/médio (usava "abafar 10
  minutos", que é dado da **Cuia-mansa**, não da Amora).
- **Rastreabilidade**: `PerguntaQuiz` ganhou `campo_fonte` e `fonte` (citação literal). O
  `FeedbackScreen` agora exibe a fonte abaixo da explicação — é o que permite ao Comitê Ad Hoc
  validar item a item.
- **Distratores**: as alternativas erradas são, sempre que possível, usos/preparos **reais de
  outras espécies do catálogo**. Isso exige discriminação entre plantas em vez de eliminação por
  absurdo, e evita inventar informação falsa sobre planta medicinal.

### C. Ajustes técnicos que o banco maior exigiu

- `PlantaComQuiz.planta` (string) → **`planta_id`** referenciando `PLANTAS_CATALOGO`, com `planta`
  mantido só por legibilidade. Fim do pareamento por nome acentuado.
- **`is_renisus` removido do banco de perguntas** — agora derivado do catálogo em
  `DesafioDiarioClient`. Era campo duplicado e já tinha divergido uma vez (caso Amora).
- `StartScreen`: as abas viraram rolagem horizontal (15 não cabiam numa linha flex) e
  `PLANT_ICONS` foi completado — antes 12 das 15 caíam no fallback genérico.
- `PlantBadge`: ícones para os dois eixos novos (o mapa anterior tinha só 3 entradas e os novos
  renderizavam sem ícone).
- **Embaralhamento determinístico das alternativas** (`embaralharAlternativas`): escrito à mão, o
  banco ficou com o gabarito em A/B/C (D em só 3 de 60). O embaralhamento por semente
  (`planta_id` + índice) equilibrou para 17/16/13/14 e é estável entre a tela de resposta e a de
  feedback. Sem ele, quem joga muito aprende a posição da resposta, não o conteúdo.
- Descrição do desafio `d0` não cita mais "Crajiru, Boldo ou Amora"; XP máximo ajustado de 150
  para 200 (4 perguntas × 10 pts × 5).

### D. Validação automatizada

Script de conferência rodado sobre os dois arquivos de dados: 15/15 plantas pareadas com o
catálogo, 60 perguntas, 15 por eixo, todo gabarito com alternativa correspondente, nenhuma
alternativa duplicada, todo `campo_fonte` válido e todo `fonte` preenchido. Teste do
embaralhamento confirma que o texto do gabarito é preservado, que nenhuma alternativa se perde e
que a permutação é determinística.

### E. Pendências desta rodada (precisam da autora)

1. **Cumaru — preparo**: o campo "Dados sobre o uso" da ficha descreve a composição do óleo, não
   um modo de preparo. É a única das 15 nessa situação; a pergunta do eixo foi escrita sobre o que
   a ficha de fato traz, com a lacuna marcada no código.
2. **Cuia-mansa**: "Escassez de material" em composição fitoquímica e em contraindicações.
3. **Boldinho japonês**: *Mentha alverensis* (tabela) vs *Mentha arvensis* (ficha).
4. **Cidreira**: o link de "Fotos — Fonte" aponta para a página da Terramicina (erro no PDF).
5. **Eixo ODS**: decidir o destino das 3 perguntas preservadas.
6. **Pontuação**: erro concede 5 pontos (25 XP). Premiar participação é escolha legítima, mas
   precisa ser decisão consciente e registrada. Espécies RENISUS também continuam valendo o mesmo
   XP das demais no quiz, embora valham o dobro na Biblioteca.

## Próximos passos
1. Rodar `create-next-app` de verdade neste diretório (instalar dependências) — hoje só a estrutura de arquivos existe, sem `node_modules`/build.
2. Criar as 4 telas de autenticação usando Supabase Auth.
3. Escrever o SQL das tabelas que faltam (`terrenos_jardim`, `desafios_diarios`, `conquistas`) e ajustar `comunidade_posts`.
4. Trocar o `localStorage` (`getStoredX`/`saveStoredX` de `supabase.ts` do protótipo) pelas chamadas reais ao Supabase dentro de cada componente/página.
5. `git init`, primeiro commit, push para o GitHub.


---

## Rodada: descontinuação do Scanner IA

A feature de reconhecimento de plantas por foto (Scanner IA / "Diagnóstico Inteligente") foi
**retirada do escopo** por restrição de tempo e recursos no cronograma. Remoção completa executada.

### Arquivos deletados

| Arquivo | O que era |
|---|---|
| `components/ScannerIA.tsx` | Tela do scanner: upload de imagem, campo de descrição, amostras, card de resultado |
| `components/ScannerClient.tsx` | Wrapper client: estado de XP e toast de recompensa ao "salvar no herbário" |
| `app/(app)/scanner/page.tsx` | Rota `/scanner` |
| `app/api/scan-plant/route.ts` | Route Handler que chamava a API Gemini (`gemini-3.6-flash`) |
| `app/api/` | Diretório removido — ficou vazio, era a única rota de API do projeto |

### Arquivos alterados

| Arquivo | Alteração |
|---|---|
| `components/BottomNav.tsx` | Removido o item "IA Scanner", o import do ícone `Scan` e toda a lógica de `isHighlight` (existia só para destacar o scanner). Nav passou de 6 para 5 abas. |
| `components/Navigation.tsx` | Idem, nas duas variantes (bottom nav mobile + sidebar desktop). Removidos também o selo "IA" do desktop e o ponto pulsante do mobile. `'scanner'` saiu do type `NavTab`. |
| `components/perfil/AtividadeTab.tsx` | `Scan` removido do mapa `ICONES` e do import |
| `lib/queries/dashboard.ts` | Atividade mockada "Identificou Amora com o Scanner de IA" trocada por uma do Desafio Diário |
| `data/plantasData.ts` | Desafio `d3` e conquista `c4` reescritos (ver abaixo) |
| `app/(app)/layout.tsx` | Comentário que listava "Scanner" entre as telas internas |

### Conteúdo que dependia do scanner — substituído, não apagado

Dois itens de gamificação ficariam **impossíveis de concluir** se apenas removidos, e sumir com eles
mudaria a contagem exibida na UI. Foram reescritos sobre features que já existem:

- **Desafio `d3` "Pesquisa Botânica"** — era "utilize o Scanner da Natureza com IA para analisar uma
  folha". Agora: "abra a Ficha Botânica de uma espécie que você ainda não estudou e registre-a no seu
  herbário". Mesma recompensa (120 XP / 40 moedas).
- **Conquista `c4`** — era "Cientista Cidadão: faça 3 escaneamentos com a IA". Agora **"Curador
  Atento": acerte as perguntas de Segurança e Contraindicação de 5 espécies** (ícone `ShieldAlert`),
  aproveitando o eixo criado na rodada anterior.

### Dependências órfãs

O projeto **ainda não tem `package.json`**, então não há nada a desinstalar hoje. O registro fica
para quando ele for criado:

- **`@google/genai`** era importado exclusivamente por `app/api/scan-plant/route.ts`. **Não deve
  entrar** no `package.json`.
- Nenhuma biblioteca de câmera ou ML estava em uso: o scanner lia arquivos via `<input type="file">`
  e `FileReader` (APIs nativas do browser), sem `react-webcam`, `tensorflow.js` ou similar. **Nada
  mais a remover.**
- Variável de ambiente **`GEMINI_API_KEY`** deixa de ser necessária. Não existe `.env` versionado
  no repositório; se ela estiver configurada no ambiente de deploy (Vercel etc.), pode ser excluída.

### Banco de dados

**Nada a remover.** As migrations ainda não foram escritas (`supabase/migrations/` está vazia) e o
scanner nunca teve tabela própria — o resultado do escaneamento vivia só em estado React e o "salvar
no herbário" apenas somava XP no mock. Quando o schema for escrito, apenas **não crie** o que estava
previsto para ele: nada de `scans_usuario`, `resultados_scanner` ou campo `origem: 'scanner'` em
`user_colecao`. A coleção passa a ter uma única origem: estudo pela Biblioteca.

### Verificação pós-remoção

- Nenhuma referência a `/scanner`, `ScannerIA`, `ScannerClient`, `scan-plant`, `ScannerIAResult`,
  `GoogleGenAI` ou `GEMINI_API_KEY` restou no código.
- Nenhum import órfão; nenhum link quebrado na navegação.
- Script de validação do banco de perguntas rodado de novo: 15 plantas, 60 perguntas, 15 por eixo,
  íntegro.

### Impacto no PROMPT do projeto

O documento `PROMPT_Ferramenta_Gamificada.docx` descreve a "Funcionalidade Inovadora — Diagnóstico
Inteligente" (envio de foto → identificação da espécie). **Esse trecho do PROMPT não é mais
implementado.** Vale alinhar com a autora como isso é apresentado na dissertação e na banca — a
sugestão é tratá-lo como trabalho futuro, já que o diferencial competitivo declarado no próprio
PROMPT é o **Herbário Virtual**, esse sim implementado.

---

## Decisão fechada: trilha de evolução com 8 níveis (GER-UI-12)

A divergência entre os dois protótipos foi resolvida por decisão de produto: em vez de
escolher uma das duas trilhas, elas foram **unificadas**, preservando os nomes de ambas e
adotando o teto de 5.000 XP da referência mais recente.

| Nível | Nome | XP | Ícone (lucide) | Origem |
|---|---|---|---|---|
| 1 | Semente do Saber | 0 | `Bean` | ambos os protótipos |
| 2 | Broto Curioso | 250 | `Sprout` | ambos os protótipos |
| 3 | Folha Exploradora | 700 | `Leaf` | protótipo recente ("Folha") |
| 4 | Raiz Digital | 1.250 | `Network` | novo — alusão à marca |
| 5 | Muda Boticária | 2.000 | `Shrub` | ambos ("Muda") |
| 6 | Flor da Saúde | 2.900 | `Flower` | primeiro protótipo ("Flores") |
| 7 | Guardião da Flora | 3.900 | `TreeDeciduous` | recente ("Guardião Verde") |
| 8 | Curador Botânico | 5.000 | `Award` | recente — título máximo |

**Curva:** os dois primeiros níveis são curtos de propósito (250 XP), para gerar sensação de
progresso já na primeira sessão. Do nível 4 em diante os intervalos crescem
(+550 → +750 → +900 → +1.000 → +1.100).

### Efeitos colaterais corrigidos junto

- **`calcularNivel(xp)` criada.** O mock trazia `xp: 240` com `nivel_atual: 2` — combinação
  impossível na curva. O nível agora é derivado; XP é o único dado a persistir.
- **`gameState` alinhado à referência**: `xp: 2850` (o número que aparece nos protótipos),
  resultando em Nível 5 — Muda Boticária.
- **Gates dos canteiros redistribuídos** (`lib/queries/jardim.ts`): iam só até `nivel_necessario: 4`,
  então com o novo estado tudo ficaria desbloqueado e o estado "Bloqueado" do canteiro nunca
  apareceria. Agora: 1, 1, 1, 4, 6, 8.
- **`getPlantEmoji` estendido de 6 para 8 casos** em `InicioDashboard` — os níveis 7 e 8 caíam
  no fallback. Marcado com TODO para o GER-UI-10 substituir por `<BadgeHexagonal>`.
- **Fallback do nome do nível** no layout atualizado.

### Validação

Script conferiu que a curva é contínua: sem lacunas nem sobreposições entre faixas, e nenhum
valor de XP testado (0 a 99.999) cai fora de um nível. Todos os 8 nomes de ícone verificados
como existentes no `lucide-react`. Build de produção: 32 páginas geradas, typecheck limpo.

---

## Sprint 2 — Layout Base (concluída)

### GER-UI-01 — Header claro
Barra verde escura (`#2f4d38`) com HUD de 4 contadores → header off-white de 56px com três
elementos, como na referência: marca (só no mobile — no desktop a sidebar já a exibe), pílula de
XP e avatar com nome + nível.

Removidos: contadores de sementes/adubo/ofensiva, badge "Nv.X" sobre o avatar e o selo "GERMINA
Offline Sync" — nenhum deles aparece nas 8 capturas. Os contadores **não foram apagados**:
migraram para o Jardim, único lugar do app onde esses recursos são efetivamente gastos. Um HUD
global de economia também empurrava a leitura para "jogo de fazendinha", oposto do tom acadêmico
da referência.

### GER-UI-02 — BottomNav
**Decisão de produto: o FAB central (+) foi retirado do escopo.** Ele aparece em todas as telas
mobile do protótipo, mas nenhuma define o que abre; um alvo de toque proeminente sem função custa
mais em confusão do que entrega em acesso. Com ele fora, os cinco slots ficam livres para destinos
reais — incluindo o Jardim, que na referência não tinha lugar na barra.

Outros ajustes: `md:hidden` (antes a barra de celular aparecia em qualquer largura),
`min-h-14` para alvo de toque acessível, `pb-[env(safe-area-inset-bottom)]` para o notch e
`aria-current="page"` no item ativo.

### GER-UI-03 — Sidebar desktop
O `Navigation.tsx` tinha uma sidebar completa e **nunca era importado**. Extraída para
`components/Sidebar.tsx` com três mudanças estruturais:

1. `<button onClick>` + `activeTab` → `<Link href>` + `usePathname()`. O padrão de abas com
   callback vem do protótipo AI Studio (SPA de tela única) e no App Router quebrava deep link,
   botão voltar e abrir em nova aba.
2. Cores por token.
3. Card "Seu progresso" e bloco de 3 estatísticas (espécies estudadas · plantas no herbário ·
   espécies raras RENISUS), que existiam na referência e não no componente antigo.

A barra de XP da sidebar já nasce no padrão do GER-UI-11: 6px, verde sólido, rótulo
`2.850 / 5.000 XP` e `role="progressbar"` com `aria-valuenow`. O `Navigation.tsx` antigo foi
deletado.

### GER-UI-05 — Gradientes removidos
- **Início**: banner `from-[#2f4d38] via-[#4d7a52] to-[#24506e]`, emoji 🌿 gigante em `opacity-10`
  e pílula "Jardim do Conhecimento Botânico" → cabeçalho de texto sobre o off-white
  ("Olá, Sarah! 🌿"), como no protótipo.
- **Jardim**: bloco verde sólido → cabeçalho de texto + painel de recursos em card claro.

### Validação
Build de produção: 32 páginas geradas, typecheck limpo. Conferido por script: nenhum hex solto
nos 5 arquivos da sprint, nenhum gradiente remanescente, `Navigation.tsx` removido e exatamente
uma navegação visível por breakpoint (`md:hidden` na BottomNav ↔ `hidden md:flex` na Sidebar).

### Observação para a Sprint 3
A `<BarraXP>` (GER-UI-11) já está implementada de fato dentro da Sidebar — ao criar o componente,
extrair de lá em vez de escrever do zero, e então reusar no `InicioDashboard`, que ainda usa a
barra antiga de 16px com gradiente de três cores e porcentagem.

---

## Sprint 3 — Gamificação (concluída)

Destravada pelo fechamento da trilha de 8 níveis (GER-UI-12).

### GER-UI-11 — `<BarraXP>`
Extraída da Sidebar (onde já havia nascido no padrão certo na Sprint 2) para
`components/gamificacao/BarraXP.tsx`, e reusada no `InicioDashboard`, que ainda tinha a barra
antiga: 16px de altura, borda verde, `shadow-inner` e preenchimento em gradiente de três cores,
exibindo a **porcentagem**. Agora: 6px, trilho neutro, verde sólido e rótulo em XP absoluto
(`2.850 / 5.000 XP`), como em todas as capturas — a porcentagem não aparece em nenhuma.
Inclui `role="progressbar"` com `aria-valuenow/min/max`; antes era uma `<div>` muda.

### GER-UI-10 — `<BadgeHexagonal>` e `<MedalhaConquista>`
A referência usa dois formatos com semântica distinta, e o código tinha colapsado ambos em
emoji: 🌱 com `animate-bounce` para nível, 🏆 para toda conquista.

- **Hexágono** (nível): `clip-path`, sem imagem — escala em qualquer tamanho, herda token e não
  adiciona requisição. Estados `bloqueado` (dessaturado + cadeado) e `destacado` (halo do nível
  atual, feito com um segundo hexágono atrás, já que `ring` não acompanha `clip-path`).
- **Medalha** (conquista): círculo com anel bronze/prata/ouro e check verde quando desbloqueada.
  A **raridade é derivada do esforço** (`total`) em vez de virar mais um campo no banco — assim
  não existe o caso contraditório de uma conquista "ouro" que se completa com 1 ação.

**Bug corrigido junto:** `ConquistasTab` ignorava o campo `conquista.icone` — o dado existia
(`'Sprout'`, `'Wheat'`, `'ShieldAlert'`…) e nunca chegava à tela. Criado `lib/icones.ts` como
ponte string → componente, com import nomeado para preservar tree-shaking (o lucide tem +1.500
ícones).

### GER-UI-09 — `<TimelineEvolucao>`
`NIVEIS_EVOLUCAO` era importado em três arquivos e usado **só** para `.find()` do nível atual; a
trilha nunca havia sido renderizada, apesar de aparecer em três telas da referência.

Três estados por nó (concluído / atual / bloqueado), conector verde até o nível atual e cinza
depois. No mobile rola horizontalmente e **centraliza o nível atual no mount** — com 8 níveis
isso deixou de ser luxo: eles não cabem em 380px e, sem isso, a tela abriria sempre no nível 1.
O scroll ajusta o `scrollLeft` do próprio container em vez de usar `scrollIntoView`, que moveria
a página inteira.

Renderizada no `InicioDashboard` (abaixo do card de nível) e no `PerfilEConfiguracoes`.

### Limpeza
Removidos do `InicioDashboard`: `getPlantEmoji` (8 casos), `percentualXp`, `xpMin`, `xpMax`,
`xpRange` e `xpProgresso` — todos órfãos após a troca. `xpFaltante` foi corrigido de
`xpMax - xp` para `proximoNivel.xpMin - xp`, que é o que a legenda realmente quer dizer.

### Validação
Build: 32 páginas, typecheck limpo. Script confere que a timeline sempre tem exatamente um nó
"atual" e que os concluídos precedem o atual (testado nos níveis 1, 5 e 8). Nenhuma barra de XP
antiga e nenhum emoji de nível/conquista restante.

**Nota:** os hex soltos que permanecem em `MedalhaConquista.tsx` são os acabamentos metálicos
(bronze/prata/ouro). São intencionais e não entram no `@theme` porque não são cores de marca —
não devem ficar disponíveis como utilitário para o resto do app.

### Pendência herdada
`JardimConhecimento` ainda usa `animate-bounce` num botão âmbar de colheita. Será tratado na
Sprint 4, junto com a reconstrução da tela.

---

## Sprint 4 (parte 1) — GER-UI-14 + GER-UI-15

Entrega **estrutural apenas**. A cena da horta (GER-UI-13) e o rebalanceamento da tela
(GER-UI-16) ficam para a próxima entrega, isoladas em commit próprio.

### GER-UI-14 — Componentização do `<Canteiro>`

O bloco antigo tinha ~120 linhas dentro do `.map()`, com os três estados decididos por
**ternários aninhados repetidos em quatro pontos do JSX** (moldura, cabeçalho, ilustração e
botões), cada um reavaliando as mesmas condições. A regra ficava duplicada e nada garantia que
os quatro blocos concordassem entre si.

Arquivos novos:

| Arquivo | Papel |
|---|---|
| `lib/jardim.ts` | União discriminada `EstadoCanteiro` + `derivarEstadoCanteiro()` |
| `components/jardim/Canteiro.tsx` | Dispatcher com `switch` exaustivo |
| `components/jardim/CanteiroBloqueado.tsx` | Estado 1 |
| `components/jardim/CanteiroVazio.tsx` | Estado 2 |
| `components/jardim/CanteiroCultivado.tsx` | Estado 3 |

Decisões que valem registro:

- **A decisão de estado acontece uma vez só**, em `derivarEstadoCanteiro()`. O componente só faz
  `switch`. O `const _exaustivo: never = estado` no `default` faz o TypeScript **falhar em
  compilação** se um quarto estado for adicionado à união e esquecido no dispatcher — garantia
  que o ternário não oferecia.
- **Bloqueio tem precedência sobre tudo.** Um canteiro acima do nível do usuário é "bloqueado"
  mesmo trazendo `planta_id` (dado inconsistente que o tipo não impede). Testado.
- **`FaseCultivada = Exclude<FaseCultivo, 'vazio'>`**: no estado cultivado, a fase 'vazio' é
  impossível *no nível do tipo*, não por convenção.
- **As regras de "pode agir" ficaram no container**, que é quem enxerga o inventário. Os
  subcomponentes só refletem a decisão — permanecem burros e testáveis.
- **Motivo do bloqueio agora é visível**: antes, clicar num botão desabilitado disparava um toast
  explicando o porquê; o usuário só descobria depois de tentar. Agora o motivo aparece sob o botão.

### GER-UI-15 — Rótulos de fase

`Fase: {terreno.fase}` com `capitalize` vazava o enum do banco direto para a tela. Substituído
por `ROTULO_FASE` + `DESCRICAO_FASE`, ambos `Record<FaseCultivo, string>` **exaustivos**: se
alguém acrescentar uma fase ao enum, o TypeScript acusa o rótulo faltando em vez de deixar um
valor de sistema chegar à UI.

| Enum | Rótulo exibido |
|---|---|
| `vazio` | Espaço livre |
| `semente` | Recém-plantada |
| `broto` | Crescendo |
| `muda` | Em desenvolvimento |
| `flor` | Florescendo |
| `pronto` | Pronta para colher |

A tag usa o verde-lima `#d4e5af` amostrado da referência, já pelo token `bg-green-soft`.

### Efeitos colaterais

- `getFaseEmoji` migrou do container para `CanteiroCultivado` como `ILUSTRACAO_FASE`, agora
  tipado por `FaseCultivada` (antes recebia `string` e tinha um `default` inalcançável).
- `animate-bounce` do botão de colheita e `animate-pulse` da ilustração removidos — pendência
  herdada da Sprint 3, resolvida aqui.
- Botões migrados para `<Button>` (GER-UI-06): "Plantar" e "Colher" como `secondary` (ação sobre
  o organismo vivo), "Adubar" como `ghost`.
- Estado "adubado" ganhou feedback visual próprio; antes o botão de adubar continuava lá,
  clicável, sem indicar que já havia sido usado.
- Grid virou `<ul>/<li>` — é uma lista, e antes era `<div>` de `<div>`.

### Validação
Build: 32 páginas, typecheck limpo. Teste de derivação confirma que, com o usuário no nível 5,
os três estados aparecem **simultaneamente** na tela (2 cultivados, 2 vazios, 2 bloqueados) — o
que só é verdade por causa dos gates redistribuídos junto com a trilha de 8 níveis.

### Seletor de espécie movido para dentro do canteiro

Pendência resolvida ainda nesta entrega, por ser estrutural (não visual). O `<select>` global no
topo da tela foi eliminado; "Plantar" agora abre a lista de espécies estudadas **dentro do
próprio canteiro**, e a escolha planta imediatamente.

Três problemas que aquilo causava:

1. **Distância entre decisão e efeito** — escolhia-se a espécie no topo e clicava-se no canteiro
   lá embaixo, sem confirmação de qual planta iria para qual lugar.
2. **Estado global desnecessário** — `sementeSelecionada` vivia no container e era compartilhado
   por todos os canteiros, embora só um receba a planta. O estado agora é local ao
   `CanteiroVazio` e morre com a interação.
3. **Fricção** — plantar em canteiros diferentes exigia subir e descer a tela a cada vez.

Detalhes de acessibilidade: o painel fecha com `Esc` (antes o único jeito de desistir seria
plantar algo) e recebe foco ao abrir, para quem navega por teclado. Espécies RENISUS aparecem com
estrela, como no `<select>` antigo.

A assinatura mudou de `onPlantar: () => void` para `onPlantar: (plantaId: string) => void` — a
identidade da espécie agora viaja com o evento, em vez de ser lida de um estado externo. E o
toast passou a nomear a planta ("Crajiru plantada com sucesso!").

### Ainda pendente nesta tela
Nada estrutural. O que resta é visual e pertence ao GER-UI-13 (cena da horta) e ao GER-UI-16
(rebalanceamento da composição).

---

## Sprint 4 (parte 2) — GER-UI-13: cena do Jardim em SVG plano

Decisão: **flat design estilizado em SVG/CSS**, abandonando o fotorrealismo. Além dos motivos de
performance e escala, a razão de coesão pesou: o resto do app é plano (cards com sombra sutil,
ícones de traço, cor chapada). Uma pintura rasterizada no meio disso pareceria colada.

### Diretriz 1 — Performance mobile
Zero `blur`, `filter` ou `backdrop-filter` na tela inteira. `blur-3xl` força o navegador a
rasterizar a camada e reprocessá-la a cada repaint — barato num MacBook, caro num Android de
entrada, que é o aparelho do público em Itacoatiara.

A profundidade atmosférica (o azulado das montanhas distantes) vem de **variação de matiz e
saturação entre camadas**, não de desfoque — é como a pintura resolve, e sai de graça em SVG.
A luz ambiente do topo é um `radialGradient`, não um overlay borrado.

Os 90 tufos de capim usam distribuição **pseudoaleatória determinística** (`(i * 137) % 1200`) em
vez de `Math.random()`: valores aleatórios gerariam markup diferente no servidor e no cliente,
causando erro de hidratação.

### Diretriz 2 — Componentização do fundo
Todo o cenário isolado em `components/jardim/FundoHorta.tsx`. O `JardimConhecimento` não contém
nenhuma div de paisagem — só empilha `<FundoHorta className="absolute inset-0 z-0" />` atrás do
grid. Se um dia entrar uma ilustração rasterizada, troca-se o conteúdo **desse arquivo** por uma
`<Image />` e nada mais muda.

`viewBox` fixo + `preserveAspectRatio="xMidYMid slice"` faz a cena preencher qualquer proporção
sem distorcer — mesmo comportamento de `object-cover`.

### Diretriz 3 — 8 níveis = 8 canteiros
A regra virou **invariante derivada**: `lib/queries/jardim.ts` gera os terrenos a partir de
`NIVEIS_EVOLUCAO`, com `nivel_necessario === id`. Não é mock digitado à mão; se a trilha mudar de
tamanho, a horta acompanha sozinha.

Distribuição em três fileiras (fundo 2 · meio 3 · frente 3), com escala decrescente para o fundo
(1.0 → 0.93 → 0.86) e largura máxima menor nas fileiras distantes, reforçando o ponto de fuga.
A numeração cresce do fundo para a frente, então **ordem de leitura = ordem visual = ordem dos
níveis**, e a fileira da frente é desenhada por último no DOM, sobrepondo-se naturalmente.

Os gates da referência ("desbloqueie no nível 10, 12, 15, 18") vinham de uma proposta anterior com
mais níveis e são impossíveis na trilha de 8 — remapeados para 1–8.

### Diretriz 4 — Arte das plantas em SVG
`IlustracaoPlanta.tsx`: cinco desenhos, um por fase. A identidade da **espécie** não é carregada
pelo desenho — é carregada pela pílula com o nome, exatamente como na referência. O desenho
comunica o **estágio de crescimento**, que é o que muda com o tempo e é o ponto do jogo.

O único traço específico da espécie é a cor da flor, derivada da `categoria` do catálogo. Assim
calêndula (digestiva, laranja) e camomila (calmante, lilás) não florescem iguais, sem exigir 15
ilustrações.

### O canteiro
A referência mostra **elipse de proporção ~2,2:1**, não círculo — é vista de cima em ângulo.
`rounded-full` daria círculo e quebraria a perspectiva da cena inteira. Implementado com
`viewBox` 200×108 e elipse `rx=84 ry=38` (2,21:1).

O anel de pedras individuais usa `stroke-dasharray` sobre a elipse: cada traço é uma pedra, cada
espaço é a argamassa. Resolve em uma linha o que seriam ~24 elementos posicionados por
trigonometria, e escala sozinho.

`useId()` é obrigatório nos gradientes: são 8 canteiros na tela e IDs fixos colidiriam — todos
herdariam o preenchimento do primeiro que o navegador encontrasse.

Cores amostradas por pixel da referência: terra `#332e11`, pedra `#797d4a`, pílula do nome
`#3a5d3f`, tag de status `#d4e5af` (que confirma o token `--color-green-soft` criado na Sprint 1).

### Ajustes após inspeção visual
A cena foi rasterizada e comparada com a referência lado a lado. Quatro correções na primeira
iteração: planta ampliada de 52% para 78% da largura do canteiro (na referência ela domina e
transborda o anel), montanhas rebaixadas e dessaturadas, pedras aproximadas (`dasharray` de
`17 6` para `13 4.5`) e textura de capim adicionada ao campo, que estava chapado demais.

### Validação
Build: 32 páginas, typecheck limpo. Verificado por script: zero filtros pesados, zero div de
cenário no container, 8 canteiros, 5 fases cobertas, proporção da elipse fiel à amostrada.
Com o usuário no nível 5, os três estados aparecem simultaneamente (3 cultivados, 2 vazios,
3 bloqueados).

### Pendente
GER-UI-16 — recolher a Loja do Conhecimento e ocupar o espaço com Desafio Diário e Missões.

---

## Revisão de paleta do Jardim

Diagnóstico aceito: a paleta anterior sofria de baixa saturação e excesso de cinza — verde-oliva
do fundo à frente, produzindo o aspecto de "camuflagem militar" em vez de jardim vivo.

### Centralização
Todas as cores da cena passaram a viver em **`lib/paletaJardim.ts`**. Antes estavam espalhadas
por três componentes, o que tornava qualquer reajuste uma caçada. Hoje `components/jardim/`
não tem nenhum hex literal além de preto e branco puros (sombra de contato e luz ambiente).

A paleta fica **fora do `@theme`** de propósito, pela mesma razão dos acabamentos metálicos das
medalhas: virar utilitário Tailwind a tornaria disponível para o app inteiro, e `bg-grama-base`
num botão seria um erro difícil de pegar em revisão.

### Substituições aplicadas

| Elemento | Antes | Depois |
|---|---|---|
| Céu (topo → horizonte) | `#cfe0e8 → #eef3e6` | `#a4c8e1 → #cfe3ee → #f2f7f9` |
| Montanha distante | `#aec2c4` | `#7ca1b4` |
| Montanha próxima | `#9db292` | `#638c9f` |
| Árvores distantes | `#7c9268` | `#57a373` |
| Árvores próximas | `#6a8156` | `#428c5c` |
| Gramado (3 faixas) | `#8ca374 → #6d8450` | `#7fb87a → #73b06f → #629f5d` |
| Caminhos | `#b9a780 / #a89571` | `#d4a373 / #c89f70` |
| Terra do canteiro | `#584028 → #332e11` | `#5d4037 → #3e2723` |
| Anel de pedras | `#a9aa7c → #797d4a` | `#b6bdca → #8b93a3` |
| Capim / arbustos | verdes oliva | família `#42874a`–`#5faa62` |

**Uma divergência da especificação, com motivo:** a proposta trazia um verde único (`#428c5c`)
para toda a linha de árvores. Aplicá-lo nas duas fileiras colapsaria a profundidade que elas
criam, então ele virou a fileira **próxima**, e a distante recebeu `#57a373` — mais clara e
levemente azulada, seguindo a mesma perspectiva atmosférica adotada nas montanhas.

### Pílulas migradas para tokens
`#3a5d3f` → `bg-green-deep` (nome da espécie) e `#37452c` → `bg-blue-deep` (aviso de bloqueio).
Mensagem de sistema usa o azul da marca; rótulo de natureza usa o verde. A tag de status já
usava `bg-green-soft` (`#d4e5af`).

### Correção de composição
Medindo a saturação média contra a referência (56,5%), a cena ficou em 29,6% mesmo após as novas
cores. A causa não era a paleta: era **proporção de céu**. A cena dedicava 39% da altura ao céu —
matiz de baixa saturação por natureza — enquanto a referência é quase toda jardim.

O horizonte subiu para ~25% via um único `transform="translate(0,-90)"` no bloco de fundo, com
caminhos e arbustos redistribuídos. Para reverter, basta alterar esse valor.

### Ilustração da planta
`viewBox` recortado de `0 0 120 120` para `20 38 80 74`. O desenho tinha margem vazia em volta e
renderizava pequeno dentro do canteiro; na referência a planta domina e transborda o anel.

### Validação
Build: 32 páginas, typecheck limpo. Cena rasterizada e comparada com a referência a cada
iteração — foram três rodadas até a composição fechar.

**Observação honesta:** a saturação medida segue abaixo da referência (30,9% × 56,5%). A
diferença restante é de *natureza da arte*: a referência é uma pintura com folhagem densa e
irregular preenchendo cada pixel, enquanto a nossa é vetorial e usa áreas chapadas amplas.
Aumentar mais a saturação dos verdes chapados produziria cor artificial, não riqueza. Se a
vivacidade ainda parecer insuficiente ao ver no navegador, o caminho é aumentar a densidade de
elementos (mais arbustos, tufos e flores silvestres), não a saturação.

---

## Sprint 4 (parte 3) — GER-UI-16: recomposição da tela do Jardim

Último card do backlog de UI. **Sprint 4 concluída.**

### A loja foi recolhida, não removida
Ela ocupava um terço da tela com três cards grandes sempre visíveis; na referência não aparece —
o espaço à direita é do Desafio Diário e das Missões, e a loja é só um botão discreto.

Extraída para `components/jardim/LojaModal.tsx`, acessível por um botão junto aos contadores de
recurso. **Recolher, não sumir**, porque a loja é onde o ciclo da economia fecha: `sementes`,
`adubo` e `moedas` já existem no gameState e, sem lugar para gastar, viram números decorativos.

O modal traz o que a versão em cards não tinha: fecha com `Esc`, trava o scroll do fundo,
`role="dialog"` + `aria-modal`, foco movido ao abrir, e — em vez de deixar o usuário clicar para
só então descobrir que não tem moedas — mostra **quanto falta** ("Faltam 12 moedas") com o botão
já desabilitado.

### O que ocupou o espaço
`components/jardim/PainelJardim.tsx`, em coluna de 320px a partir de `lg` (empilha no mobile):

- **Desafio Diário** — o gancho de volta ao loop de estudo, com botão `primary` azul para
  `/desafio-diario`.
- **Missões em andamento** — três barras de progresso reusando `<BarraXP>` da Sprint 3.

As missões são **derivadas do estado real** (canteiros ocupados, espécies na coleção, ofensiva),
não de um mock separado. Números inventados aqui divergiriam do que a cena ao lado mostra — o
tipo de inconsistência que ninguém percebe até a banca perceber.

### Validação
Build: 32 páginas, typecheck limpo. Verificado por script que nenhuma missão pode exibir
progresso acima da meta nem meta zero (divisão inválida). O único hex literal restante é
`#d4a017` no ícone de moeda, coerente com o acabamento "ouro" das medalhas.

---

# Backlog de UI concluído

Os 16 cards (`GER-UI-01` a `GER-UI-16`) foram entregues, mais o `GER-UI-12` (decisão de níveis)
e o scaffolding do projeto, que não existia.

| Sprint | Cards | Situação |
|---|---|---|
| 1 — Fundação | 07, 08, 04, 06 | ✅ |
| 2 — Layout base | 01, 02, 03, 05 | ✅ |
| 3 — Gamificação | 12, 09, 10, 11 | ✅ |
| 4 — Jardim | 14, 15, 13, 16 | ✅ |

## O que continua em aberto (fora do escopo de UI)

**Conteúdo — depende da autora:**
1. Cumaru: campo "Dados sobre o uso" descreve composição do óleo, não preparo
2. Cuia-mansa: "Escassez de material" em fitoquímica e contraindicações
3. Boldinho japonês: *Mentha alverensis* (tabela) vs *Mentha arvensis* (ficha)
4. Cidreira: link de "Fotos — Fonte" aponta para a página da Terramicina
5. Eixo ODS: destino das 3 perguntas preservadas fora do banco
6. Categoria da Corama alterada para `Digestiva` — ratificar
7. Validação das 60 perguntas pelo Comitê Ad Hoc

**Produto:**
8. Pontuação: erro concede 5 pontos (25 XP); RENISUS não vale XP dobrado no quiz
9. Fonte tipográfica: Inter é provisória; confirmar a do Canva
10. Ilustração do jardim: decidir se a cena em SVG basta

**Técnico — próxima fronteira:**
11. `supabase/migrations/` está vazia. Nenhuma tabela criada: `terrenos_jardim`,
    `quiz_perguntas`, `quiz_respostas_usuario`, `user_colecao`, `conquistas`, `atividades`.
12. Todo `lib/queries/*` retorna mock. As assinaturas já estão no formato final, então a troca é
    localizada — mas é o maior bloco de trabalho restante.
13. Autenticação: telas prontas, Supabase Auth não conectado.
14. Persistência do Desafio Diário: `jaCompletouHoje` é estado local e some ao recarregar; a
    ofensiva não é real.

---

## Sprint de QA — QA-02 (nível congelado) e QA-04 (teto de XP)

### Causa raiz
Havia **dois dados que precisavam concordar** (`xp` e `nivel_atual`) e **três lugares livres para
alterar um sem o outro**. A correção não foi lembrar de chamar `calcularNivel()` em cada handler —
foi remover a possibilidade de esquecer.

### Novo arquivo: `lib/gamificacao.ts`
`aplicarGanho(estado, ganho)` é a única função autorizada a escrever em `xp` e `nivel_atual`.
Retorna `{ estado, subiuDeNivel, nomeNivelNovo, atingiuNivelMaximo }` para que o chamador possa
reagir à promoção. `debitarRecursos()` acompanha, para que toda alteração de economia esteja num
arquivo só.

**Regra de revisão:** se aparecer `xp: prev.xp +` fora de `lib/gamificacao.ts`, é bug.

### Um terceiro ponto de mutação que a auditoria não pegou
A varredura de QA identificou dois handlers (Jardim e Desafio Diário). Ao aplicar a correção, o
grep revelou um **terceiro**: `InicioClient.tsx:44`, na conclusão de desafios de ação, com o mesmo
defeito. Foi centralizado junto. Hoje a varredura devolve zero mutações soltas.

### QA-04 — teto
`calcularNivel()` satura explicitamente no último nível: qualquer XP ≥ 5.000 devolve o Nível 8.
O **XP acumulado não é truncado** — continua somando, porque serve de base para ranking e para as
estatísticas da dissertação. O que trava é a progressão na trilha.

`BarraXP` ganhou `textoMaximo` (padrão `'Nível máximo'`), exibido no lugar da fração quando
`xp >= max` — senão a UI mostraria "5.250 / 5.000 XP". Barras que não representam nível (missões
do Jardim) passam `textoMaximo={null}`.

### Guardas adicionadas
- XP negativo por bug de chamada é contido em 0: o nível nunca regride por sinal trocado.
- `NaN` cai no nível 1 em vez de quebrar o `.find()`.

### Ganho colateral
Subir de nível libera um canteiro, e isso acontecia em silêncio. O Jardim agora exibe um banner
`role="status"`: *"Novo nível: Flor da Saúde! Um canteiro foi liberado."*

### Validação
Simulação de 60 colheitas a partir de 2.850 XP:

| | Antes | Depois |
|---|---|---|
| XP final | 5.250 | 5.250 |
| `nivel_atual` | 5 (congelado) | 8 |
| Canteiros liberados | 5/8 | 8/8 |
| Promoções anunciadas | 0 | 3 (níveis 6, 7, 8) |

Teto conferido em 4.999 → 7, 5.000 → 8, 9.999 → 8, 50.000 → 8. Build: 32 páginas, typecheck limpo.

### Ainda aberto na Sprint de QA
QA-01 (jardim não cresce), QA-03 (loja credita 1 e anuncia 3/5 — marcado com TODO no handler),
QA-05 (ofensiva conta sessão, não dia).

---

## Sprint de QA — QA-01: o jardim nunca crescia

### A correção não foi "adicionar um timer" — foi trocar o modelo
`fase` deixou de ser **armazenada** e passou a ser **derivada** de `plantado_em`. Guardar as duas
coisas recriaria a classe de bug do QA-02: dois dados que precisam concordar e vários lugares
livres para alterar um sem o outro.

`TerrenoJardim` perdeu `fase` e `tempo_restante_segundos`; ganhou `plantado_em` (epoch ms) e
`bonus_adubo_ms`. Ocupação passou a ser decidida pela presença de `planta_id`.

### Como o tempo é calculado
```
decorrido = (agora − plantado_em) + bonus_adubo_ms
fase      = primeira faixa cuja soma acumulada de durações ainda não foi ultrapassada
```
`calcularProgresso(terreno, agora)` é **função pura**: recebe o instante em vez de chamar
`Date.now()` internamente, o que a torna testável sem mock de relógio e permite que servidor e
cliente usem o mesmo instante no primeiro render.

Durações (`DURACAO_FASE_MS`): 1 + 2 + 3 + 4 minutos = ciclo completo em 10 min. Curto de propósito
nesta etapa, para que a banca veja a horta evoluir numa sessão. É o único lugar a alterar para
produção.

### O intervalo não muta nada
O `useEffect` roda `setInterval(() => setAgora(Date.now()), 1000)` e **só avança o relógio** —
nenhum terreno é modificado por ele. Se o navegador estrangular o timer com a aba minimizada,
nada se perde: o próximo tick lê o relógio real e a planta aparece na fase correta. Testado com
salto de 10 minutos sem nenhum tick intermediário — a planta chega em `pronto`.

`clearInterval` no cleanup: sem ele, cada visita ao Jardim deixaria um intervalo órfão chamando
setState em componente desmontado.

### Hidratação
`agoraInicial` vem do Server Component e é o valor do primeiro render no cliente. Sem isso, uma
planta na virada de fase renderizaria diferente nos dois lados e o React acusaria mismatch.

### Adubo
Adianta o relógio (`bonus_adubo_ms += 90s`) em vez de encurtar um contador — equivale a ter
plantado antes, e combina naturalmente com o modelo de timestamp.

### Guarda de colheita
`handleColherPlanta` recusa colher o que não está pronto. A UI já só mostra o botão em `pronto`,
mas o handler não pode confiar nisso: um clique fora de hora daria XP grátis.

### Contador visível
Cada canteiro cultivado exibe o tempo até a próxima fase. Sem isso o crescimento era invisível e
a horta parecia travada mesmo evoluindo.

### Validação
Progressão conferida instante a instante: `semente → broto → muda → flor → pronto` nos limites
exatos (59s/60s, 179s/180s, 359s/360s, 599s/600s). As 5 fases são todas alcançáveis. Adubo em
t=30s promove de `semente` para `broto`. Colheita em t=60s é bloqueada. Build: 32 páginas.

### Ainda aberto na Sprint de QA
QA-03 (loja credita 1, anuncia 3/5) e QA-05 (ofensiva conta sessão, não dia).

---

## Sprint de QA — QA-03: loja creditava 1 e anunciava 3/5

### O bug
O modal anunciava "+3 adubos" e "+5 sementes", e o toast confirmava "Você comprou 3 adubos
orgânicos!". O handler creditava **1**. O usuário pagava 40 moedas e recebia um terço do
prometido.

### A causa
A quantidade existia em **três lugares independentes**: o texto do card (`retorno`), o texto do
toast (`mensagemSucesso`) e o `+ 1` chumbado dentro de `handleComprarItem`. Nada os obrigava a
concordar — e não concordavam.

### A correção
Novo `lib/loja.ts` como fonte única. `quantidade` virou dado, e **tanto os textos quanto o
crédito são derivados dele**:

- `rotuloRetorno(item)` → "+3 adubos"
- `mensagemSucesso(item)` → "Você comprou 3 adubos!"
- o handler credita `item.quantidade`

Não existe mais como anunciar 3 e creditar 1 — seria preciso mudar o mesmo número. É o terceiro
bug seguido da mesma família (`nivel_atual` no QA-02, `fase` no QA-01): **um valor de verdade, o
resto derivado**.

### Mudança de contrato
`onComprarItem` foi de `(tipo, custo, nome)` para `(itemId)`. Preço e quantidade não trafegam mais
pela UI — a camada visual não deve ser capaz de informar um preço ao handler, senão ela pode
informar o preço errado. O `ItemLoja` duplicado dentro do `LojaModal` foi eliminado.

### Correção colateral
O card do item passou a **exibir** o retorno ("+3 adubos"), que antes existia no dado mas nunca
era renderizado — o usuário só descobria a quantidade lendo o toast depois de pagar.

### Validação
Para cada item, conferido que o anunciado é igual ao creditado e que o toast cita o mesmo número:
adubo 3/3, sementes 5/5, tema 1/1 (desbloqueio). Compra sem saldo não altera estado. Id
inexistente é ignorado sem debitar. Build: 32 páginas, typecheck limpo.

### Ainda aberto na Sprint de QA
QA-05 (ofensiva conta sessão, não dia) — último blocker.

---

## Sprint de QA — QA-05: ofensiva contava sessão, não dia

**Último blocker. Sprint de QA concluída.**

### O bug
`streak: jaCompletouHoje ? streak : streak + 1`, com `jaCompletouHoje` sendo um `useState(false)`.
Recarregar a página zerava a flag: concluir o desafio, dar F5 e concluir de novo incrementava a
ofensiva **infinitas vezes no mesmo dia**. Não havia comparação de datas em lugar nenhum.

### A correção
Novo `lib/ofensiva.ts`. A ofensiva deixou de depender do ciclo de vida do componente e passou a
ser função de duas datas: a do último desafio concluído (`ultimo_desafio_em`, novo campo do
`GameState`) e a de hoje. Recarregar a página não muda nenhuma das duas.

`jaCompletouHoje` virou valor **derivado** de `lerOfensiva()`, não estado. Quarto bug seguido da
mesma família — `nivel_atual` (QA-02), `fase` (QA-01), `quantidade` (QA-03) e agora `streak`.

### Data-only, não timestamp
Ofensiva é regra de calendário, não de intervalo: quem estuda às 23h50 de segunda e às 00h10 de
terça manteve dois dias seguidos, ainda que tenham passado 20 minutos. Comparar timestamps daria
o resultado errado.

### Fuso horário — o detalhe que mais importava aqui
`diaLocal()` usa os getters locais, **não `toISOString()`**. Verificado rodando o teste em
`TZ=America/Manaus` (UTC-4):

| Hora local | `diaLocal()` | `toISOString()` |
|---|---|---|
| 19:00 | 2026-08-17 | 2026-08-17 |
| 20:30 | 2026-08-17 | **2026-08-18** |
| 23:50 | 2026-08-17 | **2026-08-18** |

Ou seja: com UTC, **todo estudo após as 20h em Itacoatiara seria contado no dia seguinte** e
quebraria a ofensiva de quem estuda à noite — provavelmente a maior parte do público.

`diferencaEmDias()` ancora as datas ao meio-dia UTC, para que horário de verão (deslocamento de
1h) nunca vire a contagem.

### Guarda contra relógio adiantado
Data futura (aparelho com relógio errado, ou fuso trocado em viagem) é tratada como "hoje" em vez
de quebrar a ofensiva de quem não fez nada errado.

### Validação
| Cenário | Antes | Depois |
|---|---|---|
| Concluir + 10 reloads no mesmo dia | 15 | **5** |
| Nunca jogou | — | 1 |
| Jogou ontem | 4 | 5 |
| Já jogou hoje | 5 | 5 |
| Faltou 1 dia | 9 | 1 |
| Virada de mês / ano / bissexto | — | ✅ |
| Relógio adiantado | — | preserva |

Build: 32 páginas, typecheck limpo.

---

# Sprint de QA concluída

| Card | Situação |
|---|---|
| 🔴 QA-01 — Jardim nunca cresce | ✅ crescimento por timestamp |
| 🔴 QA-02 — Nível congelado | ✅ `aplicarGanho()` centralizado |
| 🔴 QA-03 — Loja credita 1, anuncia 3/5 | ✅ catálogo único |
| 🔴 QA-04 — XP sem teto | ✅ nível satura no 8 |
| 🔴 QA-05 — Ofensiva por sessão | ✅ cálculo por data |

**Os 5 blockers estão fechados. O Core Loop está íntegro:** plantar → crescer → colher → ganhar
XP → subir de nível → desbloquear canteiro → comprar na loja → plantar de novo.

## Lição transversal
Os cinco bugs eram a **mesma falha de modelagem**: um dado que deveria ser derivado estava sendo
armazenado, e havia mais de um lugar livre para alterá-lo. `nivel_atual`, `fase`, `quantidade`,
`jaCompletouHoje` — todos viraram derivações de uma única fonte de verdade.

**Ao escrever as migrations do Supabase, aplicar o mesmo critério:** persistir `xp`,
`plantado_em`, `ultimo_desafio_em` e `planta_id`; **não** persistir `nivel_atual`, `fase` nem
`streak`, que são funções desses.

## Pendências restantes (🟡 e 🟢 da auditoria)
QA-06 (rotas `/termos` e `/privacidade` inexistentes), QA-07 (categoria `Geral` sem filtro no
Herbário), QA-08 (191 hex antigos em 16 arquivos), QA-09 a QA-17.

---

## QA-07 — Espécies inalcançáveis pelo filtro do Herbário

**Bug:** os botões de categoria estavam chumbados em 5 valores, mas o catálogo tem 6. A categoria
`Geral` não tinha botão, então **Amora, Abacate e Cuia-mansa** só apareciam em "Todas".

**Correção:** a lista passou a ser derivada com `useMemo`, junto da contagem por categoria. Não
pode mais divergir do catálogo — acrescentar uma categoria a uma ficha faz o botão aparecer
sozinho, e a contagem torna impossível existir botão que não devolve nada.

**Desvio da diretriz, com motivo:** a orientação era derivar de `PLANTAS_CATALOGO`, mas o
componente já recebe `plantas` por prop. Derivei da prop. Se um dia a tela receber um subconjunto
(busca pré-filtrada, herbário parcial), derivar do catálogo global geraria botões que não
devolvem nada — o mesmo tipo de divergência que este card corrige.

**Validação:** 6 botões gerados, cada um devolvendo exatamente a quantidade anunciada; a soma das
categorias (15) bate com o total do catálogo, provando que nenhuma espécie ficou órfã. Build: 32
páginas, typecheck limpo.

---

## QA-08 (parte 1) — Design System no Herbário e na Ficha Botânica

Migração mecânica dos dois arquivos: **29 ocorrências legadas → 0**.

### Mapeamento aplicado

| Antes | Depois | Uso |
|---|---|---|
| `text-[#2f4d38]` | `text-green-deep` | títulos e rótulos |
| `bg-[#2f4d38]` | `bg-green-deep` | filtro ativo, selo ODS, CTA |
| `[#4d7a52]` | `green-main` | hover, foco, marcadores |
| `bg-[#24506e]` | `bg-blue-main` | categoria selecionada |
| `bg-[#16283f]/80` | `bg-blue-deep/80` | selo RENISUS sobre a foto |
| `bg-[#8fb996]/30` | `bg-green-soft` | pílula de contagem |
| `border-[#8fb996]/30–40` | `border-black/[0.04]` + `shadow-card` | superfícies |
| `bg-[#f3f6f0]` | `bg-surface-alt` | blocos leves |
| `text-emerald-200` | `text-green-soft` | texto sobre fundo escuro |
| `slate-*` | `ink-muted` / `locked` / `black/…` | neutros |
| `font-black`, `font-extrabold` | `font-bold` | tipografia |

### Decisões que fugiram do find/replace direto
- **`font-extrabold` também foi convertido.** A diretriz citava só `font-black`, mas o peso 800
  igualmente não aparece na referência; deixá-lo manteria a inconsistência que o card corrige.
- **`text-slate-400` em rótulos de seção** virou `text-ink-muted`: slate-400 sobre off-white tem
  contraste insuficiente para texto.
- **Fundo atrás da foto da ficha** (`bg-slate-900`) virou `bg-blue-deep`. Continua escuro — evita
  o flash branco antes de a imagem pintar — mas no azul da marca.
- **Botões RENISUS (âmbar) e Colecionadas (esmeralda) foram preservados.** São cores semânticas de
  destaque, não resíduo da paleta antiga; alterá-las seria decisão de design, não migração.

### Verificação de não-regressão
Além do build, um script comparou os arquivos com a versão anterior **removendo o conteúdo de
todo `className`**: as duas estruturas saíram idênticas, provando que nenhuma lógica, hook,
import ou mapeamento foi tocado.

### Progresso global do QA-08
191 → **162** ocorrências. Restam 14 arquivos: Comunidade (3), Configurações (4), Perfil (4),
InicioDashboard, PerfilEConfiguracoes e um comentário em `ui/Card.tsx`.

---

## QA-08 (parte 2) — Design System na seção de Perfil

**63 ocorrências legadas → 0.** A seção está 100% migrada.

### Escopo real: 5 arquivos, não 4
O card previa 4, mas a varredura encontrou 5 com resíduo: `PerfilEConfiguracoes`, `AtividadeTab`,
`ContaTab`, `HerbarioTab` e `ProfileTabs`. O sexto (`ConquistasTab`) já havia sido reescrito na
Sprint 3, quando ganhou `<MedalhaConquista>`, e por isso não aparecia na lista.

| Arquivo | Ocorrências |
|---|---|
| `PerfilEConfiguracoes.tsx` | 23 |
| `ContaTab.tsx` | 18 |
| `AtividadeTab.tsx` | 10 |
| `HerbarioTab.tsx` | 9 |
| `ProfileTabs.tsx` | 3 |

### Dicionário aplicado
Exatamente o validado na parte 1: `text-[#2f4d38] → text-green-deep`, `bg-[#2f4d38] →
bg-green-deep`, `[#4d7a52] → green-main`, `bg-[#24506e] → bg-blue-main`, `bg-[#8fb996]/30 →
bg-green-soft`, `border-[#8fb996]/30 → border-black/[0.04] shadow-card`, `bg-[#f3f6f0] →
bg-surface-alt`, `slate-*` → `ink-muted`/`locked`/`black/…`, `font-black` e `font-extrabold` →
`font-bold`.

Dois casos exigiram leitura de contexto: o **anel do avatar** (`border-4 border-[#8fb996]`) virou
`border-green-soft`, e a **divisória da lista de atividades** (`border-slate-50`) virou
`border-black/[0.05]` — em ambos a cor definia separação, não preenchimento.

### Cores semânticas preservadas
Conforme a diretriz, nada de âmbar (RENISUS/ofensiva), esmeralda (sucesso), laranja (streak),
teal ou vermelho (ação destrutiva) foi tocado — 13 ocorrências mantidas intactas.

### Verificação de não-regressão
O mesmo script da parte 1 comparou os 5 arquivos com a versão anterior **removendo o conteúdo de
todo `className`**: as cinco estruturas saíram idênticas. Nenhuma regra de negócio, hook, import
ou estrutura JSX foi alterada.

### Progresso global do QA-08
191 → 162 → **125** ocorrências. Restam 9 arquivos: Comunidade (3), Configurações (4),
`InicioDashboard` e um comentário em `ui/Card.tsx`.

---

## QA-08 (parte 3) — Dashboard inicial, Comunidade e limpeza do comentário legado

**88 ocorrências legadas → 0** nos cinco arquivos.

| Arquivo | Ocorrências |
|---|---|
| `ComunidadeMural.tsx` | 33 |
| `InicioDashboard.tsx` | 25 |
| `comunidade/PostDetalheClient.tsx` | 21 |
| `comunidade/TrocaModal.tsx` | 22 |
| `ui/Card.tsx` | 1 (comentário) |

### Casos que exigiram leitura de contexto
O dicionário cobre os valores canônicos, mas estes arquivos traziam variações de opacidade que
não constavam na tabela:

- `bg-[#8fb996]/20` e `/40` (avatares e bordas de campo) → `bg-green-soft` e `border-black/10`
- `bg-[#f3f6f0]/80` → `bg-surface-alt` (a opacidade sobre off-white era imperceptível)
- `bg-[#24506e]/10 text-[#24506e]` (tag de categoria do mural) → `bg-blue-main/10 text-blue-main`
- `bg-[#16283f]/60` (HUD sobre o banner) → `bg-blue-deep/60`
- `border-[#16283f]` no banner azul → `border-blue-deep`
- `text-slate-800` (texto digitado em campos) → `text-ink`

### Comentário do `Card.tsx`
Descrevia `border border-[#8fb996]/30` como "o padrão atual do código". Depois desta migração a
afirmação passou a ser falsa — comentário desatualizado engana mais que a ausência dele. Reescrito
para registrar o padrão como **herdado do protótipo AI Studio e eliminado no QA-08**.

### Cores semânticas preservadas
41 ocorrências intocadas: âmbar (RENISUS, ofensiva), esmeralda (sucesso, XP), vermelho (ação
destrutiva), teal e laranja.

### Verificação de não-regressão
Comparação estrutural com a versão anterior removendo o conteúdo de todo `className`: as cinco
estruturas idênticas. No `Card.tsx`, os comentários foram ignorados na comparação, já que a
alteração deles era o objetivo.

### Progresso global do QA-08
191 → 162 → 125 → **37** ocorrências (**81% concluído**). Resta apenas a seção de
**Configurações** (4 arquivos).

**Pendência paralela:** ainda há 23 usos de `font-black`/`font-extrabold`, quase todos no
**Desafio Diário** (20 de 23) — módulo que não entrou em nenhum lote da migração e que também usa
tokens antigos por `var()` (QA-09). Vale tratá-lo como um lote próprio.

---

## QA-08 (parte 4, final) — Configurações · **migração encerrada**

**37 ocorrências → 0.** Com este lote, o app não tem mais nenhum hex legado.

| Arquivo | Ocorrências |
|---|---|
| `ConfiguracoesModals.tsx` | 15 |
| `SettingsItem.tsx` | 9 |
| `ConfiguracoesClient.tsx` | 8 |
| `SettingsSection.tsx` | 5 |

### Casos que exigiram contexto
- **Campo de formulário** (`bg-[#f3f6f0] border border-[#8fb996]/40`) → `bg-surface-alt
  border-black/10`. Campos usam borda mais presente que cards, para sinalizar área editável.
- **Hover do seletor de tema** (`hover:bg-[#8fb996]/20`) → `hover:bg-green-soft`.
- **Trilho do toggle desligado** (`bg-slate-200`) → `bg-black/15`: neutro do sistema, e mantém o
  contraste com o `bg-green-main` do estado ligado.
- **Divisória de seção** (`divide-slate-50`) → `divide-black/[0.05]`.
- **Bordas de botão ativo** que ainda citavam `border-[#2f4d38]` ao lado de um `bg-green-deep` já
  migrado — resquício de substituição parcial, agora coerente.

### Preservado
Os 9 tons de vermelho (excluir conta, apagar dados, ícones de alerta) ficaram intactos, conforme
a diretriz de cores destrutivas.

### Verificação
Comparação estrutural com a versão anterior removendo o conteúdo de `className` **e** das
constantes de classe (`const INPUT = '...'`): as quatro estruturas idênticas.

---

# QA-08 — CONCLUÍDO

| Etapa | Arquivos | Ocorrências | Acumulado |
|---|---|---|---|
| Parte 1 — Herbário e Ficha Botânica | 2 | 29 | 191 → 162 |
| Parte 2 — Perfil | 5 | 63 | 162 → 125 |
| Parte 3 — Dashboard e Comunidade | 5 | 88 | 125 → 37 |
| Parte 4 — Configurações | 4 | 37 | 37 → **0** |
| **Total** | **16** | **217** | ✅ |

O app tem **uma única identidade visual**. Todo componente consome os tokens do `@theme`.

### Próximo passo recomendado: proteger o resultado
Sem trava automatizada, o próximo `bg-[#2f4d38]` entra na primeira PR distraída. Adicionar ao CI:

```bash
grep -rE "bg-\[#|text-\[#|border-\[#" --include=*.tsx components/ \
  | grep -v "components/jardim/" && exit 1 || exit 0
```

(`components/jardim/` é exceção legítima: a cena da horta usa `lib/paletaJardim.ts`, cores de
ilustração que não pertencem ao `@theme`.)

### Pendência remanescente — lote do Desafio Diário
Restam **21 usos de `font-black`/`font-extrabold`, 20 deles no Desafio Diário**. O módulo nunca
entrou na migração e ainda usa tokens antigos via `var(--color-*)` (QA-09) — como o GER-UI-07
alterou os **valores** desses tokens, essas telas herdaram cores novas sem revisão visual.
É o último bolsão de inconsistência e merece um lote próprio.

---

## QA-09 — Desafio Diário: tokens, contraste e tipografia

Último módulo fora do Design System. **68 chamadas `var(--color-*)` → 0** nos 9 arquivos.

### Por que este lote não era mecânico
O GER-UI-07 alterou os **valores** dos tokens sem que estas telas fossem revisadas. Elas
continuaram consumindo `var(--color-blue-main)`, que deixou de ser um azul médio e virou a cor de
**ação primária**. Substituir cegamente perpetuaria aplicações que passaram a significar outra
coisa.

### Contraste medido, não estimado
Calculei a razão WCAG de cada par com os valores novos. Os textos em baixa opacidade reprovavam:

| Uso | Antes | Depois |
|---|---|---|
| Rótulo desabilitado `blue-deep/30` | **1,89:1** ❌ | 4,05:1 (controle inativo) |
| Legenda `blue-deep/50` | **3,19:1** ❌ | 4,76:1 ✅ `ink-muted` |
| Rótulo `blue-deep/60` | **4,29:1** ❌ | 4,76:1 ✅ `ink-muted` |
| Badge da alternativa sobre `surface-alt` | 4,31:1 ❌ | 8,85:1 ✅ `green-deep` |

Um achado do teste: `ink-muted` passa sobre branco (4,76:1) mas **reprova sobre `surface-alt`**
(4,31:1). Onde o fundo é `surface-alt`, o texto subiu para `green-deep`.

### Duas colisões semânticas que a migração expôs
1. **Banner de resposta incorreta** usava `bg-blue-main` — a mesma cor do botão primário. Um
   painel de feedback com a cor de "avançar" sugere clique onde não há clique. Trocado por
   `bg-blue-deep`: mesma família, tom mais profundo, sem competir com controles. Contraste com o
   texto branco sobe de 14,45:1 para 15,55:1.
2. **Botão "Próxima pergunta"** era `bg-green-deep`, mas avança um fluxo — pela regra do
   GER-UI-06 é ação primária. Passou a `bg-blue-main`.

### Barra de progresso do quiz
Era azul; passou a verde. Progresso é verde em todo o resto do app (`BarraXP`, missões do Jardim,
conquistas) — o azul aqui destoava do sistema.

### Sobre o botão desabilitado (4,05:1)
Fica abaixo de AA de propósito. A WCAG 1.4.3 isenta componentes de interface **inativos**, e um
botão desabilitado deve parecer atenuado — forçá-lo a 4,5:1 o faria parecer clicável. Está acima
de 3:1 e legível.

### Verificação
Comparação estrutural ignorando `className`, comentários e constantes de classe: as 9 estruturas
idênticas. Nenhum handler, hook ou estado tocado — a lógica de XP e ofensiva permanece blindada.

---

# Padronização visual concluída

| Métrica | Antes | Agora |
|---|---|---|
| Hex legados | 191 | **0** |
| `var(--color-*)` | 68 | **0** |
| `font-black` / `font-extrabold` | 24 | **0** |

O último `font-black` estava num botão de fechar toast no Jardim, fora do módulo do quiz —
removido junto.

**Pendências abertas:** QA-06 (rotas `/termos` e `/privacidade`), QA-10 (rótulos do Jardim em
telas estreitas), QA-13 a QA-17, e as pendências de conteúdo com a autora.

---

## QA-06 — Rotas órfãs `/termos` e `/privacidade`

Criadas `app/termos/page.tsx` e `app/privacidade/page.tsx`, mais o Client Component
`components/ui/BotaoVoltar.tsx`.

### Desvio da diretriz: fora do grupo `(app)`
O card previa `app/(app)/termos` e `app/(app)/privacidade`. A varredura mostrou que **os quatro
links partem do splash e do cadastro** — área não autenticada.

Dentro de `(app)`, essas páginas herdariam o `AppLayout`: header com pílula de XP, sidebar de
navegação e bottom nav, além de chamarem `getPerfil()` e `getGameState()` **para alguém que ainda
não tem conta**. O usuário no meio do cadastro clicaria em "Termos de Uso" e cairia numa casca de
app logado, com XP e nome de outra pessoa (hoje, o mock).

Ficaram na raiz de `app/`, herdando só o root layout — acessíveis tanto de fora quanto de dentro
do app.

### Botão "Voltar"
Isolado como Client Component para que as duas páginas continuem sendo Server Components. Usa
`router.back()` em vez de href fixo porque as páginas são alcançadas de dois lugares distintos;
mandar todos para uma rota fixa tiraria do fluxo quem estava preenchendo o cadastro.

Tem `fallbackHref` para acesso direto por URL, quando não há histórico — sem isso o clique não
faria nada e pareceria um botão quebrado.

### Conteúdo
Sem texto jurídico inventado. Apenas o aviso de que o documento oficial está em elaboração, mais
duas informações verdadeiras e relevantes: o vínculo com a pesquisa do PPGCTS/ICET/UFAM e, nos
Termos, o alerta de que o conteúdo botânico **não substitui orientação médica ou farmacêutica** —
coerente com a diretriz da ANVISA que abre a curadoria.

### Validação
Build: 32 → **34 páginas**, com `/termos` e `/privacidade` pré-renderizadas como estáticas.
Script cruzou **todos os 12 hrefs internos do projeto contra as 18 rotas existentes**: nenhum link
órfão restante.

---

## QA-10 — Colisão de rótulos do Jardim no mobile

### O problema, medido
Num viewport de 360px, cada canteiro da fileira frontal tem ~96px e o gap entre eles é 8px. A
pílula "Desbloqueie no nível 6" mede ~130px: **transbordava 34px** e encostava na do vizinho.

O card apontava só o estado bloqueado, mas a medição revelou que o **estado vazio era pior**:
o motivo "Estude uma planta na Biblioteca" mede ~175px — **79px de transbordo**.

### Troca de texto, não truncamento
Cortar com reticências ("Desbloqueie no ní…") esconderia justamente o número, que é a informação
útil. A solução é trocar o texto por breakpoint:

| Breakpoint | Bloqueado | Vazio (indisponível) |
|---|---|---|
| mobile | `Nível 6` | `Indisponível` |
| `sm` | `Desbloqueie no nível 6` | motivo completo |
| `md` | `Desbloqueie no nível 6 · Flor da Saúde` | motivo completo |

O terceiro degrau (`md`) surgiu da verificação: em **640px exatos**, a frase com o nome do nível
ainda estourava e caía no truncate. O nome passou a entrar só a partir de `md`.

### Acessibilidade
As duas versões visuais são `aria-hidden`, e um `<span class="sr-only">` carrega a frase completa
uma única vez. Sem isso, quem usa leitor de tela no celular ouviria apenas "Nível 6", perdendo o
contexto de que o canteiro está bloqueado.

### Trava estrutural
`max-w-full truncate` nas pílulas garante que, mesmo que um nome de nível cresça no futuro ou um
motivo novo seja adicionado, a pílula nunca ultrapasse a largura do próprio canteiro — a colisão
com o vizinho passa a ser impossível por construção, não por ajuste de texto.

O wrapper também deixou de estourar: `w-full` no mobile, `sm:w-[112%]` a partir de sm.

### Fileiras
| Fileira | Antes | Depois |
|---|---|---|
| fundo | `gap-4 sm:gap-8 scale-[0.86]` | `gap-3 sm:gap-8 scale-[0.82] sm:scale-[0.86]` |
| meio | `gap-3 sm:gap-6 scale-[0.93]` | `gap-2 sm:gap-6 scale-[0.90] sm:scale-[0.93]` |
| frente | `gap-2 sm:gap-5` | `gap-1.5 sm:gap-5 scale-95 sm:scale-100` |

**Desvio da diretriz:** o card sugeria `scale-110` na fileira frontal. Aplicado, a fileira ficaria
10% mais larga que a cena (em 640px: 616px numa área de 560px) e seria cortada pelo
`overflow-hidden` do container. Usei `sm:scale-100` e reduzi as escalas das fileiras de trás, o
que preserva a perspectiva sem estourar.

### Validação
Conferido por cálculo em 360, 380, 400, 640, 768 e 1024px: a pílula cabe em todos, e a fileira
frontal nunca excede a largura da cena. Build: 34 páginas, typecheck limpo. Hooks, handlers e
tipos idênticos aos anteriores.

---

## QA-13 e QA-16 — polimento final de UI

### QA-13 — Layout em telas grandes
`main` estava em `max-w-5xl` (1024px). Com a sidebar de 256px, um monitor de 2560px deixava
**1.280px vazios**.

A expansão é **escalonada**, não um salto direto para `7xl`:

```
max-w-5xl xl:max-w-6xl 2xl:max-w-7xl
```

| Viewport | Antes | Depois |
|---|---|---|
| < 1280px | 1024px | 1024px (inalterado) |
| 1536px | 1024px, 256 vazios | **1280px, 0 vazios** |
| 2560px | 1024px, 1280 vazios | 1280px, 1024 vazios |

Pular direto para `7xl` em `xl` esticaria as linhas de texto das fichas botânicas muito além do
confortável para leitura — o conteúdo do GERMINA é majoritariamente textual.

**Inconsistência não catalogada, corrigida junto:** o `Header` usava `max-w-7xl` fixo enquanto o
`main` usava `max-w-5xl`. O avatar e a pílula de XP ficavam ~128px à direita da borda do conteúdo.
Os dois passaram a compartilhar a mesma cadeia de larguras.

### QA-16 — Texto de desenvolvedor
`ConfiguracoesClient.tsx` exibia `"Em breve — mover o fluxo do Login pra cá"` — instrução de
desenvolvedor visível na tela de produção.

**Substituído em vez de removido**, e o motivo importa: o `onClick` desse item é um no-op
(`() => {}`). Um subtítulo comum ("Gerencie suas credenciais") faria o item parecer funcional e
não fazer nada ao toque — trocaria um débito por um pior. A copy virou `"Disponível em breve"`:
voltada ao usuário, sem jargão interno, e ainda sinalizando a indisponibilidade até o fluxo de
credenciais existir.

Varredura confirma: nenhum "Em breve" de desenvolvedor restante no projeto.

### Validação
Build: 34 páginas, typecheck limpo. Comparação estrutural ignorando `className`, `subtitle` e
comentários: os três arquivos idênticos aos anteriores.
