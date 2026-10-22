'use client';

import { useRouter } from 'next/navigation';
import { InicioDashboard } from './InicioDashboard';
import { Profile, GameState, Atividade, DesafioDiario } from '../lib/types';

export function InicioClient({
  profile,
  gameStateInicial,
  atividades,
  desafiosIniciais,
  plantasEstudadasCount,
  conquistasDesbloqueadas,
  conquistasTotal,
  ofensiva,
  sementes,
}: {
  profile: Profile;
  gameStateInicial: GameState;
  atividades: Atividade[];
  desafiosIniciais: DesafioDiario[];
  plantasEstudadasCount: number;
  conquistasDesbloqueadas: number;
  conquistasTotal: number;
  ofensiva: number;
  /** Soma das sementes de todas as espécies (não existe mais contador único). */
  sementes: number;
}) {
  const router = useRouter();

  /* O único desafio do app é o quiz, que vive numa página própria (várias
     plantas, fluxo pergunta → feedback → resultado, recompensa paga pela RPC
     concluir_desafio_diario).

     Antes havia aqui um segundo caminho, para desafios "de ação" (d1, d2, d3),
     que concluía com um clique e somava XP e moedas SÓ NA TELA — nunca chegava
     ao banco (havia um TODO no lugar da gravação). Esses desafios nunca foram
     exibidos, mas continuavam aceitos pelo servidor por chamada direta à API.
     Saíram do catálogo dos dois lados (data/plantasData.ts e Migration 13). */
  const handleConcluirDesafio = (desafioId: string) => {
    const desafio = desafiosIniciais.find((d) => d.id === desafioId);
    if (!desafio || desafio.concluido) return;
    router.push('/desafio-diario');
  };

  return (
    <InicioDashboard
      profile={profile}
      gameState={gameStateInicial}
      atividades={atividades}
      desafios={desafiosIniciais}
      plantasEstudadasCount={plantasEstudadasCount}
      conquistasDesbloqueadas={conquistasDesbloqueadas}
      conquistasTotal={conquistasTotal}
      ofensiva={ofensiva}
      sementes={sementes}
      onConcluirDesafio={handleConcluirDesafio}
    />
  );
}
