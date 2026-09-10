import Link from 'next/link';
import { PlantaCatalogo, UserColecao } from '../../lib/types';
import { slugify } from '../../lib/slug';
import { Award, BookOpen } from 'lucide-react';
import { NomeCientifico } from '../ui/NomeCientifico';

export function HerbarioTab({
  plantas,
  colecao,
}: {
  plantas: PlantaCatalogo[];
  colecao: UserColecao[];
}) {
  const idsEstudados = new Set(colecao.map((c) => c.planta_id));
  const estudadas = plantas.filter((p) => idsEstudados.has(p.id));

  if (estudadas.length === 0) {
    return (
      <div className="bg-card-bg rounded-2xl p-8 text-center border border-black/[0.04] text-ink-muted space-y-2">
        <BookOpen className="w-10 h-10 mx-auto text-locked" />
        <p className="font-bold">Seu herbário pessoal ainda está vazio.</p>
        <p className="text-xs">
          Estude plantas na{' '}
          <Link href="/biblioteca" className="text-green-deep font-bold underline">
            Biblioteca
          </Link>{' '}
          para começar sua coleção.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-ink-muted font-semibold px-1">
        {estudadas.length} de {plantas.length} espécies catalogadas no seu herbário pessoal
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {estudadas.map((planta) => {
          const status = colecao.find((c) => c.planta_id === planta.id)?.status_crescimento;

          return (
            <Link
              key={planta.id}
              href={`/biblioteca/${slugify(planta.nome_popular)}`}
              className="bg-card-bg rounded-2xl border border-black/[0.04] overflow-hidden shadow-card hover:shadow-card-hover transition-all group"
            >
              <div className="relative h-24 bg-surface-alt">
                <img
                  src={planta.imagem_url}
                  alt={planta.nome_popular}
                  className="w-full h-full object-cover"
                />
                {planta.is_renisus && (
                  <span className="absolute top-1.5 right-1.5 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Award className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
              <div className="p-2.5">
                <h4 className="text-xs font-bold text-green-deep truncate">{planta.nome_popular}</h4>
                <p className="text-[10px] text-ink-muted truncate">
                  <NomeCientifico texto={planta.nome_cientifico} />
                </p>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block capitalize">
                  {status || 'estudada'}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
