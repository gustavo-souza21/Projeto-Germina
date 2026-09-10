-- ============================================================================
-- GERMINA — Migration: restringir policies de profiles/atividades/
--                       desafios_diarios_concluidos (correção pós-A3)
--
-- A migration de RLS (A3/A4) aplicou `for all` uniformemente às 7 tabelas de
-- estado do usuário. Para 3 delas isso concede mutação que a própria
-- migration já sinalizava como risco:
--   • profiles: usuário podia fazer DELETE direto da própria linha sem
--     apagar auth.users junto — conta autenticável, sem perfil.
--   • atividades / desafios_diarios_concluidos: são logs de auditoria
--     (comentário de tabela já as declara append-only) — UPDATE/DELETE
--     permitia reescrever o próprio histórico.
--
-- Esta migration substitui as 3 policies `for all` por policies restritas a
-- SELECT (+ UPDATE só em profiles, + INSERT só nos dois logs). game_state,
-- terrenos_jardim, user_colecao e preferencias NÃO são tocadas — continuam
-- com isolamento total (ALL), que é o comportamento correto para elas:
-- todas têm um caminho de escrita legítimo de UPDATE do próprio cliente
-- (plantar, colher, comprar, mudar preferência) que as duas tabelas de log
-- e o profiles não têm.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Remover as policies antigas de ALL
-- ----------------------------------------------------------------------------
drop policy profiles_isolamento_total on public.profiles;
drop policy atividades_isolamento_total on public.atividades;
drop policy desafios_diarios_concluidos_isolamento_total on public.desafios_diarios_concluidos;


-- ----------------------------------------------------------------------------
-- 2. profiles — SELECT e UPDATE apenas
--
-- INSERT não tem policy própria de propósito: o único caminho de criação é
-- o trigger handle_new_user(), que roda security definer sob o dono das
-- tabelas (superusuário/owner do projeto) — RLS não se aplica a esse
-- caminho, com ou sem policy de INSERT para authenticated. Uma policy de
-- INSERT aqui só serviria para abrir uma porta que não precisa existir: o
-- cliente nunca deve inserir profiles diretamente.
--
-- DELETE também sem policy: exclusão de conta (G4) precisa continuar
-- passando por apagar auth.users (o cascade cuida do resto) — nunca por um
-- DELETE direto em profiles vindo do cliente.
-- ----------------------------------------------------------------------------
create policy profiles_leitura_propria
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy profiles_atualizacao_propria
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);


-- ----------------------------------------------------------------------------
-- 3. atividades e desafios_diarios_concluidos — SELECT e INSERT apenas
--
-- Sem policy de UPDATE nem de DELETE: nenhuma linha, depois de escrita, deve
-- mudar ou sumir por ação do cliente — é o que torna as duas tabelas
-- confiáveis como log/auditoria (inclusive como validação cruzada de
-- game_state.streak, discutido no Relatório de Mapeamento).
-- ----------------------------------------------------------------------------
create policy atividades_leitura_propria
  on public.atividades
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy atividades_insercao_propria
  on public.atividades
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy desafios_diarios_concluidos_leitura_propria
  on public.desafios_diarios_concluidos
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy desafios_diarios_concluidos_insercao_propria
  on public.desafios_diarios_concluidos
  for insert
  to authenticated
  with check (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 4. Defesa em profundidade: estreitar também o GRANT, não só a policy
--
-- As policies acima já bloqueiam UPDATE/DELETE por padrão-nega-tudo (nenhuma
-- policy permissiva para esses comandos = acesso negado). Revogar o GRANT
-- correspondente é redundante hoje, mas remove a possibilidade de uma policy
-- permissiva futura, criada por engano numa migration seguinte, reabrir a
-- mutação sozinha — o privilégio de tabela também precisaria ser
-- reconcedido explicitamente. Vai além do que foi pedido; mantenho aqui
-- comentado como parte da mesma correção porque é a mesma causa raiz.
-- ----------------------------------------------------------------------------
revoke insert, delete on public.profiles from authenticated;
revoke update, delete on public.atividades from authenticated;
revoke update, delete on public.desafios_diarios_concluidos from authenticated;
