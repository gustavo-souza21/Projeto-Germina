-- ============================================================================
-- GERMINA — Migration 11: leitura pública para o modo visitante (Fase 4)
--
-- CONTEXTO
--
-- Até aqui, TODA policy do projeto é `to authenticated` — o role `anon` (o
-- que o Supabase usa para requisições sem sessão) não tem acesso a nada, em
-- nenhuma das 14 tabelas. Isso era coerente enquanto o `middleware.ts`
-- barrava qualquer visitante antes de qualquer página renderizar.
--
-- A Fase 4 abre duas rotas para leitura sem login (decisão de escopo do
-- Gustavo, seção 8.2 do relatório de auditoria):
--   • /biblioteca — catálogo de plantas e fichas. NÃO precisa de nada aqui:
--     `getPlantasCatalogo()` lê de `data/plantasData.ts`, código, não banco.
--     O que essa rota lê do banco é `getColecao()` ("já estudada"), que para
--     visitante passa a devolver lista vazia no código, sem consultar nada.
--   • /comunidade — mural: posts, contagem de curtidas, contagem de
--     respostas e anúncios de troca. TUDO isso vem do banco, e é o que esta
--     migration libera.
--
-- O QUE ESTA MIGRATION **NÃO** FAZ, e é o ponto principal:
--
-- Nenhuma policy de ESCRITA é tocada. Todas continuam `to authenticated`.
-- Um visitante pode ler o mural e não pode publicar, curtir, responder,
-- propor troca, nem tocar em nada de jogo — não porque a interface esconde os
-- botões (ela vai mostrar um convite a entrar), mas porque o banco recusa.
-- É a mesma divisão de responsabilidade das Fases 1 a 3: a UI explica, o
-- Postgres garante.
--
-- Também não se concede NADA de `profiles`, `game_state`, `terrenos_jardim`,
-- `user_colecao`, `atividades`, `colheitas`, `desafios_diarios_concluidos`,
-- `preferencias`, `respostas_quiz` nem `trocas_propostas` ao `anon`. Note em
-- especial `trocas_propostas`: os ANÚNCIOS (`itens_troca`) são públicos, as
-- PROPOSTAS feitas sobre eles não — elas são conversa entre duas pessoas
-- identificadas, e continuam visíveis só ao proponente e ao dono do item.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. comunidade_posts — o mural em si.
--
-- A policy de leitura existente (`comunidade_posts_leitura`, Migration 5) já
-- é `using (true)`; o que falta é ela valer para `anon` também. Policies são
-- por ROLE, então a forma correta é uma policy nova para `anon` — e não
-- alterar a existente, que continua descrevendo o acesso de quem está logado.
-- ----------------------------------------------------------------------------
create policy comunidade_posts_leitura_visitante
  on public.comunidade_posts
  for select
  to anon
  using (true);

grant select on public.comunidade_posts to anon;


-- ----------------------------------------------------------------------------
-- 2. post_curtidas — só para CONTAR.
--
-- `getPosts()` deriva `curtidas` de `post_curtidas.length`. O visitante
-- precisa enxergar as linhas para o número aparecer.
--
-- Consequência a registrar com honestidade: isso expõe QUEM curtiu o quê
-- (a tabela é user_id + post_id) para qualquer pessoa na internet, não só
-- o total. Já era assim para qualquer usuário logado desde a Migration 5
-- (`post_curtidas_leitura ... using (true)`), então não é uma abertura nova
-- de natureza — é a mesma informação alcançando um público maior. Se isso
-- passar a incomodar, a correção certa é derivar a contagem numa view (como
-- `perfis_publicos`) e revogar o acesso à tabela crua para os dois roles,
-- não só para o anônimo — fica sinalizado, não resolvido, porque mudar isso
-- agora alteraria também o comportamento de quem está logado, fora do escopo
-- desta fase.
-- ----------------------------------------------------------------------------
create policy post_curtidas_leitura_visitante
  on public.post_curtidas
  for select
  to anon
  using (true);

grant select on public.post_curtidas to anon;


-- ----------------------------------------------------------------------------
-- 3. respostas_post — contagem no mural e leitura no detalhe do post.
-- ----------------------------------------------------------------------------
create policy respostas_post_leitura_visitante
  on public.respostas_post
  for select
  to anon
  using (true);

