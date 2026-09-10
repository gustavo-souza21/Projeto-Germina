# GERMINA — Levantamento do conteúdo e do Desafio Diário

Base: `germina-next-estrutura (4).zip`, `PROMPT_Ferramenta_Gamificada.docx`, `Curadoria_de_sp_SBFreitas_15_Especies.pdf`, `Metodologia_Dissertação_Resumo.pdf`.
Data: agosto/2026.

---

## 1. O que já existe

### 1.1 Estrutura da aplicação

Projeto Next.js (App Router) com **9 rotas navegáveis** e 111 arquivos. Nenhuma dependência instalada ainda (`node_modules` e `package.json` ausentes) — hoje é árvore de arquivos, não build rodando.

| Módulo | Rota | Situação |
|---|---|---|
| Autenticação (splash, login, cadastro, recuperação, verificação, tutorial) | `(auth)/*` | UI completa, sem Supabase Auth |
| Início / Dashboard | `(app)/inicio` | UI completa, dados mockados |
| **Desafio Diário (quiz)** | `(app)/desafio-diario` | UI completa, **3 de 15 plantas** |
| Biblioteca + Ficha Botânica | `(app)/biblioteca/[slug]` | 15 fichas completas, 15 páginas pré-geradas |
| Jardim do Conhecimento | `(app)/jardim` | UI completa, dados mockados |
| Scanner IA | `(app)/scanner` | Lógica Gemini funcional |
| Comunidade | `(app)/comunidade` | UI completa, dados mockados |
| Perfil / Configurações | `(app)/perfil`, `/configuracoes` | UI completa, dados mockados |

Toda a camada de dados passa por `lib/queries/*` retornando mocks — o ponto de troca por Supabase já está isolado, o que é bom. **`supabase/migrations/` está vazia**: nenhuma tabela foi escrita ainda.

### 1.2 Catálogo de plantas — 15/15 completo ✅

`data/plantasData.ts` reproduz literalmente a curadoria, com 20 campos por espécie (nome científico, família + fonte, morfologia + fonte, usos, preparo, fitoquímica, contraindicações, RENISUS, ODS, fotos + crédito). As 25 fotos foram extraídas do PDF e estão em `public/plantas/`.

| # | Planta | Nome científico | RENISUS | Categoria | XP | Fotos |
|---|---|---|---|---|---|---|
| 1 | Amora | *Morus nigra* L. | ✅ | Geral | 100 | 2 |
| 2 | Goiaba | *Psidium guajava* L. | ✅ | Digestiva | 100 | 2 |
| 3 | Abacate | *Persea americana* Mill. | ✅ | Geral | 100 | 2 |
| 4 | Boldo | *Plectranthus barbatus* Andrew | ✅ | Digestiva | 100 | 2 |
| 5 | Corama | *Kalanchoe pinnata* Lam. | ✅ | Cicatrizante | 100 | 2 |
| 6 | Crajiru | *Fidericia chica* (Bonpl.) | ✅ | Anti-inflamatória | 100 | 1 |
| 7 | Pobre-velho | *Costus spicatus* Jaqc. | ✅ | Anti-inflamatória | 100 | 1 |
| 8 | Terramicina | *Alternanthera brasiliana* L. | — | Cicatrizante | 50 | 2 |
| 9 | Cidreira | *Lippia alba* (Mill.) N.E.Br. | — | Calmante | 50 | 1 |
| 10 | Hortelã pimenta | *Mentha x piperita* L. | — | Respiratória | 50 | 2 |
| 11 | Cuia-mansa | *Alternanthera tenella* | — | Geral | 50 | 2 |
| 12 | Capim santo | *Cymbopogon citratus* (DC.) Stapf. | — | Calmante | 50 | 1 |
| 13 | Cumaru | *Dipteryx odorata* | — | Respiratória | 50 | 3 |
| 14 | Boldinho japonês | *Mentha arvensis* | — | Digestiva | 50 | 1 |
| 15 | Malvarisco | *Plectranthus amboinicus* Lour. | — | Respiratória | 50 | 1 |

7 RENISUS / 8 não-RENISUS — bate com a legenda da curadoria e com o "7 espécies raras" do PROMPT.

### 1.3 Desafio Diário — 3/15 plantas

