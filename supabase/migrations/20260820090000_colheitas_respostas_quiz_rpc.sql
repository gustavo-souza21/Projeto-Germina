-- ============================================================================
-- GERMINA — Migration 7: colheitas + respostas_quiz + RPC realizar_colheita
--                        (Kanban G3 + dívida técnica de concorrência)
--
-- Liquida G3: as duas tabelas de log que faltavam para computar progresso
-- real das conquistas "Guardião da Horta" (colheitas) e "Curador Atento"
-- (respostas_quiz), em vez do placeholder zerado documentado no Guia A5–A8.
-- respostas_quiz também serve, de graça, como o dado bruto que o Relatório
-- de Engenharia do front-end apontava como pendente para a validação
-- científica das 60 perguntas pelo Comitê Ad Hoc.
--
-- Convenções: hard delete (G4), RLS habilitado, uuid_generate_v4() — mesmas
-- das migrations anteriores. As duas tabelas seguem o padrão append-only já
-- aplicado a atividades/desafios_diarios_concluidos: só SELECT e INSERT para
-- o próprio usuário, bloqueado por policy E por REVOKE — não uma coisa só.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. colheitas — suporte à conquista "Guardião da Horta"
--
-- terrenos_jardim não guarda histórico: colher LIMPA a linha de volta para
-- vazia (é assim que o armazenamento esparso funciona). Sem esta tabela,
-- "quantas vezes o usuário já colheu" seria informação perdida no instante
-- seguinte à colheita — daí o log próprio, nunca reconstruível a posteriori.
-- ----------------------------------------------------------------------------
create table public.colheitas (
  id uuid primary key default uuid_generate_v4(),

  user_id uuid not null
    references public.profiles (id) on delete cascade,

  -- Sem FK: catálogo em código, mesmo padrão de terrenos_jardim.planta_id.
  planta_id text not null,

  -- Qual dos 8 canteiros foi colhido. Sem FK composta para terrenos_jardim
  -- de propósito: o log deve sobreviver como está mesmo que o conteúdo
  -- daquele canteiro mude depois — é fotografia do evento, não referência
  -- ao estado atual.
  terreno_id smallint not null
    constraint colheitas_terreno_id_range check (terreno_id between 1 and 8),

  xp_ganho int not null default 0
    constraint colheitas_xp_non_negative check (xp_ganho >= 0),
  moedas_ganho int not null default 0
    constraint colheitas_moedas_non_negative check (moedas_ganho >= 0),
  sementes_ganho int not null default 0
    constraint colheitas_sementes_non_negative check (sementes_ganho >= 0),

  colhido_em timestamptz not null default now()
);

comment on table public.colheitas is
  'Log append-only de colheitas — única fonte de "quantas vezes o usuário colheu", já que terrenos_jardim é limpo a cada colheita. Base de cálculo da conquista Guardião da Horta.';

alter table public.colheitas enable row level security;

create policy colheitas_leitura_propria
  on public.colheitas
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy colheitas_insercao_propria
  on public.colheitas
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Sem policy de UPDATE/DELETE = negado por padrão. GRANT abaixo já nasce
-- estreito (nunca concede update/delete), e o REVOKE explícito documenta a
-- intenção e blinda contra uma GRANT futura mais larga feita por engano.
grant select, insert on public.colheitas to authenticated;
revoke update, delete on public.colheitas from authenticated;


-- ----------------------------------------------------------------------------
-- 2. respostas_quiz — suporte à conquista "Curador Atento"
-- ----------------------------------------------------------------------------
create table public.respostas_quiz (
  id uuid primary key default uuid_generate_v4(),

  user_id uuid not null
    references public.profiles (id) on delete cascade,

  planta_id text not null,

  -- Mesmos 5 valores de EixoTematico (lib/types.ts). Diferente de
  -- planta_id/desafio_id, este domínio não é um catálogo extenso e mutável
  -- de conteúdo — é a taxonomia fixa do quiz em si, por isso ganha CHECK
  -- (mesmo raciocínio de trocas_propostas.status).
  eixo text not null
    constraint respostas_quiz_eixo_valido
      check (eixo in (
        'Indicação Terapêutica',
        'Preparo Tradicional',
        'Segurança e Contraindicação',
        'Identificação Botânica',
        'Curiosidade ODS'
      )),

  correta boolean not null,
  respondido_em timestamptz not null default now()
);

