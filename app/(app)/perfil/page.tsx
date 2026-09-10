import { getPerfil, getGameState } from '../../../lib/queries/perfil';
import { getPlantasEstudadasCount, getConquistas, getAtividades } from '../../../lib/queries/dashboard';
import { getPlantasCatalogo, getColecao } from '../../../lib/queries/colecao';
import { PerfilEConfiguracoes } from '../../../components/PerfilEConfiguracoes';

export default async function PerfilPage() {
  const [profile, gameState, plantasEstudadasCount, plantas, colecao, conquistas, atividades] =
    await Promise.all([
      getPerfil(),
      getGameState(),
      getPlantasEstudadasCount(),
      getPlantasCatalogo(),
      getColecao(),
      getConquistas(),
      getAtividades(),
    ]);

  return (
    <PerfilEConfiguracoes
      profile={profile}
      gameState={gameState}
      plantasEstudadasCount={plantasEstudadasCount}
      plantas={plantas}
      colecao={colecao}
      conquistas={conquistas}
      atividades={atividades}
    />
  );
}
