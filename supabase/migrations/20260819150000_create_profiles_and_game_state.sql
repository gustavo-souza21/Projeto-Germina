-- ============================================================================
-- GERMINA — Migration: profiles + game_state (Kanban C2 + C3)
--
-- Escopo desta migration: exclusivamente as duas tabelas núcleo de identidade
-- e progresso do jogador, e o trigger que as popula no signup. RLS (policies),
-- as demais tabelas do Jardim/Herbário e a substituição dos mocks em
-- lib/queries/ ficam para os próximos lotes (Kanban A3, A5) — não fazem parte
-- deste arquivo.
--
-- PREMISSA ARQUITETURAL INEGOCIÁVEL (Estado Derivado / Single Source of Truth)
-- Nenhuma coluna aqui armazena um valor que o front-end já calcula a partir de
-- outro. Em especial: game_state NÃO tem coluna nivel_atual — o nível é
-- sempre calcularNivel(xp), derivado em runtime pelo cliente a partir do xp
-- persistido. Gravar os dois lados reabriria a classe de bug já corrigida na
-- fase de estabilização do front-end (nível congelado apesar do XP subir).
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. profiles
--
-- Extensão 1:1 de auth.users. Só existe uma linha por usuário autenticado,
-- criada automaticamente pelo trigger no fim deste arquivo — nenhum código de
-- aplicação deve fazer INSERT direto nesta tabela, apenas UPDATE.
-- ----------------------------------------------------------------------------
create table public.profiles (
  -- Mesmo id do Supabase Auth: evita uma segunda chave de usuário circulando
  -- pelo sistema. ON DELETE CASCADE remove o perfil automaticamente quando a
  -- conta é apagada em auth.users (a decisão de hard delete vs. soft delete/
  -- anonimização de conta segue em aberto no Kanban — item G4 — e não altera
  -- este FK: mesmo com anonimização, a exclusão física de auth.users, quando
  -- ocorrer, deve levar o profile junto).
  id uuid primary key references auth.users (id) on delete cascade,

  -- NOT NULL sem DEFAULT de propósito: o único caminho de escrita é o
  -- trigger handle_new_user, que sempre resolve um valor (com fallback para
  -- string vazia) antes do insert. Um NOT NULL sem default torna qualquer
  -- outro caminho de insert acidental (ex.: script manual) explícito sobre a
  -- obrigação de fornecer o nome.
  nome_completo text not null,

  -- Não é coletado no formulário de cadastro atual (só nome/sobrenome/
  -- telefone/e-mail) — fica nulo até o usuário definir um apelido em
  -- Perfil/Configurações. unique permite múltiplos NULL (comportamento padrão
  -- do Postgres), então não bloqueia novos cadastros antes da escolha.
  nickname text unique,

  -- Coletado no cadastro (campo "telefone" do formulário), mas ainda ausente
  -- da interface Profile do cliente — decisão de exposição/edição em UI é o
  -- item G1 do Kanban. A coluna já existe para não perder o dado hoje.
  telefone text,

  idade int,
  endereco text,
  instituicao text,

  -- Espelha o TODO da tela de tutorial ("salvar em profiles.tutorial_concluido").
  tutorial_concluido boolean not null default false,

  criado_em timestamptz not null default now()
);

comment on table public.profiles is
  'Extensão 1:1 de auth.users com os dados de cadastro/perfil do jogador. Populada exclusivamente pelo trigger handle_new_user; aplicação só faz UPDATE.';
comment on column public.profiles.nickname is
  'Definido pelo usuário após o cadastro — ausente no formulário de signup atual, por isso nullable.';
comment on column public.profiles.tutorial_concluido is
  'Substitui o antigo estado local da tela de tutorial. Default false: todo novo cadastro começa sem o tutorial concluído.';

-- RLS habilitado já na criação (fail-safe): sem policy nenhuma, nenhuma role
-- via API consegue ler ou escrever linha alguma até a migration de RLS
-- (Kanban A3) chegar. Deixar RLS desligado entre migrations exporia a tabela
-- inteira via API REST/anon key nesse intervalo.
alter table public.profiles enable row level security;

-- Privilégio concedido agora para que a migration de RLS (A3) só precise
-- adicionar policies — não grants. Sem policy, o grant sozinho não expõe
-- nenhuma linha (RLS acima nega tudo por padrão).
grant select, insert, update, delete on public.profiles to authenticated;


