import { getPerfil } from '../../../lib/queries/perfil';
import { getPosts, getTrocas } from '../../../lib/queries/comunidade';
import { ComunidadeMural } from '../../../components/ComunidadeMural';

export default async function ComunidadePage() {
  const [profile, posts, trocas] = await Promise.all([getPerfil(), getPosts(), getTrocas()]);

  return <ComunidadeMural profile={profile} postsIniciais={posts} trocas={trocas} />;
}
