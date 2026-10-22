-- =============================================================================
-- Fechamento da Migration 14 — rodar SÓ DEPOIS do deploy do frontend novo.
--
-- Remove o que existia apenas para o frontend antigo continuar funcionando
-- durante o deploy:
--   • estudar_planta: concluía o estudo com um clique na ficha, sem o quiz.
--     Mantida no ar, seria um atalho para a semente e o XP pulando a regra
--     "ficha + quiz".
--   • plantar_semente: consumia sementes genéricas, que deixaram de existir.
--
-- E, por segurança, converte em moedas qualquer semente genérica que ainda
-- exista (a migration já converteu tudo e tirou o pacote da loja; isto só
-- pega algum caso que tenha escapado entre a migration e o deploy).
-- =============================================================================

drop function if exists public.estudar_planta(text, text);
drop function if exists public.plantar_semente(smallint, text);
delete from public.catalogo_itens_loja where item_id = 'semente';

insert into public.atividades (user_id, icone, texto, xp_ganho, moedas_delta)
select user_id, 'Registro', 'Sementes antigas convertidas em moedas', 0,
       sementes * public.cfg('semente_preco')
from public.game_state
where sementes > 0;

update public.game_state
set moedas = moedas + sementes * public.cfg('semente_preco'),
    sementes = 0
where sementes > 0;
