'use client';

import { useState } from 'react';
import { FichaBotanicaPlanta } from './FichaBotanicaPlanta';
import { GameState, PlantaCatalogo, UserColecao } from '../lib/types';
import { aplicarGanho, mapGameStateRow } from '../lib/gamificacao';
import { createClient } from '../lib/supabase/client';
import { ExigeLoginModal } from './ExigeLoginModal';
import { calcularNivel } from '../data/plantasData';

export function FichaBotanicaClient({
  planta,
  colecaoInicial,
  gameStateInicial,
}: {
  planta: PlantaCatalogo;
  colecaoInicial: UserColecao[];
  /** Vem do Server Component pai (getGameStateOpcional()) — dá `user_id` e o
   *  XP/moedas/sementes atuais, necessários pra calcular o ganho com
   *  aplicarGanho() sem mais uma volta ao banco.
   *  `null` = visitante sem conta (Fase 4): a ficha é legível, estudar não. */
  gameStateInicial: GameState | null;
}) {
  const [colecao, setColecao] = useState(colecaoInicial);
  const [gameState, setGameState] = useState(gameStateInicial);
  const [estudando, setEstudando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [avisoNivel, setAvisoNivel] = useState<string | null>(null);
  const [pedindoLogin, setPedindoLogin] = useState(false);
  const jaEstudada = colecao.some((c) => c.planta_id === planta.id);

  const handleEstudarPlanta = async (p: PlantaCatalogo) => {
    /* Fase 4 — gate de login. Sem `gameState` não há conta, e sem conta não
       há onde creditar o XP. A RPC `estudar_planta` já recusaria (ela resolve
       o usuário por `auth.uid()`, que viria nulo), mas o visitante veria só
       um erro genérico; aqui ele vê o convite. */
    if (!gameState) {
      setPedindoLogin(true);
      return;
    }

    // Guarda contra duplo clique/duplo disparo: sem isto, dois cliques antes
    // da primeira resposta voltar tentariam persistir e conceder XP duas
    // vezes — o upsert em user_colecao é inofensivo a isso, mas o ganho de
    // XP/moedas/sementes NÃO é (creditaria duas vezes).
    if (estudando || colecao.some((c) => c.planta_id === p.id)) return;

    setEstudando(true);
    setErro(null);

    const colecaoAnterior = colecao;
    const gameStateAnterior = gameState;
    const desbloqueadaEm = new Date().toISOString();

    // QA-02: o ganho passa por aplicarGanho, que recalcula o nível a partir
    // do XP (Estado Derivado) — nunca `gameState.xp + p.xp_recompensa` direto
    // aqui. Estudar planta hoje só concede XP (moedas/sementes ficam como
    // estão — aplicarGanho já lida com isso via `?? 0`), mas passar pela
    // mesma função central significa que dar sementes/moedas por estudar no
    // futuro é só acrescentar a chave no objeto de ganho, sem duplicar lógica.
    const resultado = aplicarGanho(gameStateAnterior, { xp: p.xp_recompensa });

    // Optimistic UI Update: herbário ("Já estudada") e XP/nível refletem o
    // ganho antes da resposta do Supabase; os três estados (coleção,
    // game_state, e o registro em atividades, que não tem estado local mas
    // participa do mesmo rollback) são revertidos juntos se qualquer uma das
    // três chamadas abaixo falhar.
    setColecao((prev) => [
      ...prev,
      {
        user_id: gameStateAnterior.user_id,
        planta_id: p.id,
        // 'semente' é o primeiro degrau do enum de status_crescimento
        // ('semente' | 'broto' | 'muda' | 'flores' | 'colhida', ver
        // UserColecao em lib/types.ts) — estudar uma planta pela primeira
        // vez sempre começa do zero nesse enum.
        status_crescimento: 'semente',
        desbloqueada_em: desbloqueadaEm,
      },
    ]);
    setGameState(resultado.estado);

    const supabase = createClient();

    const reverterTudo = () => {
      setColecao(colecaoAnterior);
      setGameState(gameStateAnterior);
    };

    // estudar_planta (Migration 8 — GERMINA_Auditoria_Autenticacao_
    // Autorizacao.md, Fase 1) substitui os três passos sequenciais que
    // existiam aqui (upsert em user_colecao + update em game_state + insert
    // em atividades) por uma única transação no servidor. Fecha dois
    // problemas: o XP creditado agora vem de catalogo_plantas_xp, nunca de
    // `p.xp_recompensa` recebido do cliente; e a função recusa creditar de
    // novo se `user_colecao` já tiver essa planta — antes, chamar a mutação
    // fora da guarda client-side (`colecao.some(...)`) permitia repetir o
    // estudo da mesma planta e farmar XP indefinidamente.
    const { data, error } = await supabase.rpc('estudar_planta', {
      p_planta_id: p.id,
      p_planta_nome: p.nome_popular,
    });

    setEstudando(false);

    if (error || !data?.[0]) {
      reverterTudo();
      console.error('Falha ao estudar planta:', error?.message);
      setErro('Não foi possível salvar isso agora. Tente novamente.');
      return;
    }

    // Substitui o palpite otimista (aplicarGanho local) pelo XP autoritativo
    // devolvido pela RPC.
    const confirmado = mapGameStateRow(data[0]);
    setGameState(confirmado);

    // Estudar uma ficha RENISUS (100 XP) pode subir de nível — antes isso só
    // era anunciado no Jardim e aqui passava em silêncio.
    const nivelAntes = calcularNivel(gameStateAnterior.xp);
    const nivelDepois = calcularNivel(confirmado.xp);
    if (nivelDepois.nivel > nivelAntes.nivel) {
      setAvisoNivel(`Você subiu para o nível ${nivelDepois.nome}! Um novo canteiro foi liberado no Jardim.`);
    }
  };

  return (
    <>
      <FichaBotanicaPlanta
        planta={planta}
        jaEstudada={jaEstudada}
        estudando={estudando}
        onEstudarPlanta={handleEstudarPlanta}
      />
      {erro && <p className="text-xs text-red-600 font-semibold text-center mt-3">{erro}</p>}
      {avisoNivel && (
        <p role="status" className="text-sm text-green-deep font-bold text-center mt-3 bg-green-soft/40 border border-green-soft rounded-xl px-4 py-3">
          {avisoNivel}
        </p>
      )}

      <ExigeLoginModal
        aberto={pedindoLogin}
        onFechar={() => setPedindoLogin(false)}
        acao={`estudar ${planta.nome_popular} e ganhar ${planta.xp_recompensa} XP`}
      />
    </>
  );
}