grant select on public.respostas_post to anon;


-- ----------------------------------------------------------------------------
-- 4. itens_troca — os anúncios de troca.
--
-- A seção 8.2 do relatório registra o escopo confirmado como "mural — ver
-- posts, respostas e anúncios de troca", então o painel de Trocas fica
-- visível em leitura para o visitante. Propor uma troca continua exigindo
-- login (a escrita é em `trocas_propostas`, que não recebe nada aqui).
--
-- Só anúncios ATIVOS interessam ao mural, mas o filtro `ativo = true` já é
-- aplicado na query (`getTrocas()`); a policy não o duplica, pelo mesmo
-- princípio de não ter a mesma regra em dois lugares livres para divergir.
-- ----------------------------------------------------------------------------
create policy itens_troca_leitura_visitante
  on public.itens_troca
  for select
  to anon
  using (true);

grant select on public.itens_troca to anon;


-- ----------------------------------------------------------------------------
-- 5. perfis_publicos — o nome de quem escreveu.
--
-- Esta é a ponta solta que a Migration 9 (Fase 2) deixou anotada por
-- escrito: "o modo visitante vai precisar estender isto para `anon` se o
-- Mural for aberto para leitura sem login — decisão daquela fase, não
-- desta". É esta fase, e é esta linha.
--
-- Sem isto, o mural abriria para o visitante com todo post assinado por
-- "Usuário GERMINA — Nível 1 - Semente" — exatamente o bug que a Migration 9
-- corrigiu para quem está logado, reaparecendo só para quem não está.
--
-- A view continua expondo id, nome_completo e xp, e nada mais: quem lê o
-- mural sem conta vê o nome e o nível do autor, como qualquer leitor veria,
-- e não alcança telefone, endereço, idade nem instituição de ninguém.
--
-- MAS — e esta parte veio de uma revisão desta própria fase — só isso não
-- bastava. A view, como a Migration 9 a escreveu, devolve TODA linha de
-- `profiles`, não só a de quem publicou. Enquanto ela era visível apenas a
-- usuários autenticados, isso já era generoso demais; aberta ao `anon`
-- passaria a ser um diretório de nomes reais exposto à internet, já que a
-- chave anônima do Supabase é pública por construção (vai no bundle do
-- navegador, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Qualquer pessoa poderia pedir
-- `/rest/v1/perfis_publicos?select=*` e baixar a lista de todos os alunos
-- cadastrados — inclusive quem nunca escreveu uma linha no mural.
--
-- Isso contraria diretamente o que a Fase 2 decidiu: dado de perfil não é
-- público por padrão. Então a view passa a devolver só quem TEM conteúdo
-- público — quem publicou um post, respondeu alguém ou anunciou uma troca.
-- É o recorte que corresponde ao propósito dela: resolver a identidade do
-- AUTOR de algo que já está visível. Publicar continua sendo o ato que torna
-- o próprio nome público; quem só lê, ou só cuida do próprio jardim, não
-- aparece para ninguém.
--
-- Nenhum chamador perde nada: `buscarAutores()` (lib/queries/comunidade.ts)
-- só consulta ids vindos de `comunidade_posts`, `respostas_post` e
-- `itens_troca` — exatamente as três condições abaixo.
-- ----------------------------------------------------------------------------
create or replace view public.perfis_publicos as
  select
    p.id,
    p.nome_completo,
    coalesce(g.xp, 0) as xp
  from public.profiles p
  left join public.game_state g on g.user_id = p.id
  where exists (select 1 from public.comunidade_posts cp where cp.user_id = p.id)
     or exists (select 1 from public.respostas_post rp where rp.user_id = p.id)
     or exists (select 1 from public.itens_troca it where it.user_id = p.id);

comment on view public.perfis_publicos is
  'Identidade pública mínima de quem PUBLICOU algo (post, resposta ou anúncio de troca): id, nome_completo e xp. Duas fronteiras de segurança aqui, e mexer em qualquer uma delas amplia o que é público: a lista de colunas (telefone/endereco/idade/instituicao são privados do dono) e o WHERE EXISTS (quem nunca publicou não aparece para ninguém). Legível por authenticated e anon.';

grant select on public.perfis_publicos to anon;
