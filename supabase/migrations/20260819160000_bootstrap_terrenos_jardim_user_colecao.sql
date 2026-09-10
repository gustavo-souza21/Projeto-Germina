-- ============================================================================
-- GERMINA — Migration: bootstrap + terrenos_jardim + user_colecao
--                       (Kanban G4 + C1 + C4 + C5)
--
-- Escopo deste lote: extensão de UUID e README de convenções (C1), a tabela
-- do Jardim (C4) e a tabela do Herbário (C5), já com a decisão de exclusão de
-- conta (G4) aplicada às FKs novas. RLS *policies*, `comunidade_posts` /
-- `itens_troca` e a substituição dos mocks em lib/queries/ continuam fora
-- deste arquivo — entram nos lotes A1–A8.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ============================================================================
-- README — convenções e ordem de dependência (GERMINA / supabase/migrations)
--
-- NOMENCLATURA
--   • snake_case em tudo: tabelas, colunas, constraints, funções e triggers.
--   • Sem abreviações não óbvias — reflete o vocabulário do domínio já usado
--     no front-end (planta_id, xp, ultimo_desafio_em), não uma tradução à
--     parte.
--   • Tipo de chave por natureza do dado, não por hábito:
--       - uuid   → entidades globais com identidade própria (profiles.id,
--                  e as futuras atividades.id, comunidade_posts.id, etc.).
--       - smallint → índice de um domínio pequeno e fixo (terrenos_jardim.id,
--                  sempre 1–8 — um por nível da trilha de evolução).
--       - text   → chave que replica um id de catálogo mantido em CÓDIGO, não
--                  em tabela (planta_id, e futuramente desafio_id). Nunca
--                  uuid nesses casos: forçaria o catálogo estático do
--                  cliente a sincronizar identificadores com o banco.
--   • Geração de UUID: esta migration habilita a extensão uuid-ossp. Todo
--     PK uuid autogerado nas próximas migrations usa uuid_generate_v4() como
--     padrão — mantém uma única fonte de geração de id no projeto em vez de
--     misturar com gen_random_uuid() (pgcrypto) tabela a tabela.
--
-- EXCLUSÃO DE CONTA (G4 — decidido: hard delete)
--   Toda FK que aponta para profiles(id) ou auth.users(id), neste lote e nos
--   seguintes, usa ON DELETE CASCADE. Excluir o usuário apaga a conta e todo
--   dado próprio dele em cascata — não há soft delete/anonimização.
--
-- RLS
--   Toda tabela nova nasce com RLS habilitado e grants para authenticated,
--   sem nenhuma policy — mesmo padrão de profiles/game_state (C2/C3). Isso
--   mantém a tabela inacessível via API entre a migration que a cria e a
--   migration de policies (A3/A4), em vez de expor os dados nesse intervalo.
--   Escrever policy é regra de acesso, não estrutura — por isso fica
--   deliberadamente fora deste lote.
--
-- ORDEM DE DEPENDÊNCIA ATUAL
--   auth.users
--     └── profiles                 (C2 — já aplicada)
--           ├── game_state         (C3 — já aplicada)
--           ├── terrenos_jardim    (C4 — este arquivo)
--           └── user_colecao       (C5 — este arquivo)
--
--   game_state, terrenos_jardim e user_colecao são todas filhas DIRETAS de
--   profiles — não formam uma cadeia entre si (terrenos_jardim não depende
--   de game_state). A ordem de aplicação dos arquivos segue a ordem dos
--   cards do Kanban (C2 → C3 → C4 → C5) por organização do trabalho, não
--   porque uma exija a outra.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- C4 — terrenos_jardim
--
-- Armazenamento ESPARSO: só existe linha para um canteiro que já foi
-- plantado ao menos uma vez. Os 8 níveis da trilha não são semeados no
-- signup — a leitura (lib/queries/jardim.ts) reconcilia as linhas existentes
-- com os 8 ids fixos (1–8) e preenche como "vazio" o que não tiver linha
-- aqui, exatamente como getTerrenos() já faz hoje com o mock SEMEADO_HA.
--
-- PROIBIDO por design (Estado Derivado): nenhuma coluna fase e nenhuma
-- coluna nivel_necessario.
--   • fase              → calcularProgresso(terreno, agora), sempre em runtime.
--   • nivel_necessario  → é sempre igual ao próprio id (1 nível = 1 canteiro,
--                         invariante do sistema) — persistir seria duplicar
--                         o id numa segunda coluna que só pode concordar ou
--                         discordar dele.
-- ----------------------------------------------------------------------------
create table public.terrenos_jardim (
  user_id uuid not null
    references public.profiles (id) on delete cascade,

  -- Mesmo número do nível que libera o canteiro (1–8). Não é serial nem
  -- uuid: é escolhido pelo cliente ao plantar, dentro do intervalo fixo da
  -- trilha de evolução — a CHECK abaixo é a única validação de domínio que
  -- o banco precisa fazer.
  id smallint not null
    constraint terrenos_jardim_id_range check (id between 1 and 8),

  -- Sem FK para um catálogo de plantas: PLANTAS_CATALOGO vive em código
  -- (data/plantasData.ts), não em tabela — decisão registrada no Relatório
  -- de Mapeamento (G6) e ainda não revista. Presença = canteiro ocupado.
  planta_id text,

  -- timestamptz no banco (era epoch ms no cliente) — calcularProgresso()
  -- continua idêntica, só troca a origem do número. Nulo = canteiro vazio.
  plantado_em timestamptz,

  bonus_adubo_ms int not null default 0
    constraint terrenos_jardim_bonus_non_negative check (bonus_adubo_ms >= 0),

  adubado boolean not null default false,

  constraint terrenos_jardim_pkey primary key (user_id, id),

  -- Guarda de coerência: "ocupado" é planta_id + plantado_em juntos, nunca
  -- um sem o outro. derivarEstadoCanteiro() já assume essa dupla no
  -- cliente (`!terreno.planta_id || terreno.plantado_em === undefined` ⇒
  -- vazio) — esta CHECK torna a mesma regra impossível de violar por um
  -- UPDATE parcial vindo de qualquer outro caminho que não seja plantar/
  -- colher.
  constraint terrenos_jardim_ocupacao_coerente
    check ((planta_id is null) = (plantado_em is null))
);

