-- =============================================================================
-- Migration 14 — estudo por espécie, sementes por espécie, histórico de moedas
--
-- Implementa a "Especificação funcional e lista de correções" da Sarah
-- (22/10/2026), itens 1.1, 1.3 e 1.4, com as decisões tomadas pelo Gustavo:
--
--   • Concluir o estudo de uma espécie = ler a ficha E concluir o quiz dela.
--     Rende o XP do catálogo, moedas e a SEMENTE DAQUELA ESPÉCIE (é o
--     "primeiro plantio gratuito").
--   • Estudar de novo uma espécie já estudada (refazer o quiz) rende moedas,
--     uma vez por dia por espécie.
--   • Sementes passam a ser POR ESPÉCIE (coluna user_colecao.sementes), não
--     mais um contador genérico em game_state.
--   • Toda entrada e saída de moedas fica registrada em atividades
--     (coluna moedas_delta), para o saldo poder ser conferido contra o histórico.
--   • Valores de recompensa e custo saem de constantes espalhadas e vão para
--     a tabela config_economia — o pedido explícito da especificação.
--
-- ADITIVA: o frontend que está no ar continua funcionando depois deste
-- arquivo. As funções antigas (estudar_planta, plantar_semente) e o pacote de
-- sementes genéricas da loja só saem no 04_FECHAMENTO, depois do deploy.
-- Ordem: este arquivo → deploy do frontend → fechamento.
-- =============================================================================


-- Trava as tabelas que as RPCs antigas usam, NA MESMA ORDEM em que elas as
-- usam (coleção/terreno/desafio → game_state → atividades). Quem estiver no
-- meio de uma colheita ou de um estudo termina antes; quem chegar depois
-- espera a migration acabar. Sem isto, uma colheita no meio da conversão podia
-- gravar moedas sem registro no histórico ou sementes genéricas não
-- convertidas. Leituras continuam liberadas. Se o SQL Editor acusar
-- "deadlock detected", basta rodar o arquivo de novo: nada terá sido gravado.
lock table public.user_colecao, public.terrenos_jardim, public.desafios_diarios_concluidos,
           public.game_state, public.atividades
  in exclusive mode;


-- -----------------------------------------------------------------------------
-- 1. Tabela de configuração da economia
-- -----------------------------------------------------------------------------
create table public.config_economia (
  chave text primary key,
  valor int not null check (valor >= 0),
  descricao text not null
);

comment on table public.config_economia is
  'Valores de recompensa e custo do jogo. Fonte de verdade lida pelas RPCs; espelhada em lib/economia.ts (ECONOMIA) para as telas anunciarem a recompensa antes da atividade. Mudou aqui, mude lá.';

insert into public.config_economia (chave, valor, descricao) values
  ('estudo_moedas',          20, 'Moedas por concluir o estudo de uma espécie pela primeira vez (ficha + quiz)'),
  ('estudo_sementes',         1, 'Sementes da espécie concedidas ao concluir o estudo (plantio gratuito)'),
  ('revisao_moedas',         10, 'Moedas por revisar uma espécie já estudada (uma revisão paga por espécie por dia)'),
  ('semente_preco',          10, 'Preço de uma semente extra de espécie já estudada'),
  ('colheita_xp',            40, 'XP por colheita'),
  ('colheita_moedas',        15, 'Moedas por colheita'),
  ('colheita_sementes',       1, 'Sementes da mesma espécie devolvidas pela colheita');

alter table public.config_economia enable row level security;
create policy config_economia_leitura on public.config_economia for select to authenticated using (true);
revoke all on public.config_economia from anon, authenticated;
grant select on public.config_economia to authenticated;

-- Leitura interna de um valor. STABLE e sem SECURITY DEFINER: só é chamada de
-- dentro das RPCs abaixo, que já rodam como dono.
create or replace function public.cfg(p_chave text)
returns int
language sql
stable
set search_path = public
as $$
  select valor from public.config_economia where chave = p_chave;
