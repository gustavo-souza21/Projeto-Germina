-- =============================================================================
-- Migration 13 — correções da análise de XP e gamificação (22/10/2026)
--
-- Ver claude/GERMINA_Analise_XP_Gamificacao.md, achados 5 e 7.
--
-- Tudo aqui é compatível com o frontend que já está no ar:
--   • a coluna nova tem default e o app antigo simplesmente não a lê;
--   • a função é recriada com a MESMA assinatura (text, int, int), então
--     `create or replace` substitui em vez de criar sobrecarga, e os
--     privilégios de EXECUTE são preservados;
--   • d1, d2 e d3 nunca foram concluídos por nenhuma tela.
-- Por isso a ordem segura de deploy é: rodar ESTE arquivo primeiro, publicar
-- o frontend depois (o frontend novo lê `maior_streak`).
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Achado 5 — a medalha "Ofensiva de Saberes" se desfazia
--
-- A conquista era calculada pela ofensiva ATUAL. Quem chegava a 5 dias e
-- depois quebrava a sequência perdia a medalha. Conquista é marco: uma vez
-- alcançada, fica. Para isso é preciso lembrar o maior valor já atingido —
-- coisa que não é derivável de `streak` + `ultimo_desafio_em` (essas duas só
-- descrevem a sequência corrente).
-- -----------------------------------------------------------------------------
alter table public.game_state
  add column maior_streak int not null default 0
    constraint game_state_maior_streak_non_negative check (maior_streak >= 0);

comment on column public.game_state.maior_streak is
  'Maior ofensiva já alcançada. Só cresce; mantida por concluir_desafio_diario(). Base da conquista "Ofensiva de Saberes", que não pode ser perdida quando a sequência atual quebra.';

-- Ponto de partida honesto para quem já joga: o maior valor que o banco
-- conhece é a ofensiva gravada hoje. Sequências maiores que já tenham se
-- perdido no passado não são recuperáveis — o histórico não foi guardado.
update public.game_state set maior_streak = streak where streak > maior_streak;


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
      -- única linha nova em relação à Migration 8
      maior_streak = greatest(maior_streak, v_streak_novo),
      ultimo_desafio_em = v_hoje
  where user_id = v_user_id;

  insert into public.atividades (user_id, icone, texto, xp_ganho)
  values (v_user_id, 'BookOpen', 'Completou o Desafio Diário', v_xp_credito);

  return query select * from public.game_state where user_id = v_user_id;
end;
$$;

comment on function public.concluir_desafio_diario(text, int, int) is
  'Registra a conclusão do Desafio Diário, credita xp/moedas (sempre limitado ao teto de catalogo_desafios), recalcula a ofensiva e mantém maior_streak. "Hoje" é sempre calculado aqui (fuso America/Manaus), nunca recebido do cliente. NÃO valida as respostas do quiz em si.';


-- -----------------------------------------------------------------------------
-- Achado 7 — desafios sem tela que rendiam XP
--
-- d1, d2 e d3 estavam no catálogo do banco, mas nenhuma tela do app os
-- conclui. Mesmo assim a função acima os aceitava: chamando a API direto,
-- uma conta nova somava +300 XP e +95 moedas por dia além do d0, sem jogar.
-- Com eles fora do catálogo, a função passa a recusar ("não existe no
-- catálogo"). Os registros históricos em desafios_diarios_concluidos, se
-- houver, ficam como estão — não há chave estrangeira para o catálogo.
-- -----------------------------------------------------------------------------
delete from public.catalogo_desafios where desafio_id in ('d1', 'd2', 'd3');