comment on table public.terrenos_jardim is
  'Canteiros do Jardim, armazenamento esparso (só linhas plantadas). fase e nivel_necessario são deliberadamente OMITIDOS: calcularProgresso() e o próprio id os derivam no cliente.';
comment on column public.terrenos_jardim.id is
  'Nível da trilha que libera o canteiro (1–8) — também cumpre o papel de nivel_necessario, que por isso não existe como coluna própria.';
comment on column public.terrenos_jardim.plantado_em is
  'Único dado de tempo do cultivo. fase = calcularProgresso(terreno, agora) no cliente — nunca persistir a fase.';

alter table public.terrenos_jardim enable row level security;
grant select, insert, update, delete on public.terrenos_jardim to authenticated;


-- ----------------------------------------------------------------------------
-- C5 — user_colecao (Herbário)
--
-- Registra quais espécies o usuário já "estudou" (FichaBotanicaClient →
-- insert). status_crescimento é gravado como está hoje no mock: nenhuma
-- função pura do cliente deriva esse campo a partir de outro dado — ao
-- contrário de terrenos_jardim, aqui não há um plantado_em equivalente.
-- Fica registrado como dado bruto porque, com o código atual, é isso que
-- ele é; a origem dessa segunda "fase de crescimento" paralela à do Jardim
-- é a pergunta em aberto G2, fora do escopo deste lote.
-- ----------------------------------------------------------------------------
create table public.user_colecao (
  user_id uuid not null
    references public.profiles (id) on delete cascade,

  -- Sem FK para o catálogo de plantas, mesmo motivo de terrenos_jardim.planta_id.
  planta_id text not null,

  -- CHECK em vez de tipo ENUM nativo do Postgres: alterar a lista de fases
  -- é um ALTER TABLE ... DROP/ADD CONSTRAINT simples; um enum exigiria
  -- ALTER TYPE, mais rígido e mais caro para evoluir junto com o app ainda
  -- em fase de estabilização de produto.
  status_crescimento text not null default 'semente'
    constraint user_colecao_status_valido
      check (status_crescimento in ('semente', 'broto', 'muda', 'flores', 'colhida')),

  desbloqueada_em timestamptz not null default now(),

  constraint user_colecao_pkey primary key (user_id, planta_id)
);

comment on table public.user_colecao is
  'Herbário do usuário — espécies já estudadas. status_crescimento é dado bruto: nenhuma função do cliente o deriva hoje (ver item em aberto G2 do Kanban).';
comment on column public.user_colecao.desbloqueada_em is
  'Momento do insert (primeira vez que o usuário estuda a espécie) — nunca atualizado depois.';

alter table public.user_colecao enable row level security;
grant select, insert, update, delete on public.user_colecao to authenticated;
