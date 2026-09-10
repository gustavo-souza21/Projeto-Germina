-- ============================================================================
-- GERMINA — Migration 9: `perfis_publicos` — a identidade pública mínima de um
--                        autor (nome + XP), e nada além disso.
--
-- POR QUE ESTA MIGRATION EXISTE
--
-- Ela nasceu de um bug encontrado ENQUANTO se aplicava a Fase 2 da correção de
-- autenticação/autorização (tirar `instituicao` da exibição pública) — não
-- estava mapeado no relatório de auditoria, e foi reproduzido num Postgres 16
-- local antes de ser corrigido aqui:
--
--   • `profiles` só tem a policy `profiles_leitura_propria`
--     (`for select ... using (auth.uid() = id)`, Migration 6) e `game_state`
--     só tem `game_state_isolamento_total` (`for all ... auth.uid() =
--     user_id`, Migration 5). Ou seja: um usuário autenticado enxerga
--     exatamente UMA linha de cada uma dessas tabelas — a dele.
--   • Mas `lib/queries/comunidade.ts` monta o Mural com embed do PostgREST
--     (`profiles ( nome_completo, game_state ( xp ) )`), que no banco é um
--     LEFT JOIN — e RLS se aplica a cada tabela do JOIN, não só à tabela
--     principal.
--   • Resultado, comprovado em teste: para TODO post de outra pessoa, o embed
--     volta `null`, e o código cai nos fallbacks `'Usuário GERMINA'` e `xp=0`.
--     O Mural inteiro apareceria com "Usuário GERMINA — Nível 1 - Semente"
--     em todo post que não fosse do próprio usuário logado. O mesmo vale para
--     as respostas (`getRespostas`) e para os itens de troca (`getTrocas`).
--
-- Isso nunca apareceu porque ainda não existe projeto Supabase real conectado
-- (Prioridade 1 do relatório de status) — o build local nunca exercitou RLS
-- com dois usuários de verdade.
--
-- A CORREÇÃO, E POR QUE UMA VIEW EM VEZ DE UMA POLICY NOVA
--
-- A saída óbvia seria abrir `profiles` para leitura de qualquer autenticado.
-- Seria errado: `profiles` guarda `telefone`, `endereco`, `idade` e
-- `instituicao` — e a decisão de produto da Fase 2 foi justamente que
-- `instituicao` NÃO é pública. RLS filtra LINHA, não COLUNA: abrir a linha
-- abriria tudo junto.
--
-- Esta view é o recorte explícito do que é público sobre um autor: o nome que
-- ele já assina em cada post, e o XP de que o nível é derivado. Nada mais
-- atravessa. Views são `security_invoker = false` por padrão (PG 15+), então
-- ela roda com os privilégios do dono e não reaplica o RLS das tabelas-base —
-- é exatamente por isso que ela funciona como janela controlada, e é também
-- por isso que a lista de colunas aqui é a fronteira de segurança inteira:
-- acrescentar uma coluna nesta view é torná-la pública para todo mundo.
-- ============================================================================

create view public.perfis_publicos as
  select
    p.id,
    p.nome_completo,
    -- XP e não "nível": o nível continua sendo Estado Derivado, calculado na
    -- leitura por calcularNivel(xp). Persistir/expor o nível pronto recriaria
    -- a classe de bug do QA-02.
    coalesce(g.xp, 0) as xp
  from public.profiles p
  left join public.game_state g on g.user_id = p.id;

comment on view public.perfis_publicos is
  'Identidade pública mínima de um autor da Comunidade: id, nome_completo e xp. NUNCA acrescentar colunas aqui sem decisão explícita — telefone, endereco, idade e instituicao são privados do dono (instituicao por decisão da Fase 2) e ficam protegidos pelo RLS de profiles, que esta view deliberadamente contorna para os 3 campos acima.';

-- Só `authenticated`. O modo visitante (Fase 4) vai precisar estender isto
-- para `anon` se o Mural for aberto para leitura sem login — decisão daquela
-- fase, não desta.
grant select on public.perfis_publicos to authenticated;
