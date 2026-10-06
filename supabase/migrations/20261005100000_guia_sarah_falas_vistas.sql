-- ============================================================================
-- GERMINA — Migration 12: o que a Sarah já disse para cada curador
--
-- Guarda quais falas do guia cada usuário já viu, para ela não repetir a
-- apresentação do Jardim toda vez que alguém abre o Jardim.
--
-- POR QUE NÃO É localStorage
--
-- Seria mais simples, e seria repetir um erro que este projeto já cometeu e
-- documentou: o tutorial usava `localStorage.getItem('germina_tutorial_visto')`
-- e isso significava que (a) quem trocava de aparelho via o tutorial de novo
-- e (b) quem limpava os dados do navegador via o tutorial para sempre. A
-- fonte de verdade virou `profiles.tutorial_concluido` justamente por isso.
-- Falas do guia são da mesma natureza: acompanham a PESSOA, não o navegador.
--
-- (O visitante sem conta é a exceção necessária — não há onde gravar no banco
-- para quem não tem linha em `profiles`. Para ele o app usa `sessionStorage`,
-- que dura o tempo da aba. É honesto: visitante não tem progresso a preservar.)
--
-- POR QUE ESTA TABELA **NÃO** SEGUE O PADRÃO DE RPC DA FASE 1
--
-- As Migrations 8 e 10 moveram toda escrita de economia para funções
-- `security definer` e revogaram o INSERT direto do cliente. Aqui é
-- deliberadamente diferente, e vale dizer por quê para ninguém "corrigir"
-- isto depois achando que foi esquecimento:
--
-- marcar uma fala como vista NÃO CONCEDE NADA. Não há XP, moeda, semente nem
-- qualquer vantagem atrelada. O pior que um usuário mal-intencionado
-- consegue fazer escrevendo direto nesta tabela é deixar de ver uma dica, ou
-- apagar linhas para ver a dica de novo — que é, aliás, exatamente o que o
-- botão "rever as dicas da Sarah" vai fazer. Blindar isso com RPC seria
-- cerimônia sem risco do outro lado.
--
-- O que o RLS garante, esse sim, é o isolamento: ninguém lê nem escreve a
-- linha de outra pessoa.
-- ============================================================================

create table public.guia_falas_vistas (
  user_id uuid not null references public.profiles (id) on delete cascade,

  -- Casa com `FalaGuia.id` em data/guiaSarah.ts. Texto livre de propósito:
  -- o roteiro vive no código (é conteúdo editorial, revisado por humanos),
  -- e uma FK para uma tabela de falas obrigaria a duplicar o roteiro aqui e
  -- manter os dois lados em sincronia — o débito que a Migration 8 já aceitou
  -- com os catálogos de jogo e que não vale a pena repetir onde não há valor
  -- a validar.
  fala_id text not null,

  visto_em timestamptz not null default now(),

  primary key (user_id, fala_id)
);

comment on table public.guia_falas_vistas is
  'Falas do guia (Sarah) que cada usuário já viu — evita repetir a mesma apresentação. Sem valor de jogo: escrita direta do cliente é intencional, ver cabeçalho da migration.';

alter table public.guia_falas_vistas enable row level security;

create policy guia_falas_vistas_leitura_propria
  on public.guia_falas_vistas
  for select to authenticated
  using (auth.uid() = user_id);

create policy guia_falas_vistas_insercao_propria
  on public.guia_falas_vistas
  for insert to authenticated
  with check (auth.uid() = user_id);

-- DELETE existe para o "rever as dicas da Sarah" das Configurações: a pessoa
-- apaga as próprias linhas e o guia recomeça. Sem UPDATE: uma fala vista não
-- vira outra fala vista; o que se faz é apagar e ver de novo.
create policy guia_falas_vistas_exclusao_propria
  on public.guia_falas_vistas
  for delete to authenticated
  using (auth.uid() = user_id);

grant select, insert, delete on public.guia_falas_vistas to authenticated;
