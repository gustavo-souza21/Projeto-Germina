-- ============================================================================
-- GERMINA — Migration 8: correção da economia do jogo — Fase 1 do
--                        GERMINA_Auditoria_Autenticacao_Autorizacao.md
--
-- ACHADOS QUE ESTA MIGRATION FECHA (achados #1 e #2 do relatório):
--   • game_state (xp/moedas/sementes/adubo) era gravável pelo cliente com
--     qualquer valor — RLS só conferia o dono da linha (auth.uid() =
--     user_id), nunca o valor gravado. Qualquer usuário autenticado podia
--     abrir o console do navegador e chamar
--     `supabase.from('game_state').update({ xp: 999999, ... })` direto.
--   • `realizar_colheita` (Migration 7) confiava em p_xp/p_moedas/p_sementes
--     do chamador e não validava se o terreno estava de fato pronto — dava
--     pra colher o mesmo canteiro em loop, com valores arbitrários.
--
-- A CORREÇÃO, EM DUAS CAMADAS (uma sem a outra não fecha o achado):
--   1. Toda recompensa passa a ser CALCULADA DENTRO DE UMA FUNÇÃO NO SERVIDOR
--      (security definer), nunca recebida como parâmetro do cliente — as
--      funções abaixo só aceitam a AÇÃO (qual terreno, qual planta, qual
--      item da loja), nunca o valor do prêmio.
--   2. O privilégio de UPDATE/INSERT direto em game_state/terrenos_jardim/
--      user_colecao/atividades/colheitas/desafios_diarios_concluidos é
--      REVOGADO do role `authenticated` no fim deste arquivo — não é só
--      "a UI não faz mais isso", é "o Postgres recusa mesmo que alguém
--      chame a tabela direto pela REST API, fora da UI". Sem isso, fechar só
--      a lógica das funções não impediria ninguém de ignorá-las.
--
-- O QUE FICA DE FORA DESTA MIGRATION (limitação aceita, documentada, não
-- esta é uma dívida nova — é a mesma classe de risco já aceita em outras
-- partes deste projeto e fica sinalizada em vez de escondida):
--   • O gabarito do Desafio Diário continua trafegando inteiro para o
--     cliente (data/desafioDiarioQuiz.ts) — esta migration limita o PRÊMIO
--     (xp/moedas) ao máximo do catálogo e impede repetir o mesmo desafio no
--     mesmo dia, mas não valida no servidor se as respostas realmente
--     estavam certas. Fechar isso por completo exigiria mover a correção do
--     quiz para o servidor (não expor o gabarito ao cliente antes da
--     submissão) — mudança maior, fora do escopo desta Fase 1.
--   • `respostas_quiz` (telemetria por pergunta, usada pela conquista
--     "Curador Atento") continua inserida direto pelo cliente, com o campo
--     `correta` autodeclarado — mesma limitação acima, mesmo motivo.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 0. Catálogos-espelho no servidor
--
-- PLANTAS_CATALOGO, ITENS_LOJA, NIVEIS_EVOLUCAO e DESAFIOS_INICIAIS só
-- existiam em código TypeScript (data/plantasData.ts, lib/loja.ts) — nenhuma
-- tabela os espelhava, então nenhuma função no servidor tinha como calcular
-- uma recompensa sem confiar no cliente. Estas tabelas trazem só o MÍNIMO
-- necessário pra validar valor (não duplicam o conteúdo editorial inteiro:
-- descrição, usos tradicionais etc. continuam só no cliente, que é conteúdo
-- de exibição, não de economia).
--
-- Risco aceito e documentado: passam a existir DUAS fontes do mesmo número
-- (ex.: plantasData.ts diz planta '1' vale 100 XP, e agora esta tabela
-- também diz isso) — se um catálogo mudar no código sem replicar aqui, a UI
-- e o servidor divergem. Não há hoje um gerador automático que sincronize os
-- dois lados; fica como débito técnico sinalizado, não resolvido.
-- ----------------------------------------------------------------------------

create table public.catalogo_plantas_xp (
  planta_id text primary key,
  xp_recompensa int not null check (xp_recompensa > 0)
);
comment on table public.catalogo_plantas_xp is
  'Espelho mínimo de PLANTAS_CATALOGO (data/plantasData.ts) — só id + xp_recompensa, o suficiente para estudar_planta() validar o ganho no servidor sem confiar no cliente.';

insert into public.catalogo_plantas_xp (planta_id, xp_recompensa) values
  ('1', 100), ('2', 100), ('3', 100), ('4', 100), ('5', 100), ('6', 100), ('7', 100),
  ('8', 50), ('9', 50), ('10', 50), ('11', 50), ('12', 50), ('13', 50), ('14', 50), ('15', 50);

alter table public.catalogo_plantas_xp enable row level security;
create policy catalogo_plantas_xp_leitura on public.catalogo_plantas_xp for select to authenticated using (true);
grant select on public.catalogo_plantas_xp to authenticated;


create table public.catalogo_niveis (
  nivel smallint primary key check (nivel between 1 and 8),
  xp_min int not null
);
comment on table public.catalogo_niveis is
  'Espelho de NIVEIS_EVOLUCAO (data/plantasData.ts) — só nivel + xpMin, usado por plantar_semente() para confirmar que o usuário já tem o nível que libera o canteiro (nivel_necessario = id do terreno, invariante já documentada na migration C4).';

insert into public.catalogo_niveis (nivel, xp_min) values
  (1, 0), (2, 250), (3, 700), (4, 1250), (5, 2000), (6, 2900), (7, 3900), (8, 5000);

alter table public.catalogo_niveis enable row level security;
create policy catalogo_niveis_leitura on public.catalogo_niveis for select to authenticated using (true);
grant select on public.catalogo_niveis to authenticated;


create table public.catalogo_itens_loja (
  item_id text primary key,
  custo int not null check (custo > 0),
  quantidade int not null check (quantidade > 0),
  recurso text not null check (recurso in ('adubo', 'sementes', 'tema')),
  -- Só usado quando recurso = 'tema': valor gravado em game_state.tema_ativo.
  -- Mantém EXATAMENTE o mesmo valor que ITENS_LOJA já credita hoje
  -- ('Tema Amazônia Profunda', o `nome` do item em lib/loja.ts) — não é o id
  -- 'Amazonia Profunda' usado em ConfiguracoesClient.TEMAS. Essa divergência
  -- já existia antes desta migration (item de dado inconsistente, não uma
  -- introdução desta correção) e não foi resolvida aqui por estar fora do
  -- escopo de autenticação/autorização — só preservada, para não mudar
  -- comportamento sem revisão.
  tema_valor text
);
comment on table public.catalogo_itens_loja is
  'Espelho de ITENS_LOJA (lib/loja.ts) — preço/quantidade/recurso, usado por comprar_item_loja() para debitar e creditar sem confiar no valor que o cliente anuncia (QA-03, mesma classe de bug que este catálogo agora impede de voltar a acontecer).';

insert into public.catalogo_itens_loja (item_id, custo, quantidade, recurso, tema_valor) values
  ('adubo', 40, 3, 'adubo', null),
  ('semente', 50, 5, 'sementes', null),
  ('tema', 200, 1, 'tema', 'Tema Amazônia Profunda');

alter table public.catalogo_itens_loja enable row level security;
create policy catalogo_itens_loja_leitura on public.catalogo_itens_loja for select to authenticated using (true);
grant select on public.catalogo_itens_loja to authenticated;


create table public.catalogo_desafios (
  desafio_id text primary key,
  xp_max int not null check (xp_max >= 0),
  moedas_max int not null check (moedas_max >= 0)
);
comment on table public.catalogo_desafios is
  'Espelho de DESAFIOS_INICIAIS (data/plantasData.ts) — só o TETO de xp/moedas por desafio. concluir_desafio_diario() usa isto para nunca creditar mais do que o catálogo promete, mesmo sem (ainda) validar as respostas em si no servidor — ver nota no topo do arquivo.';

insert into public.catalogo_desafios (desafio_id, xp_max, moedas_max) values
  ('d0', 200, 35),
  ('d1', 80, 25),
  ('d2', 100, 30),
  ('d3', 120, 40);

alter table public.catalogo_desafios enable row level security;
create policy catalogo_desafios_leitura on public.catalogo_desafios for select to authenticated using (true);
grant select on public.catalogo_desafios to authenticated;


-- ----------------------------------------------------------------------------
-- 1. realizar_colheita — substitui a versão da Migration 7
--
-- Diferenças da versão anterior:
--   • Não recebe mais p_user_id/p_xp/p_moedas/p_sementes/p_texto_atividade/
--     p_icone_atividade do chamador — usuário vem de auth.uid(), recompensa
--     é a mesma constante que o cliente já usava (40 XP / 15 moedas /
--     2 sementes, JardimClient.tsx), agora fixada aqui.
--   • Exige planta_id IS NOT NULL no UPDATE do terreno (antes bastava a
--     linha existir, então um canteiro já colhido podia ser "colhido" de
--     novo indefinidamente).
--   • Exige que o tempo de crescimento (CICLO_COMPLETO_MS = 600000ms /
--     10min, lib/jardim.ts) mais o bônus de adubo já tenham decorrido desde
--     plantado_em — antes essa checagem existia só no cliente
--     (calcularProgresso(...).fase !== 'pronto').
--   • security definer (era invoker): precisa ser definer agora porque o
--     GRANT de UPDATE em game_state/terrenos_jardim é revogado do role
--     authenticated no fim deste arquivo — com invoker, a própria função
--     perderia o privilégio de escrever.
-- ----------------------------------------------------------------------------
-- ATENÇÃO — este DROP é parte da correção, não limpeza cosmética.
--
-- A versão vulnerável da Migration 7 tem OUTRA assinatura
-- (p_user_id, p_terreno_id, p_planta_id, p_xp, p_moedas, p_sementes,
-- p_texto_atividade, p_icone_atividade). No Postgres, `create or replace
-- function` só substitui quando a lista de argumentos é idêntica — com
-- assinatura diferente, ele CRIA UMA SOBRECARGA e deixa a antiga viva ao
-- lado da nova.
--
-- Sem este DROP, a função que aceita p_xp/p_moedas/p_sementes do chamador
-- continuaria existindo e chamável (`.rpc('realizar_colheita', { p_user_id,
-- p_xp, ... })`) — ou seja, o achado #2 continuaria aberto por trás de uma
-- correção que parecia aplicada. Descoberto ao rodar as 10 migrations em
-- sequência num Postgres 16 limpo, na Fase 3; o erro que denunciou isso foi
-- o `comment on function` abaixo falhando com "function name is not unique".
drop function if exists public.realizar_colheita(
  uuid, smallint, text, int, int, int, text, text
);

create or replace function public.realizar_colheita(p_terreno_id smallint)
returns setof public.game_state
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_planta_id text;
  v_plantado_em timestamptz;
  v_bonus_adubo_ms int;
  v_decorrido_ms bigint;
  -- Mesma constante de lib/jardim.ts (CICLO_COMPLETO_MS = 1+2+3+4 min).
  v_ciclo_completo_ms constant bigint := 600000;
  v_xp constant int := 40;
  v_moedas constant int := 15;
  v_sementes constant int := 2;
begin
  if v_user_id is null then
    raise exception 'realizar_colheita: usuário não autenticado.';
  end if;

  select planta_id, plantado_em, bonus_adubo_ms
    into v_planta_id, v_plantado_em, v_bonus_adubo_ms
    from public.terrenos_jardim
    where user_id = v_user_id and id = p_terreno_id
    for update;

  if not found or v_planta_id is null or v_plantado_em is null then
    raise exception 'realizar_colheita: terreno % não está ocupado para o usuário %.', p_terreno_id, v_user_id;
  end if;

  v_decorrido_ms := (extract(epoch from (now() - v_plantado_em)) * 1000)::bigint + coalesce(v_bonus_adubo_ms, 0);

  if v_decorrido_ms < v_ciclo_completo_ms then
    raise exception 'realizar_colheita: a planta do terreno % ainda não está pronta.', p_terreno_id;
  end if;

  update public.terrenos_jardim
  set planta_id = null,
      plantado_em = null,
      adubado = false,
      bonus_adubo_ms = 0
  where user_id = v_user_id and id = p_terreno_id;

  update public.game_state
  set xp = xp + v_xp,
      moedas = moedas + v_moedas,
      sementes = sementes + v_sementes
  where user_id = v_user_id;

  if not found then
    raise exception 'realizar_colheita: game_state não encontrado para o usuário %.', v_user_id;
  end if;

  insert into public.atividades (user_id, icone, texto, xp_ganho)
  values (v_user_id, 'Wheat', 'Colheu uma planta no Jardim do Conhecimento', v_xp);

  insert into public.colheitas (user_id, planta_id, terreno_id, xp_ganho, moedas_ganho, sementes_ganho)
  values (v_user_id, v_planta_id, p_terreno_id, v_xp, v_moedas, v_sementes);

  return query select * from public.game_state where user_id = v_user_id;
end;
$$;

-- Assinatura explícita no COMMENT (e nos demais deste arquivo): sem ela, o
-- Postgres recusa se houver qualquer homônima, e o erro é obscuro.
comment on function public.realizar_colheita(smallint) is
  'Colheita atômica — recompensa fixa calculada aqui dentro (nunca recebida do chamador), exige planta_id ocupado e tempo de crescimento decorrido. Substitui a versão da Migration 7, que confiava em p_xp/p_moedas/p_sementes do cliente.';

revoke all on function public.realizar_colheita(smallint) from public;
grant execute on function public.realizar_colheita(smallint) to authenticated;


-- ----------------------------------------------------------------------------
-- 2. plantar_semente — nova RPC, substitui o upsert direto em
--    terrenos_jardim + update direto em game_state que JardimClient.
--    handlePlantSemente fazia hoje.
--
-- Fecha, de brinde, um segundo problema que a auditoria não tinha nomeado
-- explicitamente: o cliente escolhia o próprio `plantado_em` no upsert —
-- nada impedia mandar um timestamp no passado (ou um bonus_adubo_ms
-- gigante) pra fazer a planta nascer já "pronta". Aqui `plantado_em` é
-- sempre `now()`, nunca um valor recebido.
--
-- Também valida o nível do usuário contra catalogo_niveis — nada no banco
-- impedia antes plantar direto no terreno 8 sem nunca ter chegado ao nível
-- 8 (a trava só existia na UI, que escondia canteiros bloqueados).
-- ----------------------------------------------------------------------------
create or replace function public.plantar_semente(p_terreno_id smallint, p_planta_id text)
returns setof public.game_state
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_planta_atual text;
  v_xp_atual int;
  v_nivel_atual smallint;
begin
  if v_user_id is null then
    raise exception 'plantar_semente: usuário não autenticado.';
  end if;

  if p_terreno_id not between 1 and 8 then
    raise exception 'plantar_semente: terreno % fora do intervalo válido (1-8).', p_terreno_id;
  end if;

  if not exists (select 1 from public.catalogo_plantas_xp where planta_id = p_planta_id) then
    raise exception 'plantar_semente: planta % não existe no catálogo.', p_planta_id;
  end if;

  select xp into v_xp_atual from public.game_state where user_id = v_user_id for update;
  if not found then
    raise exception 'plantar_semente: game_state não encontrado para o usuário %.', v_user_id;
  end if;

  select coalesce(max(nivel), 1) into v_nivel_atual
    from public.catalogo_niveis where xp_min <= v_xp_atual;

  -- nivel_necessario do terreno é sempre o próprio id (invariante documentada
  -- na migration C4 — 1 nível = 1 canteiro).
  if v_nivel_atual < p_terreno_id then
    raise exception 'plantar_semente: terreno % exige nível %, usuário está no nível %.', p_terreno_id, p_terreno_id, v_nivel_atual;
  end if;

  select planta_id into v_planta_atual
    from public.terrenos_jardim
    where user_id = v_user_id and id = p_terreno_id
    for update;

  if v_planta_atual is not null then
    raise exception 'plantar_semente: terreno % já está ocupado.', p_terreno_id;
  end if;

  update public.game_state
  set sementes = sementes - 1
  where user_id = v_user_id and sementes >= 1;

  if not found then
    raise exception 'plantar_semente: sementes insuficientes para o usuário %.', v_user_id;
  end if;

  insert into public.terrenos_jardim (user_id, id, planta_id, plantado_em, bonus_adubo_ms, adubado)
  values (v_user_id, p_terreno_id, p_planta_id, now(), 0, false)
  on conflict (user_id, id) do update
    set planta_id = excluded.planta_id,
        plantado_em = excluded.plantado_em,
        bonus_adubo_ms = 0,
        adubado = false;

  return query select * from public.game_state where user_id = v_user_id;
end;
$$;

comment on function public.plantar_semente(smallint, text) is
  'Debita 1 semente e ocupa o terreno — plantado_em é sempre now() (nunca recebido do cliente), e o nível do usuário é validado contra catalogo_niveis antes de liberar o canteiro.';

revoke all on function public.plantar_semente(smallint, text) from public;
grant execute on function public.plantar_semente(smallint, text) to authenticated;


-- ----------------------------------------------------------------------------
-- 3. adubar_terreno — substitui o update direto em terrenos_jardim + update
--    direto em game_state.adubo que JardimClient.handleAdubarTerreno fazia.
-- ----------------------------------------------------------------------------
create or replace function public.adubar_terreno(p_terreno_id smallint)
returns setof public.game_state
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_planta_id text;
  v_bonus_atual int;
  -- Mesma constante de lib/jardim.ts (BONUS_ADUBO_MS).
  v_bonus_adubo constant int := 90000;
begin
  if v_user_id is null then
    raise exception 'adubar_terreno: usuário não autenticado.';
  end if;

  select planta_id, bonus_adubo_ms into v_planta_id, v_bonus_atual
    from public.terrenos_jardim
    where user_id = v_user_id and id = p_terreno_id
    for update;

  if not found or v_planta_id is null then
    raise exception 'adubar_terreno: terreno % não está ocupado para o usuário %.', p_terreno_id, v_user_id;
  end if;

  update public.game_state
  set adubo = adubo - 1
  where user_id = v_user_id and adubo >= 1;

  if not found then
    raise exception 'adubar_terreno: adubo insuficiente para o usuário %.', v_user_id;
  end if;

  update public.terrenos_jardim
  set adubado = true,
      bonus_adubo_ms = coalesce(v_bonus_atual, 0) + v_bonus_adubo
  where user_id = v_user_id and id = p_terreno_id;

  return query select * from public.game_state where user_id = v_user_id;
end;
$$;

comment on function public.adubar_terreno(smallint) is
  'Debita 1 adubo e soma o bônus de tempo ao terreno — valor do bônus fixo aqui dentro, nunca recebido do cliente.';

revoke all on function public.adubar_terreno(smallint) from public;
grant execute on function public.adubar_terreno(smallint) to authenticated;


-- ----------------------------------------------------------------------------
-- 4. comprar_item_loja — substitui o update direto em game_state +
--    insert direto em atividades que JardimClient.handleComprarItem fazia.
-- ----------------------------------------------------------------------------
create or replace function public.comprar_item_loja(p_item_id text)
returns setof public.game_state
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_custo int;
  v_quantidade int;
  v_recurso text;
  v_tema_valor text;
begin
  if v_user_id is null then
    raise exception 'comprar_item_loja: usuário não autenticado.';
  end if;

  select custo, quantidade, recurso, tema_valor
    into v_custo, v_quantidade, v_recurso, v_tema_valor
    from public.catalogo_itens_loja
    where item_id = p_item_id;

  if not found then
    raise exception 'comprar_item_loja: item % não existe no catálogo.', p_item_id;
  end if;

  update public.game_state
  set moedas = moedas - v_custo
  where user_id = v_user_id and moedas >= v_custo;

  if not found then
    raise exception 'comprar_item_loja: moedas insuficientes para o usuário %.', v_user_id;
  end if;

  if v_recurso = 'adubo' then
    update public.game_state set adubo = adubo + v_quantidade where user_id = v_user_id;
  elsif v_recurso = 'sementes' then
    update public.game_state set sementes = sementes + v_quantidade where user_id = v_user_id;
  elsif v_recurso = 'tema' then
    update public.game_state set tema_ativo = v_tema_valor where user_id = v_user_id;
  end if;

  insert into public.atividades (user_id, icone, texto, xp_ganho)
  values (v_user_id, 'ShoppingBag', 'Comprou um item na loja', 0);

  return query select * from public.game_state where user_id = v_user_id;
end;
$$;

comment on function public.comprar_item_loja(text) is
  'Debita o custo e credita o recurso do item comprado — preço/quantidade sempre lidos de catalogo_itens_loja, nunca do cliente (fecha a mesma classe de bug do QA-03, agora também no servidor).';

revoke all on function public.comprar_item_loja(text) from public;
grant execute on function public.comprar_item_loja(text) to authenticated;


-- ----------------------------------------------------------------------------
-- 5. estudar_planta — substitui o upsert direto em user_colecao + update
--    direto em game_state + insert direto em atividades que
--    FichaBotanicaClient.handleEstudarPlanta fazia.
--
-- Fecha um segundo problema não nomeado explicitamente na auditoria: como o
-- crédito de XP e o upsert em user_colecao eram duas chamadas separadas sem
-- checagem de "já estudei isso?" no servidor, chamar a mutação da tela
-- direto (fora da guarda client-side `colecao.some(...)`) permitia repetir
-- o estudo da mesma planta indefinidamente, cada vez creditando XP de novo.
-- Aqui a existência prévia da linha em user_colecao é checada e bloqueia
-- antes de creditar.
-- ----------------------------------------------------------------------------
create or replace function public.estudar_planta(p_planta_id text, p_planta_nome text default null)
returns setof public.game_state
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_xp int;
begin
  if v_user_id is null then
    raise exception 'estudar_planta: usuário não autenticado.';
  end if;

  select xp_recompensa into v_xp from public.catalogo_plantas_xp where planta_id = p_planta_id;
  if not found then
    raise exception 'estudar_planta: planta % não existe no catálogo.', p_planta_id;
  end if;

  if exists (select 1 from public.user_colecao where user_id = v_user_id and planta_id = p_planta_id) then
    raise exception 'estudar_planta: planta % já foi estudada pelo usuário %.', p_planta_id, v_user_id;
  end if;

  insert into public.user_colecao (user_id, planta_id, status_crescimento, desbloqueada_em)
  values (v_user_id, p_planta_id, 'semente', now());

  update public.game_state set xp = xp + v_xp where user_id = v_user_id;

  if not found then
    raise exception 'estudar_planta: game_state não encontrado para o usuário %.', v_user_id;
  end if;

  insert into public.atividades (user_id, icone, texto, xp_ganho)
  values (v_user_id, 'BookOpen', 'Estudou a planta ' || coalesce(p_planta_nome, p_planta_id), v_xp);

  return query select * from public.game_state where user_id = v_user_id;
end;
$$;

comment on function public.estudar_planta(text, text) is
  'Credita XP e registra a planta como estudada — recusa repetir a mesma planta (antes só a UI evitava isso), recompensa sempre lida de catalogo_plantas_xp. p_planta_nome é só cosmético (texto do log de atividade), não influencia o valor creditado.';

revoke all on function public.estudar_planta(text, text) from public;
grant execute on function public.estudar_planta(text, text) to authenticated;


-- ----------------------------------------------------------------------------
-- 6. concluir_desafio_diario — substitui o upsert direto em
--    desafios_diarios_concluidos + insert direto em atividades + update
--    direto em game_state que DesafioDiarioClient.handleNextStep fazia.
--
-- Limitação aceita (ver nota no topo do arquivo): NÃO valida se as respostas
-- do quiz estavam corretas — o gabarito ainda vive só no cliente. O que esta
-- função fecha:
--   • "hoje" é calculado no servidor (fuso America/Manaus, mesmo usado pelo
--     app), nunca recebido do cliente — antes o cliente escolhia a data
--     (diaLocal()), o que permitiria repetir o desafio indefinidamente
--     mandando uma data diferente a cada chamada direta à API.
--   • xp/moedas creditados são sempre limitados ao teto do catálogo
--     (catalogo_desafios) — o cliente ainda informa quanto ACHA que ganhou
--     (baseado nas respostas certas), mas o valor é sempre cortado no máximo
--     legítimo daquele desafio, nunca superior.
--   • um desafio já concluído hoje não é recreditado — a existência prévia
--     da linha em desafios_diarios_concluidos é checada antes de somar XP,
--     não depois (o upsert anterior sobrescrevia a linha mas ainda somava
--     XP de novo a cada chamada).
--   • a ofensiva (streak) é recalculada aqui dentro com a mesma regra de
--     lib/ofensiva.ts (registrarConclusao) — dias consecutivos = +1, falha
--     de um dia ou mais = reinicia em 1 — em vez de aceitar o streak que o
--     cliente mandar.
-- ----------------------------------------------------------------------------
create or replace function public.concluir_desafio_diario(
  p_desafio_id text,
  p_xp_ganho int,
  p_moedas_ganho int
)
returns setof public.game_state
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_xp_max int;
  v_moedas_max int;
  v_xp_credito int;
  v_moedas_credito int;
  v_hoje date := (now() at time zone 'America/Manaus')::date;
  v_streak_atual int;
  v_ultimo_desafio date;
  v_streak_novo int;
begin
  if v_user_id is null then
    raise exception 'concluir_desafio_diario: usuário não autenticado.';
  end if;

  select xp_max, moedas_max into v_xp_max, v_moedas_max
    from public.catalogo_desafios where desafio_id = p_desafio_id;
  if not found then
    raise exception 'concluir_desafio_diario: desafio % não existe no catálogo.', p_desafio_id;
  end if;

  if exists (
    select 1 from public.desafios_diarios_concluidos
    where user_id = v_user_id and desafio_id = p_desafio_id and data = v_hoje
  ) then
    -- Já concluído hoje: não é erro (o cliente pode chamar duas vezes por
    -- clique duplo/retry de rede), só não credita de novo — devolve o
    -- game_state atual sem alterá-lo.
    return query select * from public.game_state where user_id = v_user_id;
    return;
  end if;

  v_xp_credito := least(greatest(coalesce(p_xp_ganho, 0), 0), v_xp_max);
  v_moedas_credito := least(greatest(coalesce(p_moedas_ganho, 0), 0), v_moedas_max);

  select streak, ultimo_desafio_em into v_streak_atual, v_ultimo_desafio
    from public.game_state where user_id = v_user_id for update;
  if not found then
    raise exception 'concluir_desafio_diario: game_state não encontrado para o usuário %.', v_user_id;
  end if;

  if v_ultimo_desafio is null or (v_hoje - v_ultimo_desafio) > 1 then
    v_streak_novo := 1;
  elsif (v_hoje - v_ultimo_desafio) = 1 then
    v_streak_novo := coalesce(v_streak_atual, 0) + 1;
  else
    v_streak_novo := coalesce(v_streak_atual, 1);
  end if;

  insert into public.desafios_diarios_concluidos (user_id, desafio_id, data, xp_ganho, moedas_ganho)
  values (v_user_id, p_desafio_id, v_hoje, v_xp_credito, v_moedas_credito);

  update public.game_state
  set xp = xp + v_xp_credito,
      moedas = moedas + v_moedas_credito,
      streak = v_streak_novo,
      ultimo_desafio_em = v_hoje
  where user_id = v_user_id;

  insert into public.atividades (user_id, icone, texto, xp_ganho)
  values (v_user_id, 'BookOpen', 'Completou o Desafio Diário', v_xp_credito);

  return query select * from public.game_state where user_id = v_user_id;
end;
$$;

comment on function public.concluir_desafio_diario(text, int, int) is
  'Registra a conclusão do Desafio Diário, credita xp/moedas (sempre limitado ao teto de catalogo_desafios) e recalcula a ofensiva no servidor. "Hoje" é sempre calculado aqui (fuso America/Manaus), nunca recebido do cliente. NÃO valida as respostas do quiz em si — ver nota no topo do arquivo.';

revoke all on function public.concluir_desafio_diario(text, int, int) from public;
grant execute on function public.concluir_desafio_diario(text, int, int) to authenticated;


-- ----------------------------------------------------------------------------
-- 7. Fechar a porta que as RPCs acima tornam desnecessária: revogar o
--    privilégio de escrita direta que o cliente tinha nas tabelas de
--    economia. Sem isto, as funções acima são só "um jeito melhor de fazer
--    a mesma coisa" — com isto, o Postgres recusa a escrita direta mesmo
--    que alguém ignore a UI e chame a tabela pela REST API.
--
-- game_state: coluna a coluna. tema_ativo continua editável direto pelo
-- cliente (ConfiguracoesClient.handleUpdateTema) — não é campo de economia,
-- não precisa de RPC. Todas as demais colunas (xp, moedas, sementes, adubo,
-- streak, ultimo_desafio_em) só são graváveis pelas funções acima, que
-- rodam security definer e por isso não dependem deste GRANT.
-- ----------------------------------------------------------------------------
revoke insert, update, delete on public.game_state from authenticated;
grant update (tema_ativo) on public.game_state to authenticated;

-- terrenos_jardim: cliente só lê (Jardim, dashboard). Escrita inteira
-- (plantar/adubar/colher) passa a ser só via plantar_semente/adubar_terreno/
-- realizar_colheita.
revoke insert, update, delete on public.terrenos_jardim from authenticated;

-- user_colecao: cliente só lê (Biblioteca/Herbário). Escrita só via
-- estudar_planta.
revoke insert, update, delete on public.user_colecao from authenticated;

-- atividades: já não tinha update/delete (migration de restrição). Agora
-- também não tem insert direto — todo insert vem de dentro das funções
-- acima.
revoke insert on public.atividades from authenticated;

-- colheitas: idem — só a RPC realizar_colheita insere.
revoke insert on public.colheitas from authenticated;

-- desafios_diarios_concluidos: idem — só a RPC concluir_desafio_diario
-- insere.
revoke insert on public.desafios_diarios_concluidos from authenticated;

-- respostas_quiz: PERMANECE com insert direto do cliente (DesafioDiarioClient.
-- registrarRespostaQuiz) — é telemetria por pergunta, não afeta game_state,
-- e mover para RPC exigiria o mesmo redesenho do gabarito citado na nota do
-- topo do arquivo. Fora do escopo desta Fase 1, sinalizado, não resolvido.
