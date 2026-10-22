import { getGameState } from '../../../lib/queries/perfil';
import { getTerrenos } from '../../../lib/queries/jardim';
import { getColecao } from '../../../lib/queries/colecao';
import { JardimClient } from '../../../components/JardimClient';
import { getMissoes } from '../../../lib/queries/missoes';

export default async function JardimPage() {
  const [gameState, terrenos, colecao, missoes] = await Promise.all([
    getGameState(),
    getTerrenos(),
    getColecao(),
    getMissoes(),
  ]);

  return (
    <JardimClient
      // Instante do servidor: o cliente reusa no primeiro render para derivar
      // as mesmas fases e não disparar erro de hidratação (QA-01).
      agoraInicial={Date.now()}
      gameStateInicial={gameState}
      terrenosIniciais={terrenos}
      colecaoUsuario={colecao}
      missoesIniciais={missoes}
    />
  );
}