`data/desafioDiarioQuiz.ts` tem **9 perguntas**: Crajiru, Boldo e Amora, 3 cada, nos eixos fixos **Indicação Terapêutica (fácil) → Preparo Tradicional (médio) → Curiosidade ODS (difícil)**.

Fluxo já implementado: `StartScreen` → `QuestionScreen` (4 alternativas) → `FeedbackScreen` (explicação) → `ResultScreen` (placar, XP, ofensiva, compartilhar).

Pontuação atual: acerto = 10 pts, **erro = 5 pts**, XP final = pontos × 5 (máx. 150 XP).

---

## 2. O que falta de perguntas e respostas

### 2.1 Lacuna direta

**36 perguntas faltando** — 12 plantas × 3 eixos:

| Planta | Indicação Terapêutica | Preparo Tradicional | Curiosidade ODS |
|---|---|---|---|
| Crajiru, Boldo, Amora | ✅ | ✅ | ✅ |
| Goiaba, Abacate, Corama, Pobre-velho | ❌ | ❌ | ❌ |
| Terramicina, Cidreira, Hortelã pimenta, Cuia-mansa | ❌ | ❌ | ❌ |
| Capim santo, Cumaru, Boldinho japonês, Malvarisco | ❌ | ❌ | ❌ |

### 2.2 Lacuna de sustentação (a mais séria)

45 perguntas totais é conteúdo para **~15 dias de uso** — e ele é o núcleo do loop do app (o PROMPT diz "desafios diários de perguntas são gerados com base naquelas informações"). Um usuário engajado esgota o banco antes do fim de um ciclo de avaliação.

Além disso, dois eixos não escalam bem:

- **Curiosidade ODS**: 12 das 15 plantas têm `ods_relacionados: [3, 4]` (genérico). Escrever 15 perguntas distintas sobre ODS 3/4 vai gerar repetição óbvia. É preciso mapear ODS específicos por espécie (ex.: Cumaru → ODS 15 + 12 por ser extrativismo amazônico; Capim santo → ODS 11 por ser quintal urbano).
- **Preparo Tradicional**: 8 plantas têm essencialmente o mesmo dado ("chá das folhas por via oral"). Sem variação, as perguntas ficam intercambiáveis. **Cumaru é caso crítico** — o campo "Dados sobre o uso" da curadoria descreve a composição do óleo, não o preparo; não há material para uma pergunta de preparo.

### 2.3 Eixo ausente: Segurança / Contraindicação

A curadoria abre com a citação da ANVISA sobre "evitar que o uso incorreto possa causar efeitos indesejáveis e toxicidade", e 10 das 15 fichas trazem contraindicação explícita (gestantes, lactantes, crianças, menores de 18, refluxo, cálculo biliar). **Nenhuma das 9 perguntas atuais cobre isso.** Para uma ferramenta de educação em saúde apresentada a uma banca, esse é o eixo de maior valor pedagógico e o mais fácil de defender — recomendo adotá-lo como 4º eixo obrigatório.

---

## 3. Problemas no que já existe (corrigir antes de escalar para 15 plantas)

### 3.1 Aderência à curadoria — 3 perguntas com afirmação não sustentada pelo PDF

O ROTEIRO estabelece a regra de fidelidade literal à curadoria. As perguntas atuais não seguem essa regra:

| Pergunta | Problema |
|---|---|
| Crajiru — fácil (feedback) | Fala em "infusão ou banho de folhas". A curadoria registra apenas "Chá das folhas, **uso oral** (Amador e Lucas, 2025)". |
| Crajiru — médio | A cor avermelhada da infusão não aparece em nenhum campo da ficha (é conhecimento externo, ainda que correto). |
| Boldo — médio | "Amassar a folha fresca + água morna" não está na ficha; a curadoria diz "chá e suco, 2 xícaras/copos ao dia; decocções e infusões". A alternativa errada B ("ferver") descreve justamente uma decocção, que a ficha **cita como uso válido**. |
| Amora — médio | "Abafar por 10 minutos" não consta na ficha da Amora — esse dado é da **Cuia-mansa** ("infuso por cerca de 10 minutos"). |

**Consequência prática**: se o Comitê Ad Hoc conferir pergunta contra a fonte, essas quatro não passam. A correção é barata agora (4 itens) e cara depois (45 itens).

