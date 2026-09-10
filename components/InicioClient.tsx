'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InicioDashboard } from './InicioDashboard';
import { Profile, GameState, Atividade, DesafioDiario } from '../lib/types';
import { aplicarGanho } from '../lib/gamificacao';

export function InicioClient({
  profile,
  gameStateInicial,
  atividades,
  desafiosIniciais,
  plantasEstudadasCount,
  conquistasDesbloqueadas,
  conquistasTotal,
}: {
  profile: Profile;
  gameStateInicial: GameState;
  atividades: Atividade[];
  desafiosIniciais: DesafioDiario[];
  plantasEstudadasCount: number;
  conquistasDesbloqueadas: number;
  conquistasTotal: number;
}) {
  const router = useRouter();
  const [gameState, setGameState] = useState(gameStateInicial);
  const [desafios, setDesafios] = useState(desafiosIniciais);

  const handleConcluirDesafio = (desafioId: string) => {
    const desafio = desafios.find((d) => d.id === desafioId);
    if (!desafio || desafio.concluido) return;

    if (desafio.tipo === 'quiz') {
      // O quiz de verdade (com nível/eixo/alternativas) vive numa página própria,
      // que tem várias plantas e um fluxo completo de pergunta → feedback → resultado.
      router.push('/desafio-diario');
      return;
    }

    // Desafios "de ação" continuam com a conclusão direta de 1 clique
    setDesafios((prev) => prev.map((d) => (d.id === desafioId ? { ...d, concluido: true } : d)));
    // QA-02: terceiro ponto de mutação de XP do app, também sem recálculo de
    // nível. Passa a usar o helper centralizado como os outros dois.
    const resultado = aplicarGanho(gameState, {
      xp: desafio.xp_recompensa,
      moedas: desafio.moedas_recompensa,
    });
    setGameState(resultado.estado);
    // TODO: quando o Supabase estiver plugado, persistir via update em game_state
    // e insert em atividades, em vez de só atualizar o estado local.
  };

  return (
    <InicioDashboard
      profile={profile}
      gameState={gameState}
      atividades={atividades}
      desafios={desafios}
      plantasEstudadasCount={plantasEstudadasCount}
      conquistasDesbloqueadas={conquistasDesbloqueadas}
      conquistasTotal={conquistasTotal}
      onConcluirDesafio={handleConcluirDesafio}
    />
  );
}
