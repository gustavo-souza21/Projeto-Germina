-- =============================================================================
-- Migration 15 — níveis da Sarah, ritmo da horta e missões com recompensa
--
-- Decisões tomadas pelo Gustavo em 22/10/2026 para a Sarah avaliar depois
-- (ver claude/GERMINA_Especificacao_Sarah_Configuracao_e_Status.md):
--
--   • 6 níveis com os nomes propostos pela Sarah. Os 8 canteiros continuam:
--     os níveis 4 e 6 liberam dois de uma vez. Cada nível tem uma recompensa
--     em moedas, paga UMA vez pelo servidor ao ser alcançado.
--   • Horta mais lenta e com menos XP: ciclo de 30 min (era 10), adubo
--     adianta 5 min (era 90 s), colheita rende 10 XP (era 40). O nível passa
--     a vir principalmente do estudo; a horta é fonte de moedas. Os valores
--     novos só entram no fechamento, depois do deploy (ver seção 2).
--   • Missões com recompensa em moedas, progresso calculado e pago no servidor.
--
-- Compatível com o frontend que está no ar (Migration 14): nenhuma função
-- muda de assinatura, nenhuma é removida, e o ritmo da horta continua o
-- mesmo até o fechamento. Ordem: este arquivo → deploy → fechamento.
-- =============================================================================

-- Mesma trava e mesma ordem da Migration 14 (ver comentário lá). Se o SQL
-- Editor acusar "deadlock detected", rode de novo: nada terá sido gravado.
-- Tudo numa transação: ou entra inteiro, ou nada muda.
begin;

-- Os catálogos entram primeiro: as RPCs os leem antes de tocar em game_state,
-- e este arquivo os altera (ALTER TABLE) depois de travar game_state.
lock table public.catalogo_plantas_xp, public.catalogo_niveis,
           public.user_colecao, public.terrenos_jardim, public.desafios_diarios_concluidos,
           public.game_state, public.atividades
  in exclusive mode;


-- -----------------------------------------------------------------------------
-- 1. Níveis
-- -----------------------------------------------------------------------------
alter table public.catalogo_niveis
  add column nome text,
  add column canteiros smallint,
  add column moedas_recompensa int not null default 0 check (moedas_recompensa >= 0);

delete from public.catalogo_niveis where nivel > 6;

update public.catalogo_niveis as c set
  xp_min = v.xp_min, nome = v.nome, canteiros = v.canteiros, moedas_recompensa = v.moedas
from (values
  (1,    0, 'Semente Curiosa',          1,   0),
  (2,  200, 'Broto Aprendiz',           2,  20),
  (3,  600, 'Muda Exploradora',         3,  30),
  (4, 1200, 'Planta Conhecedora',       5,  40),
  (5, 2000, 'Flor do Saber',            6,  60),
  (6, 3000, 'Guardião do Conhecimento', 8, 100)
) as v(nivel, xp_min, nome, canteiros, moedas)
where c.nivel = v.nivel;

alter table public.catalogo_niveis
  alter column nome set not null,
  alter column canteiros set not null;

comment on table public.catalogo_niveis is
  'Trilha de níveis: XP mínimo, nome, quantos canteiros ficam liberados e a recompensa em moedas paga uma vez ao alcançar o nível. Espelhada em NIVEIS_EVOLUCAO (data/plantasData.ts).';

-- Até que nível a recompensa já foi paga. Não é derivável do XP: se a
-- trilha mudar de novo, é isto que evita pagar duas vezes ou pular um nível.
alter table public.game_state
  add column nivel_recompensado smallint not null default 1;


-- -----------------------------------------------------------------------------
-- 2. Ritmo da horta
--
-- AQUI as chaves entram com os valores ANTIGOS (10 min, 90 s, 40 XP), iguais
-- ao frontend que está no ar: se o servidor passasse a exigir 30 min agora, o
-- app atual mostraria "Colher" aos 10 min e toda colheita falharia até o
-- deploy. Os valores novos entram no 07_FECHAMENTO, depois do deploy. Nessa
-- janela o app novo espera 30 min e o servidor aceita 10: nunca há botão de
-- colher que o servidor recuse.
-- -----------------------------------------------------------------------------
insert into public.config_economia (chave, valor, descricao) values
  ('ciclo_ms',        600000, 'Tempo do plantio até a colheita, em ms'),
  ('adubo_bonus_ms',   90000, 'Quanto cada adubo adianta o crescimento, em ms');