### 3.2 Modelo de dados do quiz

- `PlantaComQuiz.planta` é uma **string livre** ("Hortelã pimenta"), não um `planta_id` ligado a `PLANTAS_CATALOGO`. Com 15 plantas e acentos, o pareamento quiz ↔ ficha vai quebrar silenciosamente.
- Não existe campo de **fonte por pergunta**. Sem ele não há como o Comitê Ad Hoc validar item a item, e não há como o app linkar "veja isso na ficha".
- `is_renisus` está duplicado (existe no catálogo e no quiz) — risco de divergência, que **já aconteceu uma vez** com a Amora (há um comentário no ROTEIRO e outro contraditório no arquivo do quiz; hoje ambos dizem `true`, mas o ROTEIRO deveria ser limpo).

### 3.3 Interface não suporta 15 plantas

- `StartScreen` renderiza as plantas como abas em **uma única linha flex**. Com 3 funciona; com 15 quebra no mobile.
- `PLANT_ICONS` mapeia só Crajiru, Boldo e Amora — as outras 12 caem no fallback 🌱.
- Não há **rotação de "planta do dia"**: o usuário escolhe livremente, o que contradiz a ideia de desafio diário.
- `jaCompletouHoje` é `useState` local — some ao recarregar a página. Não há verificação de data, então a ofensiva (streak) não é real.

### 3.4 Economia do jogo

- Erro concede 5 pontos (= 25 XP). Um usuário que erra tudo ganha 75 XP. Isso premia participação, o que é uma escolha legítima, mas **precisa ser decisão consciente e documentada**, não efeito colateral.
- Plantas RENISUS valem XP dobrado na Biblioteca (100 vs 50), mas **no quiz todas valem igual**. Inconsistência com a mecânica de "espécies raras" do PROMPT.
- O card `d0` em `DESAFIOS_INICIAIS` tem hardcoded "sobre Crajiru, Boldo ou Amora" — precisa virar texto dinâmico.

---

## 4. Como prosseguir

### Etapa 0 — Decisões de conteúdo (Sarah + orientador, antes de escrever qualquer pergunta)

1. **Eixos definitivos**: manter 3 ou adotar 4 (incluindo Segurança/Contraindicação)?
2. **Perguntas por planta**: 3 (45 no total, ~15 dias) ou 6 (90 no total, ~30 dias)? Recomendação: 4 eixos × 15 plantas = **60 perguntas**, cobertura de 20 dias e alinhamento com o discurso de uso seguro.
3. **Regra de fonte**: toda pergunta deve ancorar em um campo nomeado da ficha (`usos_tradicionais`, `preparo`, `evidencias`, `contraindicacoes`, `descricao`). Se não há material na ficha, **não se escreve a pergunta** — registra-se como lacuna de curadoria (caso Cumaru/preparo, Cuia-mansa/fitoquímica).
4. **Mapeamento ODS por espécie**: substituir os `[3, 4]` genéricos por combinações justificadas.

### Etapa 1 — Corrigir as 9 perguntas existentes

Reescrever os 4 itens da seção 3.1 ancorando no texto da ficha. É pré-requisito: elas são o modelo que as outras 36 vão imitar.

### Etapa 2 — Escrever as perguntas faltantes

Sugestão de ordem, por valor de demonstração:
1. As **4 RENISUS restantes** (Goiaba, Abacate, Corama, Pobre-velho) — completa as 7 "espécies raras", que é o gancho de coleção do herbário.
2. As **4 amazônicas/regionais** (Terramicina, Cuia-mansa, Cumaru, Capim santo) — é o diferencial regional do projeto.
3. As **4 restantes** (Cidreira, Hortelã pimenta, Boldinho japonês, Malvarisco).

Formato de entrega: um arquivo por lote, com coluna de fonte, para revisão em planilha antes de virar TypeScript.

### Etapa 3 — Ajustes técnicos (paralelos à escrita)