comment on table public.respostas_quiz is
  'Log append-only de respostas do Desafio Diário, por eixo temático. Base de cálculo da conquista Curador Atento (5 acertos em Segurança e Contraindicação) e dataset para a validação científica das perguntas pelo Comitê Ad Hoc.';

alter table public.respostas_quiz enable row level security;

create policy respostas_quiz_leitura_propria
  on public.respostas_quiz
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy respostas_quiz_insercao_propria
  on public.respostas_quiz
  for insert
  to authenticated
  with check (auth.uid() = user_id);

grant select, insert on public.respostas_quiz to authenticated;
revoke update, delete on public.respostas_quiz from authenticated;


-- ----------------------------------------------------------------------------
-- 3. RPC realizar_colheita — transação atômica
--
-- SECURITY INVOKER (não DEFINER): a função roda com o privilégio de quem a
-- chama, não do dono. Isso significa que ela só consegue fazer exatamente o
-- que o usuário autenticado já poderia fazer chamando as 4 tabelas
-- diretamente — nenhum privilégio é elevado, então não há necessidade de
-- hardening extra de search_path por escalonamento (a única razão de
-- SECURITY DEFINER existir em handle_new_user() é escrever em profiles antes
-- de qualquer policy entrar em vigor no signup; aqui todas as policies já
-- autorizam o próprio dono, então INVOKER é estritamente mais seguro).
--
-- ATOMICIDADE: é a função inteira que constitui a transação — não há BEGIN/
-- COMMIT explícito porque uma function PL/pgSQL já roda como um bloco único.
-- Se qualquer uma das 4 operações lançar exceção (inclusive uma violação de
-- CHECK nas tabelas envolvidas, como xp_ganho negativo), TODAS as anteriores
-- dentro desta chamada são desfeitas — não existe estado onde o terreno foi
-- limpo mas o XP não foi creditado, ou vice-versa, mesmo que a conexão do
-- cliente caia no meio da chamada.
-- ----------------------------------------------------------------------------
create or replace function public.realizar_colheita(
  p_user_id uuid,
  p_terreno_id smallint,
  p_planta_id text,
  p_xp int,
  p_moedas int,
  p_sementes int,
  p_texto_atividade text,
  p_icone_atividade text
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  -- Falha alto e claro em vez de silenciosa: com SECURITY INVOKER, um
  -- p_user_id diferente de auth.uid() já seria barrado pelas policies das 4
  -- tabelas (UPDATE bate 0 linhas, INSERT levanta erro de RLS) — mas essa
  -- combinação de sintomas é confusa de depurar. Esta checagem entrega uma
  -- mensagem inequívoca no primeiro passo.
  if p_user_id is distinct from auth.uid() then
    raise exception 'realizar_colheita: p_user_id não corresponde ao usuário autenticado.';
  end if;

  -- 1. Limpar o terreno correspondente
  update public.terrenos_jardim
  set planta_id = null,
      plantado_em = null,
      adubado = false,
      bonus_adubo_ms = 0
  where user_id = p_user_id
    and id = p_terreno_id;

  if not found then
    raise exception 'realizar_colheita: terreno % não encontrado para o usuário %.', p_terreno_id, p_user_id;
  end if;

  -- 2. Creditar XP, moedas e sementes em game_state
  update public.game_state
  set xp = xp + p_xp,
      moedas = moedas + p_moedas,
      sementes = sementes + p_sementes
  where user_id = p_user_id;

  if not found then
    raise exception 'realizar_colheita: game_state não encontrado para o usuário %.', p_user_id;
  end if;

  -- 3. Registrar no feed de atividade
  insert into public.atividades (user_id, icone, texto, xp_ganho)
  values (p_user_id, p_icone_atividade, p_texto_atividade, p_xp);

  -- 4. Registrar a colheita (base da conquista Guardião da Horta)
  insert into public.colheitas (user_id, planta_id, terreno_id, xp_ganho, moedas_ganho, sementes_ganho)
  values (p_user_id, p_planta_id, p_terreno_id, p_xp, p_moedas, p_sementes);
end;
$$;

comment on function public.realizar_colheita is
  'Colheita atômica: limpa o terreno, credita game_state, loga em atividades e em colheitas — as 4 operações confirmam juntas ou nenhuma confirma. p_xp/p_moedas/p_sementes e a prontidão do terreno são confiados ao chamador nesta versão (não revalidados aqui); ver nota de acompanhamento.';

grant execute on function public.realizar_colheita(uuid, smallint, text, int, int, int, text, text) to authenticated;