$$;
revoke all on function public.cfg(text) from public, anon, authenticated;


-- -----------------------------------------------------------------------------
-- 2. Estrutura nova
-- -----------------------------------------------------------------------------

-- Sementes por espécie. Só existem para espécies estudadas, por isso moram na
-- linha de user_colecao (uma por usuário × espécie estudada).
alter table public.user_colecao
  add column sementes int not null default 0
    constraint user_colecao_sementes_non_negative check (sementes >= 0),
  add column ultima_revisao_em date;

comment on column public.user_colecao.sementes is
  'Sementes disponíveis DESTA espécie. A primeira vem de concluir o estudo (plantio gratuito); as seguintes da colheita ou da compra.';
comment on column public.user_colecao.ultima_revisao_em is
  'Último dia (America/Manaus) em que a revisão desta espécie foi recompensada. Garante 1 revisão paga por dia.';

-- Histórico de moedas: cada RPC que mexe em moedas registra o delta aqui.
alter table public.atividades
  add column moedas_delta int not null default 0;

comment on column public.atividades.moedas_delta is
  'Variação de moedas causada por este evento (positiva = ganho, negativa = gasto). A soma por usuário confere com game_state.moedas a partir da Migration 14.';

-- Leitura da ficha: primeiro requisito do estudo.
create table public.fichas_lidas (
  user_id uuid not null references public.profiles (id) on delete cascade,
  planta_id text not null references public.catalogo_plantas_xp (planta_id),
  lida_em timestamptz not null default now(),
  constraint fichas_lidas_pkey primary key (user_id, planta_id)
);

comment on table public.fichas_lidas is
  'Espécies cuja ficha o usuário marcou como lida. Primeiro requisito do estudo; o segundo é concluir o quiz da espécie (concluir_quiz_especie).';

alter table public.fichas_lidas enable row level security;
create policy fichas_lidas_leitura_propria on public.fichas_lidas
  for select to authenticated using (user_id = auth.uid());
revoke all on public.fichas_lidas from anon, authenticated;
grant select on public.fichas_lidas to authenticated;


-- -----------------------------------------------------------------------------
-- 3. Ajuste dos dados existentes
-- -----------------------------------------------------------------------------

-- 3a. Quem já estudou uma espécie pelo fluxo antigo ganha a semente dela —
--     senão ficaria sem o plantio gratuito que a regra nova garante.
update public.user_colecao set sementes = sementes + 1;

-- 3b. Abre o histórico de moedas com o saldo atual, para a soma bater.
--     Ícone 'Registro' = linha contábil: entra na conferência do saldo, mas o
--     feed de atividades não a mostra (senão pareceria um ganho novo).
insert into public.atividades (user_id, icone, texto, xp_ganho, moedas_delta)
select user_id, 'Registro', 'Saldo de moedas registrado', 0, moedas
from public.game_state
where moedas > 0;

-- 3c. Sementes genéricas deixam de existir. As que sobraram viram moedas pelo
--     preço da semente (mesmo valor unitário do antigo pacote: 50 por 5).
insert into public.atividades (user_id, icone, texto, xp_ganho, moedas_delta)
select user_id, 'Registro', 'Sementes antigas convertidas em moedas', 0,
       sementes * public.cfg('semente_preco')
from public.game_state
where sementes > 0;

update public.game_state
set moedas = moedas + sementes * public.cfg('semente_preco'),
    sementes = 0
where sementes > 0;

-- 3d. O pacote de 5 sementes genéricas sai da loja JÁ AQUI, e não só no
--     fechamento: se ficasse, quem comprasse pelo frontend antigo durante o
--     deploy receberia sementes que nada mais consegue gastar.
delete from public.catalogo_itens_loja where item_id = 'semente';


-- -----------------------------------------------------------------------------
-- 4. RPCs novas
-- -----------------------------------------------------------------------------