-- ----------------------------------------------------------------------------
-- 2. game_state
--
-- Núcleo da gamificação: 1:1 com profiles. Espelha a interface GameState do
-- cliente campo a campo, com uma única omissão deliberada — nivel_atual.
-- ----------------------------------------------------------------------------
create table public.game_state (
  user_id uuid primary key references public.profiles (id) on delete cascade,

  -- Único dado de experiência. NUNCA truncado/resetado por teto de nível — o
  -- teto (Nível 8 a partir de 5.000 XP) é uma regra de leitura em
  -- calcularNivel(), não uma restrição de escrita. A CHECK abaixo só impede
  -- o caso de erro de sinal (xp negativo), replicando em banco a mesma
  -- salvaguarda que aplicarGanho() já faz no cliente com Math.max(0, ...).
  xp int not null default 0
    constraint game_state_xp_non_negative check (xp >= 0),

  -- Contador cumulativo de dias consecutivos. Não é 100% derivável só de
  -- ultimo_desafio_em (a data diz se a sequência está viva, não quantos dias
  -- já se passaram) — por isso é dado bruto também, gravado sempre junto com
  -- ultimo_desafio_em pela mesma operação (ver registrarConclusao() no
  -- cliente). CHECK espelha a mesma lógica de "nunca regride abaixo de zero"
  -- usada em lerOfensiva()/registrarConclusao().
  streak int not null default 0
    constraint game_state_streak_non_negative check (streak >= 0),

  -- Data local (YYYY-MM-DD) do último Desafio Diário concluído. Nulo =
  -- usuário nunca concluiu um desafio. É a fonte da verdade que
  -- lerOfensiva() usa para decidir, na leitura, se a sequência ainda está
  -- viva, já foi cumprida hoje, ou foi quebrada por falta.
  ultimo_desafio_em date,

  -- Moedas de economia interna. Nenhum caminho do cliente credita/debita sem
  -- passar por aplicarGanho()/debitarRecursos(), que já garantem saldo não
  -- negativo antes de chamar o backend — a CHECK aqui é a mesma garantia,
  -- só que também válida contra um UPDATE feito fora do fluxo normal.
  sementes int not null default 0
    constraint game_state_sementes_non_negative check (sementes >= 0),
  adubo int not null default 0
    constraint game_state_adubo_non_negative check (adubo >= 0),
  moedas int not null default 0
    constraint game_state_moedas_non_negative check (moedas >= 0),

  -- Id do tema equipado. Sem CHECK de enum de propósito: o catálogo de temas
  -- (Padrao, Amazônia Profunda, Floresta Encantada, Rio Negro) é mantido em
  -- código no cliente (lib/loja.ts), não replicado em banco — ver decisão G6
  -- do Kanban. Travar aqui um enum duplicaria essa lista em dois lugares.
  tema_ativo text not null default 'Padrao'
);

comment on table public.game_state is
  'Estado bruto de gamificação do jogador — XP, economia e ofensiva. nivel_atual é deliberadamente OMITIDO: é sempre calcularNivel(xp), calculado no cliente. Nunca adicionar essa coluna.';
comment on column public.game_state.xp is
  'Única fonte de verdade de progressão. nivel_atual = calcularNivel(xp) no cliente — não persistir o nível.';
comment on column public.game_state.streak is
  'Contador bruto de dias consecutivos, gravado sempre junto com ultimo_desafio_em. Validade da sequência (ativa/quebrada) é derivada na leitura por lerOfensiva(), não armazenada.';

alter table public.game_state enable row level security;
grant select, insert, update, delete on public.game_state to authenticated;


-- ----------------------------------------------------------------------------
-- 3. handle_new_user — popula profiles + game_state no signup
--
-- security definer: o insert precisa rodar com privilégio do dono da função
-- (não do role que dispara o signup) para poder gravar em public.profiles e
-- public.game_state a partir de um trigger em auth.users. search_path fixo
-- evita sequestro de função via search_path malicioso — prática recomendada
-- pela própria Supabase para triggers em auth.users.
--
-- Uso de COALESCE em nome_completo/telefone: signups via OAuth (ex.: Google)
-- preenchem raw_user_meta_data com chaves diferentes das do formulário de
-- cadastro por e-mail/senha. Um valor ausente aqui NUNCA pode derrubar a
-- função — se a função lançar exceção, o INSERT em auth.users inteiro falha
-- e o signup quebra para todo mundo. Por isso nome_completo cai em '' em vez
-- de travar o cadastro.
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
      new.raw_user_meta_data ->> 'nome_completo', -- cadastro por e-mail/senha (nome + sobrenome concatenados)
      new.raw_user_meta_data ->> 'full_name',      -- fallback OAuth (Google costuma usar full_name)
      new.raw_user_meta_data ->> 'name',           -- fallback OAuth adicional
      ''
    ),
    new.raw_user_meta_data ->> 'telefone'
  );

  -- Linha de game_state criada no mesmo trigger, com todos os defaults de
  -- coluna (xp 0, streak 0, sementes/adubo/moedas 0, tema_ativo 'Padrao') —
  -- não há valores de onboarding especiais a definir aqui hoje.
  insert into public.game_state (user_id)
  values (new.id);

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Popula profiles e game_state automaticamente a cada novo usuário em auth.users. Nunca deve lançar exceção — um erro aqui bloqueia o signup inteiro.';

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
