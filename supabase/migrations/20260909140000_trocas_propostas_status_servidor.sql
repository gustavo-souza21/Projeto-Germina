-- ============================================================================
-- GERMINA — Migration 10: quem decide uma proposta de troca é o dono do item,
--                         e isso passa a ser garantido pelo banco.
--
-- ACHADO QUE ESTA MIGRATION FECHA (achado #9 da auditoria de 09/09/2026,
-- Fase 3):
--
-- `trocas_propostas_atualizacao` (Migration 5) libera UPDATE da linha inteira
-- para os DOIS interessados — o proponente e o dono do item. A própria
-- migration já registrava o limite: "RLS opera por LINHA, não por COLUNA (...)
-- ela não impede, sozinha, que o dono do item edite oferta_texto/mensagem, nem
-- que o proponente mude status para 'aceita'".
--
-- Na prática isso significa que o proponente pode se AUTO-APROVAR: basta uma
-- chamada direta à API (`.from('trocas_propostas').update({ status: 'aceita' })`
-- na própria linha) para a proposta aparecer como aceita sem que o dono do
-- item jamais tenha visto. A UI nunca ofereceu esse botão — mas, como em todos
-- os achados desta auditoria, "a UI não faz isso" não é uma garantia; o que
-- vale é o que o banco recusa.
--
-- A CORREÇÃO — mesmo desenho da Fase 1 (Migration 8), pelas mesmas razões:
--   1. A única transição legítima de estado vira uma FUNÇÃO no servidor
--      (`responder_proposta_troca`), que confere o papel de quem chama em vez
--      de confiar em quem está chamando.
--   2. O privilégio de UPDATE direto some do role `authenticated`, e a policy
--      de UPDATE é removida junto. Sem os dois passos a correção seria só uma
--      sugestão: fechar a lógica sem revogar a escrita direta deixaria a porta
--      antiga aberta ao lado da porta nova.
--
-- Nota sobre o que NÃO é tratado aqui: editar `oferta_texto`/`mensagem` de uma
-- proposta ainda pendente. Isso hoje não existe na UI (o cliente só INSERE
-- propostas, em `components/comunidade/TrocaModal.tsx`), então não há caminho
-- legítimo sendo removido. Se virar funcionalidade, ganha a própria função,
-- restrita ao proponente e a propostas ainda 'pendente' — não uma reabertura
-- do UPDATE geral.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. responder_proposta_troca — aceitar ou recusar uma proposta recebida.
--
-- security definer pelo mesmo motivo das funções da Migration 8: o UPDATE
-- direto é revogado no fim deste arquivo, então com `security invoker` a
-- própria função perderia o privilégio de escrever.
-- ----------------------------------------------------------------------------
create or replace function public.responder_proposta_troca(
  p_proposta_id uuid,
  p_status text
)
returns setof public.trocas_propostas
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_dono_item uuid;
  v_status_atual text;
begin
  if v_user_id is null then
    raise exception 'responder_proposta_troca: usuário não autenticado.';
  end if;

  -- Só estes dois. 'pendente' não entra: voltar atrás numa decisão já tomada
  -- é outra operação, com outras consequências (o anúncio pode já ter sido
  -- desativado), e não existe como pedido hoje.
  if p_status not in ('aceita', 'recusada') then
    raise exception 'responder_proposta_troca: status % inválido (esperado: aceita ou recusada).', p_status;
  end if;

  -- Quem decide é o dono do ANÚNCIO, não quem propôs. É esta linha que fecha
  -- o achado: o papel vem do banco (itens_troca.user_id), nunca de quem
  -- fez a chamada.
  select it.user_id, tp.status
    into v_dono_item, v_status_atual
    from public.trocas_propostas tp
    join public.itens_troca it on it.id = tp.item_troca_id
    where tp.id = p_proposta_id
    for update of tp;

  if not found then
    raise exception 'responder_proposta_troca: proposta % não encontrada.', p_proposta_id;
  end if;

  if v_dono_item <> v_user_id then
    -- Mensagem deliberadamente igual à de proposta inexistente seria melhor
    -- para não revelar a existência da linha — mas aqui a leitura da linha já
    -- é permitida ao proponente pela policy de SELECT, então não há o que
    -- esconder dele: ele sabe que a proposta existe, só não pode decidi-la.
    raise exception 'responder_proposta_troca: só o dono do item pode responder a proposta %.', p_proposta_id;
  end if;

  if v_status_atual <> 'pendente' then
    raise exception 'responder_proposta_troca: proposta % já foi respondida (status atual: %).', p_proposta_id, v_status_atual;
  end if;

  update public.trocas_propostas
  set status = p_status
  where id = p_proposta_id;

  return query select * from public.trocas_propostas where id = p_proposta_id;
