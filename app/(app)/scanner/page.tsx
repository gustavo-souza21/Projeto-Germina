import { getGameState } from '../../../lib/queries/perfil';
import { ScannerClient } from '../../../components/ScannerClient';

export default async function ScannerPage() {
  const gameState = await getGameState();
  return <ScannerClient gameStateInicial={gameState} />;
}
