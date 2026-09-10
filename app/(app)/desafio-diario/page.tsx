import { getGameState } from '../../../lib/queries/perfil';
import { DesafioDiarioClient } from '../../../components/desafio-diario/DesafioDiarioClient';
import { diaLocal } from '../../../lib/ofensiva';

export default async function DesafioDiarioPage() {
  const gameState = await getGameState();
  return <DesafioDiarioClient gameStateInicial={gameState} hoje={diaLocal()} />;
}