- `PerguntaQuiz` ganha `fonte: string` e `campo_fonte: 'usos_tradicionais' | 'preparo' | 'evidencias' | 'contraindicacoes' | 'descricao'`.
- `PlantaComQuiz.planta` → `planta_id` referenciando `PLANTAS_CATALOGO`; `is_renisus` derivado do catálogo em vez de duplicado.
- `StartScreen`: abas viram carrossel horizontal com scroll ou grade 3×5; `PLANT_ICONS` completo para as 15.
- Lógica de "planta do dia" determinística (ex.: índice pela data), com "explorar outras plantas" como modo livre sem streak.
- `EixoTematico` ganha `'Segurança e Contraindicação'`.

### Etapa 4 — Persistência e validação

- Escrever as migrations que faltam: `desafios_diarios`, `quiz_perguntas`, `quiz_respostas_usuario`, `terrenos_jardim`, `conquistas`.
- Substituir `jaCompletouHoje` local por consulta de data no banco (streak real).
- Preparar a **planilha de validação para o Comitê Ad Hoc** previsto na metodologia: uma linha por pergunta, com planta, eixo, enunciado, alternativas, gabarito, feedback, campo-fonte e citação — mais colunas de parecer (aprovado / aprovado com ajuste / reprovado) e observações.

---

## 5. Padrão proposto — exemplo pronto (Capim santo)

Modelo do que as 36 perguntas devem parecer, com tudo ancorado na ficha da curadoria:

**Eixo 1 — Indicação Terapêutica (fácil)**
Na medicina popular registrada na literatura, o chá de Capim santo (*Cymbopogon citratus*) é procurado principalmente por qual efeito?
A) Cicatrização de feridas profundas · **B) Efeito calmante e auxílio no sono** · C) Clareamento de manchas de pele · D) Reposição de ferro em casos de anemia
*Feedback*: A literatura registra o capim santo como calmante, com uso para insônia e distúrbios nervosos (Amador e Lucas, 2025; Veras, 2025; Maciel et al., 2025).
*Fonte*: `usos_tradicionais`

**Eixo 2 — Preparo Tradicional (médio)**
Segundo os registros de uso, além do chá bebido, de que outra forma as folhas do Capim santo são tradicionalmente utilizadas?
A) Aplicadas como emplastro sobre feridas abertas · **B) Em banho, por via cutânea** · C) Mastigadas cruas em jejum · D) Queimadas para inalação da fumaça
*Feedback*: A curadoria registra "chá das folhas, banho das folhas forma cutânea" (Amador e Lucas, 2025), além de decocção e infusão (Veras, 2025).
*Fonte*: `preparo`

**Eixo 3 — Segurança e Contraindicação (médio-difícil)** ⚠️ eixo novo
Para quais grupos o uso do Capim santo é contraindicado por falta de dados de segurança?
A) Apenas pessoas com hipertensão · B) Ninguém, é seguro para todos · **C) Gestantes, lactantes e menores de 18 anos** · D) Somente atletas de alto rendimento
*Feedback*: O uso é contraindicado na gestação, lactação e para menores de 18 anos, por ausência de dados adequados de segurança (Royo, Damasceno e Veloso, 2023).
*Fonte*: `contraindicacoes`

**Eixo 4 — Curiosidade ODS (difícil)**
O Capim santo é cultivado em quintais e hortas urbanas de Itacoatiara. Como isso dialoga com o ODS 11 (Cidades e Comunidades Sustentáveis)?
A) Por exigir importação constante de mudas certificadas · B) Por substituir a vegetação nativa dos quintais · **C) Por aproximar o cuidado em saúde do território, com plantas de manejo simples no próprio bairro** · D) Por concentrar a produção em uma única fazenda regional
*Feedback*: Espécies de fácil cultivo em quintal aproximam o cuidado primário à saúde da comunidade, reduzem deslocamento e valorizam o saber local.
*Fonte*: `habitat` + PROMPT (ODS)

---

## Resumo executivo

| | |
|---|---|
| Plantas catalogadas | **15 / 15** ✅ |
| Fotos e fichas botânicas | **15 / 15** ✅ |
| Plantas com quiz | **3 / 15** (Crajiru, Boldo, Amora) |
| Perguntas escritas | **9** |
| Perguntas faltantes (3 eixos) | **36** |
| Perguntas faltantes (4 eixos, recomendado) | **51** |
| Perguntas a revisar por divergência com a curadoria | **4** |
| Backend / persistência | **0 tabelas criadas** |
