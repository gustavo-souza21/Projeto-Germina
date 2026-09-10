-- ============================================================================
-- GERMINA — Migration: atividades + desafios_diarios_concluidos + preferencias
--                       (Kanban C6 + C7-A + C7-B)
--
-- Fecha o bloco 🔴 Críticas do Kanban: com este arquivo, todas as tabelas
-- filhas diretas de profiles previstas no Relatório de Mapeamento existem
-- (game_state, terrenos_jardim, user_colecao, atividades,
-- desafios_diarios_concluidos, preferencias). Convenções de nomenclatura,
-- geração de UUID e a política de hard delete (G4) seguem as mesmas
-- documentadas no README da migration anterior — não repetidas aqui.
--
-- auth.users
--   └── profiles
--         ├── game_state
--         ├── terrenos_jardim
--         ├── user_colecao
--         ├── atividades                    (C6 — este arquivo)
--         ├── desafios_diarios_concluidos    (C7-A — este arquivo)
--         └── preferencias                   (C7-B — este arquivo)
-- ============================================================================


-- ----------------------------------------------------------------------------
-- C6 — atividades
--
-- Log append-only do feed de atividade (Dashboard e Perfil → AtividadeTab).
-- Nenhuma linha é alterada depois de criada — só INSERT e SELECT. O índice
-- em (user_id, criado_em desc) atende exatamente o padrão de leitura do
-- feed: "as N atividades mais recentes de um usuário".
-- ----------------------------------------------------------------------------
create table public.atividades (
  id uuid primary key default uuid_generate_v4(),

  user_id uuid not null
    references public.profiles (id) on delete cascade,

  icone text not null,
  texto text not null,

  -- Default 0, não obrigatório: nem toda atividade futura precisa carregar
  -- XP (ex.: um log de "comprou item na loja" é plausível e não gera XP).
  xp_ganho int not null default 0
    constraint atividades_xp_non_negative check (xp_ganho >= 0),

  criado_em timestamptz not null default now()
);

comment on table public.atividades is
  'Log append-only do feed de atividade. Nenhum UPDATE é esperado — apenas INSERT (escrita) e SELECT (leitura do feed).';

create index atividades_user_id_criado_em_idx
  on public.atividades (user_id, criado_em desc);

alter table public.atividades enable row level security;
grant select, insert, update, delete on public.atividades to authenticated;


-- ----------------------------------------------------------------------------
-- C7-A — desafios_diarios_concluidos
--
-- PROIBIDO por design (Estado Derivado): nenhuma coluna boolean concluido.
-- A própria EXISTÊNCIA da linha (user_id, desafio_id, data = hoje) É o
-- "concluído" — não há dado a mais para guardar. A PK composta garante de
-- graça a regra de negócio "um desafio só conta uma vez por dia": um
-- segundo INSERT para a mesma combinação é rejeitado pela chave, não por
-- lógica de aplicação.
--
-- Efeito colateral útil: esta tabela também serve de auditoria para
-- game_state.streak/ultimo_desafio_em — se a contagem de dias consecutivos
-- aqui divergir do streak gravado, é sinal de bug de escrita, não
-- ambiguidade de modelo (Opção B discutida no Relatório de Mapeamento).
-- ----------------------------------------------------------------------------
create table public.desafios_diarios_concluidos (
  user_id uuid not null
    references public.profiles (id) on delete cascade,

  -- Sem FK: o catálogo de desafios (DESAFIOS_INICIAIS, ids d0–d3) vive em
  -- código, mesmo padrão já usado para planta_id em terrenos_jardim/user_colecao.
  desafio_id text not null,

  -- Dia local (YYYY-MM-DD) de conclusão — mesma convenção de diaLocal() no
  -- cliente. Não confundir com concluido_em: esta coluna é a chave de
  -- negócio (calendário), a outra é o timestamp exato do evento.
  data date not null,

  -- Snapshot do que foi efetivamente pago nesta conclusão. O catálogo de
  -- desafios pode mudar a recompensa no futuro sem que isto reescreva o
  -- histórico já gravado.
  xp_ganho int not null default 0
    constraint desafios_concluidos_xp_non_negative check (xp_ganho >= 0),
  moedas_ganho int not null default 0
    constraint desafios_concluidos_moedas_non_negative check (moedas_ganho >= 0),

  concluido_em timestamptz not null default now(),

  constraint desafios_diarios_concluidos_pkey primary key (user_id, desafio_id, data)
);

comment on table public.desafios_diarios_concluidos is
  'Log de conclusões do Desafio Diário. Não existe coluna concluido: a existência da linha (user_id, desafio_id, data) é o próprio estado. A PK composta impede reconclusão no mesmo dia sem lógica de aplicação.';

alter table public.desafios_diarios_concluidos enable row level security;
grant select, insert, update, delete on public.desafios_diarios_concluidos to authenticated;


-- ----------------------------------------------------------------------------
-- C7-B — preferencias
--
-- 1:1 com profiles. Todas as colunas são escolhas explícitas do usuário —
-- não há nada a derivar aqui, é a tabela mais simples do núcleo.
-- ----------------------------------------------------------------------------
create table public.preferencias (
  user_id uuid primary key
    references public.profiles (id) on delete cascade,

  lembrete_desafio_diario boolean not null default true,
  alertas_mural boolean not null default true,
  solicitacoes_troca boolean not null default false,
  herbario_publico boolean not null default true,
  disponivel_para_trocas boolean not null default false,

  -- CHECK em vez de enum nativo, mesmo raciocínio de user_colecao.status_crescimento:
  -- mais barato de evoluir enquanto o produto ainda está definindo o catálogo
  -- final de unidades.
  unidades text not null default 'metrico'
    constraint preferencias_unidades_validas check (unidades in ('metrico', 'imperial'))
);

comment on table public.preferencias is
  'Preferências de notificação/privacidade do usuário, 1:1 com profiles. Sem nenhum campo derivado — todas as colunas são escolha direta do usuário.';

alter table public.preferencias enable row level security;
grant select, insert, update, delete on public.preferencias to authenticated;


-- ----------------------------------------------------------------------------
-- handle_new_user — estendida para também criar a linha de preferências
--
-- CREATE OR REPLACE preserva o oid da função: o trigger on_auth_user_created,
-- criado na migration de C2/C3, passa a executar este novo corpo
-- automaticamente, sem precisar recriar o trigger. Mantém válido o princípio
-- já documentado no README anterior — um único ponto de entrada popula todas
-- as linhas iniciais de um novo usuário (profiles, game_state, preferencias),
-- em vez de um trigger por tabela competindo em auth.users.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome_completo, telefone)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'nome_completo',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    ),
    new.raw_user_meta_data ->> 'telefone'
  );

  insert into public.game_state (user_id)
  values (new.id);

  -- C7-B: linha de preferências com todos os defaults de coluna — nenhum
  -- valor de onboarding especial a definir hoje.
  insert into public.preferencias (user_id)
  values (new.id);

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Popula profiles, game_state e preferencias automaticamente a cada novo usuário em auth.users. Nunca deve lançar exceção — um erro aqui bloqueia o signup inteiro.';
