import { NivelDificuldade, EixoTematico } from '../../lib/types';
import { ShieldCheck, BookOpen, Sparkles, Compass, ShieldAlert, Leaf } from 'lucide-react';

interface PlantBadgeProps {
  plantaName: string;
  isRenisus: boolean;
  nivel: NivelDificuldade;
  eixo: EixoTematico;
}

/* Rótulos de EXIBIÇÃO, em capitalização convencional (pedido da Sarah sobre a
   curadoria). Os valores internos (`facil`, 'Indicação Terapêutica'...) não
   mudam: são gravados em respostas_quiz e usados para contar a conquista
   Curador Atento. Antes o nível aparecia como "FACIL", sem acento. */
const ROTULO_NIVEL: Record<NivelDificuldade, string> = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil',
};

const ROTULO_EIXO: Record<EixoTematico, string> = {
  'Indicação Terapêutica': 'Indicação terapêutica',
  'Preparo Tradicional': 'Preparo tradicional',
  'Segurança e Contraindicação': 'Segurança e contraindicação',
  'Identificação Botânica': 'Identificação botânica',
  'Curiosidade ODS': 'Curiosidade ODS',
};

export function PlantBadge({ plantaName, isRenisus, nivel, eixo }: PlantBadgeProps) {
  const difficultyConfig = {
    facil: 'bg-green-soft/40 text-green-deep border-green-soft',
    medio: 'bg-amber-100 text-amber-800 border-amber-200',
    dificil: 'bg-blue-main/10 text-blue-deep border-blue-main/25',
  }[nivel];

  // Os 4 eixos ancorados na curadoria + 'Curiosidade ODS' (institucional, fora
  // do banco principal). Sem os dois novos, os badges renderizavam sem ícone.
  const eixoIcon: Record<EixoTematico, React.ReactNode> = {
    'Indicação Terapêutica': <Sparkles className="w-3 h-3" />,
    'Preparo Tradicional': <BookOpen className="w-3 h-3" />,
    'Segurança e Contraindicação': <ShieldAlert className="w-3 h-3" />,
    'Identificação Botânica': <Leaf className="w-3 h-3" />,
    'Curiosidade ODS': <Compass className="w-3 h-3" />,
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 font-bold text-xs text-blue-deep bg-surface-alt px-2.5 py-1 rounded-lg border border-black/[0.08]">
        {plantaName}
      </span>

      {isRenisus && (
        <span
          className="inline-flex items-center gap-1 text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200 px-2 py-1 rounded"
          title="Relação Nacional de Plantas Medicinais de Interesse ao SUS"
        >
          <ShieldCheck className="w-3 h-3 text-teal-700" />
          RENISUS
        </span>
      )}

      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded border ${difficultyConfig}`}>
        {ROTULO_NIVEL[nivel]}
      </span>

      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-main/10 text-blue-main border border-blue-main/25 px-2 py-1 rounded">
        {eixoIcon[eixo]}
        {ROTULO_EIXO[eixo]}
      </span>
    </div>
  );
}