-- -----------------------------------------------------------------------------
-- 3. Crédito de XP com recompensa de nível (função interna)
-- -----------------------------------------------------------------------------
-- Soma o XP e, se o jogador alcançou níveis novos, paga as moedas de cada um
-- e registra no histórico. Só é chamada de dentro das RPCs (que já rodam como
-- dono e já travaram a linha de game_state); ninguém de fora pode executá-la.
create or replace function public.creditar_xp(p_user_id uuid, p_xp int)
returns int
language plpgsql
set search_path = public
as $$
declare
  v_xp int;
  v_recompensado smallint;
  v_nivel smallint;
  v_nome text;
  v_moedas int := 0;
begin
  update public.game_state set xp = xp + greatest(p_xp, 0)
    where user_id = p_user_id
    returning xp, nivel_recompensado into v_xp, v_recompensado;
  if not found then
    raise exception 'creditar_xp: game_state não encontrado para o usuário %.', p_user_id;
  end if;

  select nivel, nome into v_nivel, v_nome
    from public.catalogo_niveis where xp_min <= v_xp order by nivel desc limit 1;

  if v_nivel > v_recompensado then
    select coalesce(sum(moedas_recompensa), 0) into v_moedas
      from public.catalogo_niveis where nivel > v_recompensado and nivel <= v_nivel;

    update public.game_state
      set moedas = moedas + v_moedas, nivel_recompensado = v_nivel
      where user_id = p_user_id;

    insert into public.atividades (user_id, icone, texto, xp_ganho, moedas_delta)
    values (p_user_id, 'Award', 'Alcançou o nível ' || v_nome, 0, v_moedas);
  end if;

  return v_moedas;
end;
$$;
revoke all on function public.creditar_xp(uuid, int) from public, anon, authenticated;


-- 3b. Quem já joga: os níveis já alcançados com a trilha nova também pagam
--     a recompensa (uma vez), registrada no histórico.
with niveis as (
  select g.user_id,
         (select max(c.nivel) from public.catalogo_niveis c where c.xp_min <= g.xp) as nivel
  from public.game_state g
), retro as (
  select n.user_id, n.nivel,
         (select coalesce(sum(c.moedas_recompensa), 0) from public.catalogo_niveis c
           where c.nivel > 1 and c.nivel <= n.nivel) as moedas
  from niveis n
), registro as (
  insert into public.atividades (user_id, icone, texto, xp_ganho, moedas_delta)
  select r.user_id, 'Award', 'Recompensa dos níveis já alcançados', 0, r.moedas
  from retro r where r.moedas > 0
  returning user_id
)
update public.game_state g
set moedas = g.moedas + r.moedas,
    nivel_recompensado = r.nivel
from retro r
where g.user_id = r.user_id;


-- -----------------------------------------------------------------------------
-- 4. RPCs existentes: mesma assinatura, agora com creditar_xp e configuração
-- -----------------------------------------------------------------------------

-- 4a. Concluir o quiz de uma espécie (Migration 14) — o XP do estudo passa por
--     creditar_xp; o resto é idêntico.
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

  perform 1 from public.game_state where user_id = v_user_id for update;
  if not found then
    raise exception 'concluir_quiz_especie: game_state não encontrado para o usuário %.', v_user_id;
  end if;

  if exists (select 1 from public.user_colecao where user_id = v_user_id and planta_id = p_planta_id) then
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
      update public.game_state set moedas = moedas + v_moedas where user_id = v_user_id;
      insert into public.atividades (user_id, icone, texto, xp_ganho, moedas_delta)
      values (v_user_id, 'Sprout', 'Concluiu o estudo de ' || v_nome || ' e ganhou a semente', v_xp, v_moedas);
      perform public.creditar_xp(v_user_id, v_xp);
    else
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

-- 4b. Desafio Diário — XP por creditar_xp.
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
    -- Já concluído hoje: não é erro (clique duplo/retry de rede), só não credita.
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
  set moedas = moedas + v_moedas_credito,
      streak = v_streak_novo,
      maior_streak = greatest(maior_streak, v_streak_novo),
      ultimo_desafio_em = v_hoje
  where user_id = v_user_id;

  insert into public.atividades (user_id, icone, texto, xp_ganho, moedas_delta)
  values (v_user_id, 'BookOpen', 'Completou o Desafio Diário', v_xp_credito, v_moedas_credito);

  perform public.creditar_xp(v_user_id, v_xp_credito);

  return query select * from public.game_state where user_id = v_user_id;
end;
$$;

-- 4c. Colheita — ciclo, XP e moedas da configuração; XP por creditar_xp.
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
  v_ciclo_completo_ms bigint := public.cfg('ciclo_ms');
  v_xp int := public.cfg('colheita_xp');
  v_moedas int := public.cfg('colheita_moedas');
  v_sementes int := public.cfg('colheita_sementes');
