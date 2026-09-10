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
| 6 | Scanner IA | `app/(app)/scanner` | `ScannerIA.tsx` + `ScannerClient.tsx` + `app/api/scan-plant/route.ts` | 🟢 lógica de IA já funcional (Gemini) | `plantas_catalogo` |
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
- `server.ts` (Express) portado para `app/api/scan-plant/route.ts` (Route Handler).
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

- **Scanner IA** → 3 correções: (1) removido o `alert()` nativo do navegador ao salvar — já existia
  um toast próprio (`ScannerClient.tsx`) que ficou órfão, agora é o único feedback; (2) removido o
  fallback enganoso que, em caso de falha na API, fingia um resultado fixo do Crajiru como se fosse
  a IA analisando a foto — agora mostra a mensagem de erro real; (3) o botão "Salvar no Meu
  Herbário" trava depois do primeiro clique por resultado (`resultadoSalvo`), evitando XP
  duplicado ao clicar várias vezes no mesmo escaneamento.

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

## Próximos passos
1. Rodar `create-next-app` de verdade neste diretório (instalar dependências) — hoje só a estrutura de arquivos existe, sem `node_modules`/build.
2. Criar as 4 telas de autenticação usando Supabase Auth.
3. Escrever o SQL das tabelas que faltam (`terrenos_jardim`, `desafios_diarios`, `conquistas`) e ajustar `comunidade_posts`.
4. Trocar o `localStorage` (`getStoredX`/`saveStoredX` de `supabase.ts` do protótipo) pelas chamadas reais ao Supabase dentro de cada componente/página.
5. `git init`, primeiro commit, push para o GitHub.
