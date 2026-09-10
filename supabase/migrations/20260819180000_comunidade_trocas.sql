-- ============================================================================
-- GERMINA — Migration: comunidade (mural + trocas)  (Kanban A1 + A2)
--
-- Primeiro lote do bloco 🟡 Atenção. Convenções (nomenclatura, uuid_generate_v4(),
-- hard delete/G4, RLS habilitado sem policy) seguem as migrations anteriores.
--
-- auth.users
--   └── profiles
--         ├── (game_state, terrenos_jardim, user_colecao,
--         │    atividades, desafios_diarios_concluidos, preferencias — 🔴)
--         ├── comunidade_posts                 (A1 — este arquivo)
--         │     ├── post_curtidas               (A1)
--         │     └── respostas_post               (A1)
--         └── itens_troca                       (A2 — este arquivo)
--               └── trocas_propostas             (A2)
--
-- G6 aplicada: itens_troca troca item_nome (texto livre) por planta_id,
-- referenciando o mesmo catálogo estático (PLANTAS_CATALOGO) já usado em
-- terrenos_jardim e user_colecao — sem FK de banco, pelo motivo já
-- documentado nessas duas tabelas: o catálogo vive em código, não em tabela.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- A1.1 — comunidade_posts
--
-- Desnormalização proibida: SEM autor_nome, autor_nivel ou autor_instituicao.
-- Só user_id. Tudo o que hoje é campo no tipo PostComunidade do cliente e não
-- vira coluna aqui é resolvido por JOIN/COUNT no momento da leitura:
--   • autor_nome / autor_instituicao → join com profiles
--   • autor_nivel                    → calcularNivel(game_state.xp do autor)
--     — se fosse gravado, o post exibiria para sempre o nível que o autor
--     tinha ao publicar, mesmo depois de ele evoluir (mesma classe de bug do
--     nível congelado, QA-02, só que numa tabela de comunidade).
--   • curtidas                       → count(post_curtidas) do post
--   • curtido_pelo_usuario           → existe linha em post_curtidas para
--     (post_id, usuário autenticado da sessão)?
--   • respostas_count                → count(respostas_post) do post
-- ----------------------------------------------------------------------------
create table public.comunidade_posts (
  id uuid primary key default uuid_generate_v4(),

  user_id uuid not null
    references public.profiles (id) on delete cascade,

  conteudo text not null,
  tag text not null,

  -- URL no Supabase Storage. Nullable: nem todo post tem imagem.
  imagem text,

  criado_em timestamptz not null default now()
);

comment on table public.comunidade_posts is
  'Post do mural da comunidade. Guarda só user_id — autor_nome/autor_nivel/autor_instituicao são resolvidos por JOIN na leitura, nunca persistidos (autor_nivel persistido ficaria desatualizado assim que o autor subisse de nível).';

alter table public.comunidade_posts enable row level security;
grant select, insert, update, delete on public.comunidade_posts to authenticated;


-- ----------------------------------------------------------------------------
-- A1.2 — post_curtidas
--
-- PK composta (post_id, user_id) é a própria regra de negócio "um usuário
-- curte um post no máximo uma vez" — nenhum código de aplicação precisa
-- checar isso antes de inserir; um segundo INSERT é rejeitado pela chave.
-- ----------------------------------------------------------------------------
create table public.post_curtidas (
  post_id uuid not null
    references public.comunidade_posts (id) on delete cascade,

  user_id uuid not null
    references public.profiles (id) on delete cascade,

  criado_em timestamptz not null default now(),

  constraint post_curtidas_pkey primary key (post_id, user_id)
);

comment on table public.post_curtidas is
  'Fonte da verdade de curtidas. comunidade_posts.curtidas e curtido_pelo_usuario, do tipo PostComunidade no cliente, são sempre count()/exists() sobre esta tabela — nunca colunas.';

alter table public.post_curtidas enable row level security;
grant select, insert, update, delete on public.post_curtidas to authenticated;


-- ----------------------------------------------------------------------------
-- A1.3 — respostas_post
--
-- Mesma regra de desnormalização de comunidade_posts: só user_id, autor_nome/
-- autor_nivel resolvidos por JOIN.
-- ----------------------------------------------------------------------------
create table public.respostas_post (
  id uuid primary key default uuid_generate_v4(),

  post_id uuid not null
    references public.comunidade_posts (id) on delete cascade,

  user_id uuid not null
    references public.profiles (id) on delete cascade,

  conteudo text not null,
  criado_em timestamptz not null default now()
);

comment on table public.respostas_post is
  'Respostas a um post. Guarda só user_id — autor_nome/autor_nivel via JOIN, nunca persistidos.';

alter table public.respostas_post enable row level security;
grant select, insert, update, delete on public.respostas_post to authenticated;


-- ----------------------------------------------------------------------------
-- A2.1 — itens_troca  (G6 aplicada)
--
-- item_nome (texto livre) → planta_id (referencia o mesmo catálogo estático
-- de terrenos_jardim/user_colecao). quantidade_disponivel (texto livre, ex.:
-- "3 disponíveis"/"Muda única") → int (ex.: 3 / 1).
--
-- is_renisus DELIBERADAMENTE OMITIDA: antes era um boolean digitado à mão,
-- podendo divergir da ficha real da planta — o mesmo formato de bug do QA-03
-- (loja anunciando uma quantidade e creditando outra). Com planta_id como
-- chave, is_renisus vira PLANTAS_CATALOGO.find(p => p.id === planta_id).is_renisus,
-- resolvido em código no momento da leitura — não há mais como anunciar uma
-- coisa e a ficha dizer outra.
-- ----------------------------------------------------------------------------
create table public.itens_troca (
  id uuid primary key default uuid_generate_v4(),

  user_id uuid not null
    references public.profiles (id) on delete cascade,

  -- Sem FK: catálogo em código, mesmo padrão de terrenos_jardim.planta_id.
  planta_id text not null,

  quantidade_disponivel int not null
    constraint itens_troca_quantidade_positiva check (quantidade_disponivel > 0),

  procura text not null,

  -- Permite encerrar o anúncio sem apagar o histórico de propostas já
  -- recebidas em trocas_propostas.
  ativo boolean not null default true,

  criado_em timestamptz not null default now()
);

comment on table public.itens_troca is
  'Anúncio de troca. planta_id substitui o antigo item_nome livre (G6) — is_renisus e o texto de exibição são derivados do catálogo em código a partir de planta_id, nunca persistidos.';

alter table public.itens_troca enable row level security;
grant select, insert, update, delete on public.itens_troca to authenticated;


-- ----------------------------------------------------------------------------
-- A2.2 — trocas_propostas
-- ----------------------------------------------------------------------------
create table public.trocas_propostas (
  id uuid primary key default uuid_generate_v4(),

  item_troca_id uuid not null
    references public.itens_troca (id) on delete cascade,

  proponente_user_id uuid not null
    references public.profiles (id) on delete cascade,

  oferta_texto text not null,
  mensagem text,

  status text not null default 'pendente'
    constraint trocas_propostas_status_valido
      check (status in ('pendente', 'aceita', 'recusada')),

  criado_em timestamptz not null default now()
);

comment on table public.trocas_propostas is
  'Proposta de troca recebida por um item_troca. status controla o ciclo de vida da proposta (não do anúncio — esse é itens_troca.ativo).';

alter table public.trocas_propostas enable row level security;
grant select, insert, update, delete on public.trocas_propostas to authenticated;
