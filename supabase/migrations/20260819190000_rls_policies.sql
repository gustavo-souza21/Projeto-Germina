-- ============================================================================
-- GERMINA — Migration: RLS Policies (Kanban A3 + A4)
--
-- Todas as 11 tabelas já nascem com RLS habilitado (migrations anteriores) e
-- sem nenhuma policy — hoje, portanto, totalmente inacessíveis via API. Este
-- arquivo é só policy: nenhuma tabela, coluna ou grant novo. Toda policy usa
-- `to authenticated`; nenhuma libera `anon`/`public` — a aplicação exige
-- login em toda tela.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- A3 — Tabelas de Estado do Usuário: isolamento total
--
-- Uma policy `for all` por tabela, com `using` e `with check` idênticos:
-- o usuário só enxerga/edita a própria linha, em qualquer operação.
--
-- Nota sobre profiles e atividades (fora do pedido, para decisão sua):
--   • profiles: esta policy também permite ao próprio usuário fazer DELETE
--     direto da linha, sem apagar auth.users junto — deixaria a conta
--     autenticável mas sem perfil (o trigger só popula em INSERT, não
--     recria em caso de perda). A exclusão de conta (G4) deveria continuar
--     passando por um fluxo que apague auth.users (cascata cuida do resto),
--     nunca um DELETE direto em profiles pela aplicação — mesmo que a
--     policy, tecnicamente, já permita.
--   • atividades / desafios_diarios_concluidos: são logs de auditoria (o
--     comentário da migration que os criou é explícito sobre isso). Esta
--     policy `for all` também libera UPDATE/DELETE do próprio histórico,
--     o que essas duas tabelas não deveriam sofrer no fluxo normal do app.
--     Implementado como pedido (ALL, uniforme); se a integridade do log
--     importar mais que a simetria com as demais tabelas, um lote futuro
--     pode restringi-las a `for select, insert` apenas.
-- ----------------------------------------------------------------------------

create policy profiles_isolamento_total
  on public.profiles
  for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy game_state_isolamento_total
  on public.game_state
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy terrenos_jardim_isolamento_total
  on public.terrenos_jardim
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy user_colecao_isolamento_total
  on public.user_colecao
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy atividades_isolamento_total
  on public.atividades
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy desafios_diarios_concluidos_isolamento_total
  on public.desafios_diarios_concluidos
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy preferencias_isolamento_total
  on public.preferencias
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- A4 — Tabelas Abertas da Comunidade
--
-- Duas policies por tabela — não quatro. A leitura fica numa policy própria
-- (`for select using (true)`), e a escrita numa policy `for all` restrita ao
-- autor. Isso basta porque policies permissivas se combinam por OR: no
-- SELECT, a policy aberta (sempre true) já libera a leitura para qualquer
-- autenticado, e a policy `for all` do autor não a restringe — ela só entra
-- em jogo de fato em INSERT/UPDATE/DELETE, onde é a única policy aplicável
-- e, portanto, quem decide.
-- ----------------------------------------------------------------------------

create policy comunidade_posts_leitura_autenticados
  on public.comunidade_posts
  for select
  to authenticated
  using (true);

create policy comunidade_posts_escrita_autor
  on public.comunidade_posts
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy post_curtidas_leitura_autenticados
  on public.post_curtidas
  for select
  to authenticated
  using (true);

create policy post_curtidas_escrita_autor
  on public.post_curtidas
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy respostas_post_leitura_autenticados
  on public.respostas_post
  for select
  to authenticated
  using (true);

create policy respostas_post_escrita_autor
  on public.respostas_post
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy itens_troca_leitura_autenticados
  on public.itens_troca
  for select
  to authenticated
  using (true);

create policy itens_troca_escrita_autor
  on public.itens_troca
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- A4 — trocas_propostas: tabela fechada, dois papéis distintos
--
-- Diferente das quatro tabelas acima, aqui SELECT e UPDATE têm o mesmo par de
-- interessados (proponente OU dono do item), mas INSERT e DELETE são só do
-- proponente — não dá para expressar isso numa única policy `for all`, por
-- isso são quatro policies, uma por operação.
--
-- Limite importante, para registro: RLS opera por LINHA, não por COLUNA.
-- A policy de UPDATE abaixo libera a linha inteira tanto para o proponente
-- quanto para o dono do item — ela não impede, sozinha, que o dono do item
-- edite oferta_texto/mensagem, nem que o proponente mude status para
-- 'aceita'. Separar isso por campo exigiria uma trigger BEFORE UPDATE
-- comparando OLD/NEW por coluna (ou GRANT de coluna, inviável aqui porque
-- os dois papéis são o mesmo role `authenticated` no Postgres) — fora do
-- escopo deste lote de policies; sinalizando para decisão futura.
-- ----------------------------------------------------------------------------

create policy trocas_propostas_leitura
  on public.trocas_propostas
  for select
  to authenticated
  using (
    proponente_user_id = auth.uid()
    or exists (
      select 1
      from public.itens_troca it
      where it.id = trocas_propostas.item_troca_id
        and it.user_id = auth.uid()
    )
  );

create policy trocas_propostas_insercao_proponente
  on public.trocas_propostas
  for insert
  to authenticated
  with check (proponente_user_id = auth.uid());

create policy trocas_propostas_atualizacao
  on public.trocas_propostas
  for update
  to authenticated
  using (
    proponente_user_id = auth.uid()
    or exists (
      select 1
      from public.itens_troca it
      where it.id = trocas_propostas.item_troca_id
        and it.user_id = auth.uid()
    )
  )
  with check (
    proponente_user_id = auth.uid()
    or exists (
      select 1
      from public.itens_troca it
      where it.id = trocas_propostas.item_troca_id
        and it.user_id = auth.uid()
    )
  );

create policy trocas_propostas_exclusao_proponente
  on public.trocas_propostas
  for delete
  to authenticated
  using (proponente_user_id = auth.uid());
