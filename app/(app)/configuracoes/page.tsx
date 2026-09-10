import { getPerfil, getGameState } from '../../../lib/queries/perfil';
import { getPreferencias } from '../../../lib/queries/configuracoes';
import { ConfiguracoesClient } from '../../../components/configuracoes/ConfiguracoesClient';

export default async function ConfiguracoesPage() {
  const [profile, gameState, preferencias] = await Promise.all([
    getPerfil(),
    getGameState(),
    getPreferencias(),
  ]);

  return (
    <ConfiguracoesClient
      profileInicial={profile}
      gameStateInicial={gameState}
      preferenciasIniciais={preferencias}
    />
  );
}
