import { getPerfil, getGameState } from '../../../lib/queries/perfil';
import { getAtividades, getDesafios, getPlantasEstudadasCount, getConquistas } from '../../../lib/queries/dashboard';
import { InicioClient } from '../../../components/InicioClient';
import { diaLocal, ofensivaVigente } from '../../../lib/ofensiva';

export default async function InicioPage() {
  const [profile, gameState, atividades, desafios, plantasEstudadasCount, conquistas] = await Promise.all([
    getPerfil(),
    getGameState(),
    getAtividades(),
    getDesafios(),
    getPlantasEstudadasCount(),
    getConquistas(),
  ]);

  const conquistasDesbloqueadas = conquistas.filter((c) => c.desbloqueada).length;

  return (
    <InicioClient
      profile={profile}
      gameStateInicial={gameState}
      atividades={atividades}
      desafiosIniciais={desafios}
      plantasEstudadasCount={plantasEstudadasCount}
      conquistasDesbloqueadas={conquistasDesbloqueadas}
      conquistasTotal={conquistas.length}
      ofensiva={ofensivaVigente(gameState, diaLocal())}
    />
  );
}
