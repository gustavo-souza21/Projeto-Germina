import { getPerfilOpcional } from '../../../lib/queries/perfil';
import { getPosts, getTrocas } from '../../../lib/queries/comunidade';
import { ComunidadeMural } from '../../../components/ComunidadeMural';

// Fase 4 — rota aberta em leitura para visitante. `getPerfilOpcional()` no
// lugar de `getPerfil()`: sem conta não há perfil, e isso deixou de ser erro.
// Posts e trocas são públicos desde a Migration 11; o que o visitante não
// pode é escrever — e quem garante isso é o banco, não esta página.
export default async function ComunidadePage() {
  const [profile, posts, trocas] = await Promise.all([
    getPerfilOpcional(),
    getPosts(),
    getTrocas(),
  ]);

  return <ComunidadeMural profile={profile} postsIniciais={posts} trocas={trocas} />;
}
