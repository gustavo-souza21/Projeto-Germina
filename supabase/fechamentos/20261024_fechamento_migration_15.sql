-- =============================================================================
-- Fechamento da Migration 15 — rodar SÓ DEPOIS do deploy do frontend novo.
--
-- Liga o ritmo novo da horta, que a Migration 15 deixou com os valores antigos
-- para não quebrar o app que estava no ar:
--   • ciclo de 10 min → 30 min
--   • adubo adianta 90 s → 5 min
--   • colheita rende 40 XP → 10 XP
--
-- Plantas que JÁ estavam prontas pela regra antiga continuam prontas: elas
-- ganham o tempo que falta como bônus, para ninguém ver a planta "voltar" de
-- "Pronta para colher" para "Flor" por causa da mudança.
-- =============================================================================

-- Tudo numa transação: ou entra inteiro, ou nada muda.
begin;

lock table public.terrenos_jardim, public.game_state in exclusive mode;

update public.terrenos_jardim
set bonus_adubo_ms = bonus_adubo_ms + (1800000 - 600000)
where planta_id is not null
  and plantado_em is not null
  and (extract(epoch from (now() - plantado_em)) * 1000)::bigint + bonus_adubo_ms
      >= public.cfg('ciclo_ms');

update public.config_economia set valor = 1800000,
  descricao = 'Tempo do plantio até a colheita, em ms (30 min)'
  where chave = 'ciclo_ms';

update public.config_economia set valor = 300000,
  descricao = 'Quanto cada adubo adianta o crescimento, em ms (5 min)'
  where chave = 'adubo_bonus_ms';

update public.config_economia set valor = 10,
  descricao = 'XP por colheita (baixo de propósito: a horta é fonte de moedas, o nível vem do estudo)'
  where chave = 'colheita_xp';

commit;