end;
$$;

comment on function public.responder_proposta_troca(uuid, text) is
  'Aceita ou recusa uma proposta de troca. O papel de quem chama é resolvido no servidor (dono do itens_troca correspondente), fechando o achado #9: antes, o próprio proponente podia gravar status = aceita direto na tabela.';

revoke all on function public.responder_proposta_troca(uuid, text) from public;
grant execute on function public.responder_proposta_troca(uuid, text) to authenticated;


-- ----------------------------------------------------------------------------
-- 2. Fechar a porta antiga.
--
-- A policy de UPDATE sai junto com o GRANT: com as duas coisas removidas, uma
-- eventual reconcessão futura de UPDATE (por engano, numa migration nova)
-- ainda esbarraria na ausência de policy — RLS nega por padrão o que nenhuma
-- policy autoriza. Defesa em profundidade, mesmo raciocínio do REVOKE
-- redundante da migration de restrição de policies (20260819200000).
--
-- INSERT (propor), SELECT (ver as próprias/recebidas) e DELETE (retirar a
-- própria proposta) continuam como estavam — nenhum deles tinha o problema.
-- ----------------------------------------------------------------------------
drop policy trocas_propostas_atualizacao on public.trocas_propostas;

revoke update on public.trocas_propostas from authenticated;


-- ----------------------------------------------------------------------------
-- 3. A outra metade do mesmo achado: o INSERT.
--
-- Fechar só o UPDATE deixaria o buraco pela metade, e isso foi descoberto
-- conferindo os privilégios efetivos no banco depois de aplicar as
-- migrations — não lendo o código. `trocas_propostas` tinha INSERT de tabela
-- inteira para `authenticated`, e a policy de INSERT
-- (`trocas_propostas_insercao_proponente`) só confere
-- `proponente_user_id = auth.uid()`. Ou seja: em vez de propor e depois
-- aprovar, bastava JÁ INSERIR a proposta com `status = 'aceita'`. Mesmo
-- resultado do exploit original, por outra porta.
--
-- No Postgres, privilégio de tabela e de coluna são coisas separadas: com
-- INSERT no nível da TABELA, revogar a coluna sozinha não surte efeito. O
-- caminho é revogar no nível da tabela e reconceder só as colunas que o
-- cliente legitimamente preenche — mesmo padrão do
-- `grant update (tema_ativo)` da Migration 8.
--
-- As quatro colunas abaixo são exatamente as que
-- `components/comunidade/TrocaModal.tsx` envia hoje. As de fora ficam com o
-- DEFAULT do schema, que é o comportamento correto para todas elas:
--   • status      → 'pendente' (a proposta nasce pendente, sempre)
--   • id          → uuid_generate_v4()
--   • criado_em   → now() (data de criação não é dado do cliente)
-- ----------------------------------------------------------------------------
revoke insert on public.trocas_propostas from authenticated;

grant insert (item_troca_id, proponente_user_id, oferta_texto, mensagem)
  on public.trocas_propostas to authenticated;
