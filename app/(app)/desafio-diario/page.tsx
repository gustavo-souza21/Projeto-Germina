import { getGameState } from '../../../lib/queries/perfil';
import { getColecao, getFichasLidas } from '../../../lib/queries/colecao';
import { DesafioDiarioClient } from '../../../components/desafio-diario/DesafioDiarioClient';
import { diaLocal } from '../../../lib/ofensiva';

export default async function DesafioDiarioPage({
  searchParams,
}: {
  searchParams: Promise<{ planta?: string }>;
}) {
  const [{ planta }, gameState, colecao, fichasLidas] = await Promise.all([
    searchParams,
    getGameState(),
    getColecao(),
    getFichasLidas(),
  ]);

  return (
    <DesafioDiarioClient
      gameStateInicial={gameState}
      hoje={diaLocal()}
      plantaInicialId={planta}
      colecaoInicial={colecao}
      fichasLidasIniciais={fichasLidas}
    />
  );
}