-- 4a. Marcar a ficha como lida (sem recompensa: o prêmio vem com o quiz).
create or replace function public.registrar_leitura_ficha(p_planta_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'registrar_leitura_ficha: usuário não autenticado.';
  end if;
  if not exists (select 1 from public.catalogo_plantas_xp where planta_id = p_planta_id) then
    raise exception 'registrar_leitura_ficha: planta % não existe no catálogo.', p_planta_id;
  end if;

  insert into public.fichas_lidas (user_id, planta_id)
  values (v_user_id, p_planta_id)
  on conflict (user_id, planta_id) do nothing;
end;
$$;
revoke all on function public.registrar_leitura_ficha(text) from public, anon;
grant execute on function public.registrar_leitura_ficha(text) to authenticated;


-- 4b. Concluir o quiz de uma espécie.
--
-- Devolve jsonb com `status`:
--   'estudo_concluido'         primeira conclusão: XP + moedas + semente
--   'ficha_pendente'           quiz feito, mas a ficha ainda não foi lida
--   'revisao_recompensada'     espécie já estudada: moedas de revisão
--   'revisao_ja_recompensada'  revisão de hoje já paga para esta espécie
-- e os valores creditados + o game_state resultante.
--
-- Como o Desafio Diário, o servidor não confere as respostas (o gabarito está
-- no cliente). O que ele garante é que cada recompensa sai uma vez só.
create or replace function public.concluir_quiz_especie(p_planta_id text, p_planta_nome text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_hoje date := (now() at time zone 'America/Manaus')::date;
  v_xp int;
  v_moedas int := 0;
  v_sementes int := 0;
  v_status text;
  v_nome text := coalesce(p_planta_nome, p_planta_id);
  v_inseriu boolean;
begin
  if v_user_id is null then
    raise exception 'concluir_quiz_especie: usuário não autenticado.';
  end if;

  select xp_recompensa into v_xp from public.catalogo_plantas_xp where planta_id = p_planta_id;
  if not found then
    raise exception 'concluir_quiz_especie: planta % não existe no catálogo.', p_planta_id;
  end if;

  -- Trava a linha do jogador: serializa cliques duplos e retries de rede.
  perform 1 from public.game_state where user_id = v_user_id for update;
  if not found then
    raise exception 'concluir_quiz_especie: game_state não encontrado para o usuário %.', v_user_id;
  end if;

  if exists (select 1 from public.user_colecao where user_id = v_user_id and planta_id = p_planta_id) then
    -- Revisão: no máximo uma paga por espécie por dia.
    update public.user_colecao
      set ultima_revisao_em = v_hoje
      where user_id = v_user_id and planta_id = p_planta_id
        and ultima_revisao_em is distinct from v_hoje;

    if found then
      v_status := 'revisao_recompensada';
      v_xp := 0;
      v_moedas := public.cfg('revisao_moedas');
      update public.game_state set moedas = moedas + v_moedas where user_id = v_user_id;
      insert into public.atividades (user_id, icone, texto, xp_ganho, moedas_delta)
      values (v_user_id, 'BookOpen', 'Revisou a planta ' || v_nome, 0, v_moedas);
    else
      v_status := 'revisao_ja_recompensada';
      v_xp := 0;
    end if;

  elsif not exists (select 1 from public.fichas_lidas where user_id = v_user_id and planta_id = p_planta_id) then
    v_status := 'ficha_pendente';
    v_xp := 0;

  else
    v_moedas := public.cfg('estudo_moedas');
    v_sementes := public.cfg('estudo_sementes');

    insert into public.user_colecao (user_id, planta_id, status_crescimento, desbloqueada_em, sementes, ultima_revisao_em)
    values (v_user_id, p_planta_id, 'semente', now(), v_sementes, v_hoje)
    on conflict (user_id, planta_id) do nothing;
    v_inseriu := found;

    if v_inseriu then
      v_status := 'estudo_concluido';
      update public.game_state
        set xp = xp + v_xp, moedas = moedas + v_moedas
        where user_id = v_user_id;
      insert into public.atividades (user_id, icone, texto, xp_ganho, moedas_delta)
      values (v_user_id, 'Sprout', 'Concluiu o estudo de ' || v_nome || ' e ganhou a semente', v_xp, v_moedas);
    else
      -- Corrida perdida para outra chamada simultânea: ela já pagou.
      v_status := 'revisao_ja_recompensada';
      v_xp := 0; v_moedas := 0; v_sementes := 0;
    end if;
  end if;

  return jsonb_build_object(
    'status', v_status,
    'xp_ganho', v_xp,
    'moedas_ganho', v_moedas,
    'sementes_ganhas', v_sementes,
    'game_state', (select to_jsonb(g) from public.game_state g where g.user_id = v_user_id)
  );
end;
$$;
revoke all on function public.concluir_quiz_especie(text, text) from public, anon;
grant execute on function public.concluir_quiz_especie(text, text) to authenticated;


-- 4c. Plantar uma espécie usando a semente DELA. Com p_comprar = true e sem
--     semente, compra uma pelo preço da configuração e planta na mesma
--     transação — nunca cobra sem plantar nem planta sem cobrar (spec 6.5).
create or replace function public.plantar_especie(
  p_terreno_id smallint,
  p_planta_id text,
  p_comprar boolean default false
)
returns setof public.game_state
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_xp_atual int;
  v_nivel_atual smallint;
  v_planta_atual text;
  v_sementes int;
  v_preco int := public.cfg('semente_preco');
begin
  if v_user_id is null then
    raise exception 'plantar_especie: usuário não autenticado.';
  end if;
  if p_terreno_id not between 1 and 8 then
    raise exception 'plantar_especie: terreno % fora do intervalo válido (1-8).', p_terreno_id;
  end if;

  select xp into v_xp_atual from public.game_state where user_id = v_user_id for update;
  if not found then
    raise exception 'plantar_especie: game_state não encontrado para o usuário %.', v_user_id;
  end if;

  select coalesce(max(nivel), 1) into v_nivel_atual
    from public.catalogo_niveis where xp_min <= v_xp_atual;
  if v_nivel_atual < p_terreno_id then
    raise exception 'plantar_especie: terreno % exige nível %, usuário está no nível %.', p_terreno_id, p_terreno_id, v_nivel_atual;
  end if;

  select planta_id into v_planta_atual
    from public.terrenos_jardim
    where user_id = v_user_id and id = p_terreno_id
    for update;
  if v_planta_atual is not null then
    raise exception 'plantar_especie: terreno % já está ocupado.', p_terreno_id;
  end if;

  select sementes into v_sementes
    from public.user_colecao
    where user_id = v_user_id and planta_id = p_planta_id
    for update;
  if not found then
    raise exception 'plantar_especie: a espécie % ainda não foi estudada.', p_planta_id;
  end if;

  if v_sementes >= 1 then
    update public.user_colecao set sementes = sementes - 1
      where user_id = v_user_id and planta_id = p_planta_id;
  elsif p_comprar then
    update public.game_state set moedas = moedas - v_preco
      where user_id = v_user_id and moedas >= v_preco;
    if not found then
      raise exception 'plantar_especie: moedas insuficientes para comprar a semente.';
    end if;
    insert into public.atividades (user_id, icone, texto, xp_ganho, moedas_delta)
    values (v_user_id, 'ShoppingBag', 'Comprou uma semente', 0, -v_preco);
  else
    raise exception 'plantar_especie: sem sementes desta espécie.';
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
revoke all on function public.plantar_especie(smallint, text, boolean) from public, anon;
grant execute on function public.plantar_especie(smallint, text, boolean) to authenticated;


-- -----------------------------------------------------------------------------
-- 5. RPCs existentes: mesma assinatura, passam a registrar moedas e a usar a
--    configuração. `create or replace` com assinatura idêntica substitui sem
--    criar sobrecarga e preserva os privilégios.
-- -----------------------------------------------------------------------------

-- 5a. Colheita: XP e moedas da configuração; a semente devolvida é da MESMA
--     espécie colhida (antes: 2 sementes genéricas).
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
  v_ciclo_completo_ms constant bigint := 600000;
  v_xp int := public.cfg('colheita_xp');
  v_moedas int := public.cfg('colheita_moedas');
  v_sementes int := public.cfg('colheita_sementes');
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
  set planta_id = null, plantado_em = null, adubado = false, bonus_adubo_ms = 0
  where user_id = v_user_id and id = p_terreno_id;

  update public.game_state
  set xp = xp + v_xp, moedas = moedas + v_moedas
  where user_id = v_user_id;
  if not found then
    raise exception 'realizar_colheita: game_state não encontrado para o usuário %.', v_user_id;
  end if;

  -- Semente da mesma espécie. Se por algum motivo a espécie não estiver na
  -- coleção (plantio feito pelo fluxo antigo), não há onde guardar: ignora.
  update public.user_colecao set sementes = sementes + v_sementes
  where user_id = v_user_id and planta_id = v_planta_id;
  if not found then
    v_sementes := 0;
  end if;

  insert into public.atividades (user_id, icone, texto, xp_ganho, moedas_delta)
  values (v_user_id, 'Wheat', 'Colheu uma planta no Jardim do Conhecimento', v_xp, v_moedas);

  insert into public.colheitas (user_id, planta_id, terreno_id, xp_ganho, moedas_ganho, sementes_ganho)
  values (v_user_id, v_planta_id, p_terreno_id, v_xp, v_moedas, v_sementes);

  return query select * from public.game_state where user_id = v_user_id;
end;
$$;

-- 5b. Loja: registra o gasto no histórico.
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

  insert into public.atividades (user_id, icone, texto, xp_ganho, moedas_delta)
  values (v_user_id, 'ShoppingBag', 'Comprou um item na loja', 0, -v_custo);

  return query select * from public.game_state where user_id = v_user_id;
end;
$$;

-- 5c. Desafio Diário: registra as moedas no histórico (o resto é a Migration 13).
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
      maior_streak = greatest(maior_streak, v_streak_novo),
      ultimo_desafio_em = v_hoje
  where user_id = v_user_id;

  insert into public.atividades (user_id, icone, texto, xp_ganho, moedas_delta)
  values (v_user_id, 'BookOpen', 'Completou o Desafio Diário', v_xp_credito, v_moedas_credito);

  return query select * from public.game_state where user_id = v_user_id;
end;
$$;

-- 5d. estudar_planta (fluxo antigo, um clique na ficha): enquanto o frontend
--     antigo estiver no ar, quem estudar por ele também recebe a semente da
--     espécie. Some no fechamento.
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

  -- Mesmas recompensas e marcação de revisão de concluir_quiz_especie, para
  -- quem estudar pelo frontend antigo não sair perdendo durante o deploy.
  insert into public.user_colecao (user_id, planta_id, status_crescimento, desbloqueada_em, sementes, ultima_revisao_em)
  values (v_user_id, p_planta_id, 'semente', now(), public.cfg('estudo_sementes'),
          (now() at time zone 'America/Manaus')::date);

  update public.game_state
    set xp = xp + v_xp, moedas = moedas + public.cfg('estudo_moedas')
    where user_id = v_user_id;
  if not found then
    raise exception 'estudar_planta: game_state não encontrado para o usuário %.', v_user_id;
  end if;

  insert into public.atividades (user_id, icone, texto, xp_ganho, moedas_delta)
  values (v_user_id, 'BookOpen', 'Estudou a planta ' || coalesce(p_planta_nome, p_planta_id), v_xp,
          public.cfg('estudo_moedas'));

  return query select * from public.game_state where user_id = v_user_id;
end;
$$;
