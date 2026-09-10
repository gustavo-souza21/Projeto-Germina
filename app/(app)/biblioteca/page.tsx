import { getPlantasCatalogo, getColecao } from '../../../lib/queries/colecao';
import { HerbarioVirtual } from '../../../components/HerbarioVirtual';

export default async function BibliotecaPage() {
  const [plantas, colecao] = await Promise.all([getPlantasCatalogo(), getColecao()]);

  return <HerbarioVirtual plantas={plantas} colecaoUsuario={colecao} />;
}
