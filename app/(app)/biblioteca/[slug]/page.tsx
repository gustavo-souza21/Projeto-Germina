import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPlantasCatalogo, getColecao } from '../../../../lib/queries/colecao';
import { getGameState } from '../../../../lib/queries/perfil';
import { slugify } from '../../../../lib/slug';
import { FichaBotanicaClient } from '../../../../components/FichaBotanicaClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPlantaPorSlug(slug: string) {
  const plantas = await getPlantasCatalogo();
  return plantas.find((p) => slugify(p.nome_popular) === slug);
}

// Metadata dinâmica por planta — essencial para SEO (indexação no Google) e
// para o link ficar informativo quando colado em pesquisas ou compartilhado
// (ex: colado no Gemini para pedir mais informações sobre a espécie).
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const planta = await getPlantaPorSlug(slug);

  if (!planta) {
    return { title: 'Planta não encontrada | GERMINA' };
  }

  const titulo = `${planta.nome_popular} (${planta.nome_cientifico}) | Herbário Digital GERMINA`;
  const descricao = `${planta.nome_popular} — ${planta.familia}. ${planta.usos_tradicionais[0]}. Ficha botânica completa com preparo tradicional, composição fitoquímica e contraindicações, curadoria científica UFAM/ICET.`;

  return {
    title: titulo,
    description: descricao,
    openGraph: {
      title: titulo,
      description: descricao,
      images: [planta.imagem_url],
      type: 'article',
    },
  };
}

// Pré-gera as 15 rotas estáticas no build (uma por planta do catálogo)
export async function generateStaticParams() {
  const plantas = await getPlantasCatalogo();
  return plantas.map((p) => ({ slug: slugify(p.nome_popular) }));
}

export default async function FichaBotanicaPage({ params }: PageProps) {
  const { slug } = await params;
  const planta = await getPlantaPorSlug(slug);

  if (!planta) {
    notFound();
  }

  // Em paralelo: getColecao() e getGameState() são leituras independentes do
  // mesmo usuário autenticado — não há motivo pra serializar.
  const [colecao, gameState] = await Promise.all([getColecao(), getGameState()]);

  return <FichaBotanicaClient planta={planta} colecaoInicial={colecao} gameStateInicial={gameState} />;
}