begin
  if v_user_id is null then
    raise exception 'realizar_colheita: usuário não autenticado.';
  end if;

  perform 1 from public.game_state where user_id = v_user_id for update;
  if not found then
    raise exception 'realizar_colheita: game_state não encontrado para o usuário %.', v_user_id;
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

  update public.game_state set moedas = moedas + v_moedas where user_id = v_user_id;

  update public.user_colecao set sementes = sementes + v_sementes
  where user_id = v_user_id and planta_id = v_planta_id;
  if not found then
    v_sementes := 0;
  end if;

  insert into public.atividades (user_id, icone, texto, xp_ganho, moedas_delta)
  values (v_user_id, 'Wheat', 'Colheu uma planta no Jardim do Conhecimento', v_xp, v_moedas);

  insert into public.colheitas (user_id, planta_id, terreno_id, xp_ganho, moedas_ganho, sementes_ganho)
  values (v_user_id, v_planta_id, p_terreno_id, v_xp, v_moedas, v_sementes);

  perform public.creditar_xp(v_user_id, v_xp);

  return query select * from public.game_state where user_id = v_user_id;
end;
$$;

-- 4d. Adubo — bônus de tempo da configuração.
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
  v_bonus_adubo int := public.cfg('adubo_bonus_ms');
begin
  if v_user_id is null then
    raise exception 'adubar_terreno: usuário não autenticado.';
  end if;

  -- game_state ANTES de terrenos_jardim, mesma ordem de realizar_colheita:
  -- adubar e colher o mesmo canteiro ao mesmo tempo não pode dar deadlock.
  perform 1 from public.game_state where user_id = v_user_id for update;

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

-- 4e. Plantar — o canteiro N exige o nível cujo `canteiros` alcança N
--     (antes: nível N, porque eram 8 níveis para 8 canteiros).
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
  v_canteiros smallint;
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

  select canteiros into v_canteiros
    from public.catalogo_niveis where xp_min <= v_xp_atual order by nivel desc limit 1;
  if p_terreno_id > coalesce(v_canteiros, 1) then
    raise exception 'plantar_especie: terreno % ainda bloqueado (o nível atual libera % canteiros).', p_terreno_id, v_canteiros;
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


-- -----------------------------------------------------------------------------
-- 5. Missões
-- -----------------------------------------------------------------------------
alter table public.catalogo_plantas_xp
  add column renisus boolean not null default false;
update public.catalogo_plantas_xp set renisus = true where planta_id in ('1','2','3','4','5','6','7');
comment on column public.catalogo_plantas_xp.renisus is
  'Espécie da RENISUS (espelho de is_renisus em PLANTAS_CATALOGO). Usada pela missão das 7 espécies RENISUS.';

create table public.catalogo_missoes (
  missao_id text primary key,
  ordem smallint not null,
  titulo text not null,
  descricao text not null,
  tipo text not null check (tipo in ('especies_estudadas', 'renisus_estudadas', 'colheitas', 'desafios_concluidos', 'maior_ofensiva')),
  meta int not null check (meta > 0),
  moedas int not null check (moedas >= 0)
);

comment on table public.catalogo_missoes is
  'Missões: metas de progresso com recompensa em moedas, resgatada uma vez (resgatar_missao). O progresso é sempre calculado aqui no servidor a partir das tabelas do jogo, nunca informado pelo cliente.';

insert into public.catalogo_missoes (missao_id, ordem, titulo, descricao, tipo, meta, moedas) values
  ('m1', 1, 'Primeiro estudo',        'Conclua o estudo de 1 espécie (ficha + quiz).',      'especies_estudadas',  1,  10),
  ('m2', 2, 'Primeira colheita',      'Colha 1 planta no Jardim do Conhecimento.',          'colheitas',           1,  15),
  ('m3', 3, 'Pequena coleção',        'Conclua o estudo de 3 espécies.',                    'especies_estudadas',  3,  20),
  ('m4', 4, 'Três dias seguidos',     'Alcance 3 dias de ofensiva no Desafio Diário.',      'maior_ofensiva',      3,  30),
  ('m5', 5, 'Horta produtiva',        'Colha 5 plantas.',                                   'colheitas',           5,  25),
  ('m6', 6, 'Desafiante',             'Conclua 5 Desafios Diários.',                        'desafios_concluidos', 5,  30),
  ('m7', 7, 'Guardião da RENISUS',    'Conclua o estudo das 7 espécies da RENISUS.',        'renisus_estudadas',   7,  50),
  ('m8', 8, 'Herbário completo',      'Conclua o estudo das 15 espécies do GERMINA.',       'especies_estudadas', 15, 100);

