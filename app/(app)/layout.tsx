import { getPerfilOpcional, getGameStateOpcional } from '../../lib/queries/perfil';
import { getPlantasEstudadasCount } from '../../lib/queries/dashboard';
import { getEstadoGuia } from '../../lib/queries/guia';
import { GuiaSarah } from '../../components/guia/GuiaSarah';
import { NIVEIS_EVOLUCAO, PLANTAS_CATALOGO, calcularNivel } from '../../data/plantasData';
import { HeaderBar } from '../../components/HeaderBar';
import { BottomNav } from '../../components/BottomNav';
import { Sidebar } from '../../components/Sidebar';
import { TemaAplicador } from '../../components/TemaAplicador';

// Layout compartilhado por todas as telas internas (Início, Biblioteca, Jardim,
// Comunidade, Perfil). É um Server Component: busca perfil e gameState uma vez
// aqui (hoje via mock em lib/queries, amanhã via Supabase) e cada página filha
// continua livre para buscar seus próprios dados adicionais.
//
// GER-UI-03: a navegação agora é responsiva de verdade — Sidebar a partir de
// `md`, BottomNav abaixo disso. Antes a barra de celular era exibida em
// qualquer largura.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  /* --------------------------------------------------------------------------
     Fase 4 — modo visitante.

     Este layout envolve TODAS as telas internas, inclusive /biblioteca e
     /comunidade, que agora abrem sem login. As versões `...Opcional`
     devolvem `null` sem sessão em vez de lançar exceção: com as originais,
     um visitante quebrava aqui, na montagem do shell, antes de qualquer
     conteúdo de página aparecer — o erro não seria "faça login", seria uma
     tela de erro do Next.

     `getPlantasEstudadasCount()` também precisou virar tolerante a visitante
     (devolve 0 sem sessão) — ela lançava exceção pelo mesmo motivo e teria
     quebrado este layout do mesmo jeito.
     ----------------------------------------------------------------------- */
  const [profile, gameState, plantasEstudadas, estadoGuia] = await Promise.all([
    getPerfilOpcional(),
    getGameStateOpcional(),
    getPlantasEstudadasCount(),
    getEstadoGuia(),
  ]);

  // Estado Derivado: nível não é persistido, é sempre recalculado do XP corrente.
  const nivelInfo = gameState
    ? NIVEIS_EVOLUCAO.find((n) => n.nivel === calcularNivel(gameState.xp).nivel)
    : undefined;
  const nivelNome = nivelInfo?.nome ?? 'Semente do Saber';

  const especiesRenisus = PLANTAS_CATALOGO.filter((p) => p.is_renisus).length;

  return (
    <div className="min-h-screen bg-bg-base md:flex">
      {/* Sem conta não há tema comprado — cai no padrão. */}
      <TemaAplicador tema={gameState?.tema_ativo ?? 'Padrao'} />

      <Sidebar
        profile={profile}
        gameState={gameState}
        plantasEstudadas={plantasEstudadas}
        totalEspecies={PLANTAS_CATALOGO.length}
        especiesRenisus={especiesRenisus}
      />

      <div className="flex-1 min-w-0">
        <HeaderBar profile={profile} gameState={gameState} nivelNome={nivelNome} />

        {/*
          QA-13 — respiro em telas grandes.
          `max-w-5xl` (1024px) deixava ~1.300px vazios num monitor de 2560px, já
          descontada a sidebar. A expansão é ESCALONADA em vez de saltar direto
          para 7xl: em 1280px o conteúdo cresce para 1152px, e só a partir de
          1536px chega a 1280px. Pular direto esticaria as linhas de texto das
          fichas botânicas bem além do confortável para leitura.

          O limite se mantém em 5xl abaixo de xl, então nada muda em notebook,
          tablet ou celular.

          pb-24 no mobile compensa a altura da BottomNav fixa.
        */}
        <main className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4 py-5 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      <BottomNav />

      {/* A Sarah fica fora do <main> de propósito: ela é sobreposta, ancorada
          na viewport, e não deve participar do fluxo nem da largura máxima do
          conteúdo. Montada aqui, no layout, ela sobrevive à navegação entre
          seções — é o que permite falar na primeira visita a cada uma. */}
      <GuiaSarah
        logado={estadoGuia.logado}
        falasVistasIniciais={estadoGuia.falasVistas}
        diasSemAtividade={estadoGuia.diasSemAtividade}
      />
    </div>
  );
}