alter table public.catalogo_missoes enable row level security;
create policy catalogo_missoes_leitura on public.catalogo_missoes for select to authenticated using (true);
revoke all on public.catalogo_missoes from anon, authenticated;
grant select on public.catalogo_missoes to authenticated;

create table public.missoes_resgatadas (
  user_id uuid not null references public.profiles (id) on delete cascade,
  missao_id text not null references public.catalogo_missoes (missao_id),
  moedas int not null,
  resgatada_em timestamptz not null default now(),
  constraint missoes_resgatadas_pkey primary key (user_id, missao_id)
);

alter table public.missoes_resgatadas enable row level security;
create policy missoes_resgatadas_leitura_propria on public.missoes_resgatadas
  for select to authenticated using (user_id = auth.uid());
revoke all on public.missoes_resgatadas from anon, authenticated;
grant select on public.missoes_resgatadas to authenticated;

-- Progresso de um tipo de missão (função interna).
create or replace function public.progresso_missao(p_user_id uuid, p_tipo text)
returns int
language sql
stable
set search_path = public
as $$
  select case p_tipo
    when 'especies_estudadas' then
      (select count(*)::int from public.user_colecao where user_id = p_user_id)
    when 'renisus_estudadas' then
      (select count(*)::int from public.user_colecao u
         join public.catalogo_plantas_xp c on c.planta_id = u.planta_id
        where u.user_id = p_user_id and c.renisus)
    when 'colheitas' then
      (select count(*)::int from public.colheitas where user_id = p_user_id)
    when 'desafios_concluidos' then
      (select count(*)::int from public.desafios_diarios_concluidos where user_id = p_user_id)
    when 'maior_ofensiva' then
      (select maior_streak from public.game_state where user_id = p_user_id)
    else 0
  end;
$$;
revoke all on function public.progresso_missao(uuid, text) from public, anon, authenticated;

-- Lista as missões com o progresso do usuário logado.
create or replace function public.listar_missoes()
returns table (
  missao_id text, ordem smallint, titulo text, descricao text,
  meta int, moedas int, progresso int, resgatada boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'listar_missoes: usuário não autenticado.';
  end if;

  return query
    select m.missao_id, m.ordem, m.titulo, m.descricao, m.meta, m.moedas,
           least(public.progresso_missao(v_user_id, m.tipo), m.meta),
           exists (select 1 from public.missoes_resgatadas r
                    where r.user_id = v_user_id and r.missao_id = m.missao_id)
    from public.catalogo_missoes m
    order by m.ordem;
end;
$$;
revoke all on function public.listar_missoes() from public, anon;
grant execute on function public.listar_missoes() to authenticated;

-- Resgata a recompensa de uma missão concluída. Uma vez por missão.
create or replace function public.resgatar_missao(p_missao_id text)
returns setof public.game_state
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_tipo text;
  v_meta int;
  v_moedas int;
  v_titulo text;
begin
  if v_user_id is null then
    raise exception 'resgatar_missao: usuário não autenticado.';
  end if;

  select tipo, meta, moedas, titulo into v_tipo, v_meta, v_moedas, v_titulo
    from public.catalogo_missoes where missao_id = p_missao_id;
  if not found then
    raise exception 'resgatar_missao: missão % não existe.', p_missao_id;
  end if;

  perform 1 from public.game_state where user_id = v_user_id for update;
  if not found then
    raise exception 'resgatar_missao: game_state não encontrado para o usuário %.', v_user_id;
  end if;

  if public.progresso_missao(v_user_id, v_tipo) < v_meta then
    raise exception 'resgatar_missao: a missão % ainda não foi concluída.', p_missao_id;
  end if;

  insert into public.missoes_resgatadas (user_id, missao_id, moedas)
  values (v_user_id, p_missao_id, v_moedas)
  on conflict (user_id, missao_id) do nothing;

  -- Já resgatada (clique duplo, retry): devolve o estado sem pagar de novo.
  if found then
    update public.game_state set moedas = moedas + v_moedas where user_id = v_user_id;
    insert into public.atividades (user_id, icone, texto, xp_ganho, moedas_delta)
    values (v_user_id, 'Target', 'Concluiu a missão ' || v_titulo, 0, v_moedas);
  end if;

  return query select * from public.game_state where user_id = v_user_id;
end;
$$;
revoke all on function public.resgatar_missao(text) from public, anon;
grant execute on function public.resgatar_missao(text) to authenticated;

commit;
