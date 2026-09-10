import { PlantaComQuiz } from '../../lib/types';
import { GameState } from '../../lib/types';
import { ShieldCheck, Flame, Play, Info } from 'lucide-react';

interface StartScreenProps {
  plantaData: PlantaComQuiz;
  /** Vem do catálogo (PLANTAS_CATALOGO), não do banco de perguntas — fonte única da verdade. */
  isRenisus: boolean;
  allPlants: PlantaComQuiz[];
  selectedPlantIndex: number;
  onSelectPlant: (index: number) => void;
  gameState: GameState;
  jaCompletouHoje: boolean;
  onStart: () => void;
}

// Um ícone por espécie do catálogo — antes só 3 estavam mapeadas e as outras 12
// caíam no fallback genérico.
const PLANT_ICONS: Record<string, string> = {
  Amora: '🫐',
  Goiaba: '🍐',
  Abacate: '🥑',
  Boldo: '🌿',
  Corama: '🌵',
  Crajiru: '🌺',
  'Pobre-velho': '🌾',
  Terramicina: '🍁',
  Cidreira: '💜',
  'Hortelã pimenta': '🍃',
  'Cuia-mansa': '☘️',
  'Capim santo': '🌱',
  Cumaru: '🌰',
  'Boldinho japonês': '🌱',
  Malvarisco: '🪴',
};

export function StartScreen({
  plantaData,
  isRenisus,
  allPlants,
  selectedPlantIndex,
  onSelectPlant,
  gameState,
  jaCompletouHoje,
  onStart,
}: StartScreenProps) {
  const icone = PLANT_ICONS[plantaData.planta] || '🌱';

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Abas de seleção de planta */}
      {/* 15 espécies não cabem numa linha só: rolagem horizontal em vez de flex-1 espremido. */}
      <div className="bg-card-bg p-1.5 rounded-2xl border border-black/[0.08] flex gap-1 overflow-x-auto">
        {allPlants.map((plantItem, idx) => (
          <button
            key={plantItem.planta_id}
            onClick={() => onSelectPlant(idx)}
            className={`shrink-0 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              selectedPlantIndex === idx
                ? 'bg-green-main text-white'
                : 'text-ink-muted hover:bg-surface-alt'
            }`}
          >
            <span>{PLANT_ICONS[plantItem.planta] || '🌿'}</span>
            <span>{plantItem.planta}</span>
          </button>
        ))}
      </div>

      {/* Card principal */}
      <div className="bg-card-bg rounded-2xl border border-black/[0.08] p-6 flex flex-col items-center text-center">
        <div className="w-28 h-28 bg-surface-alt rounded-full flex items-center justify-center mb-3 border-2 border-green-soft text-5xl">
          {icone}
        </div>

        <div className="space-y-1 mb-2">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[10px] font-bold uppercase text-green-deep bg-green-soft/40 px-2 py-0.5 rounded">
              Planta do Dia
            </span>
            {isRenisus && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3 h-3 text-teal-700" /> RENISUS
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-green-deep tracking-tight">
            {plantaData.planta}
          </h2>
        </div>

        <div className="w-full space-y-2 mb-6 text-left mt-3">
          <div className="flex justify-between items-center text-xs py-1.5 border-b border-black/[0.06] font-medium text-ink-muted">
            <span>Questões no Desafio</span>
            <span className="font-bold text-blue-deep">{plantaData.desafios.length} Perguntas</span>
          </div>
          <div className="flex justify-between items-center text-xs py-1.5 border-b border-black/[0.06] font-medium text-ink-muted">
            <span>Dificuldade</span>
            <span className="text-blue-main font-bold uppercase">Fácil ➔ Médio ➔ Difícil</span>
          </div>
          <div className="flex justify-between items-center text-xs py-1.5 border-b border-black/[0.06] font-medium text-ink-muted">
            <span>Ofensiva Diária</span>
            <span className="text-orange-600 font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              {gameState.streak} {gameState.streak === 1 ? 'dia' : 'dias'}
            </span>
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full py-4 bg-green-main text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-base active:scale-[0.98]"
        >
          <Play className="w-5 h-5 fill-white" />
          {jaCompletouHoje ? 'REFAZER DESAFIO' : 'COMEÇAR DESAFIO'}
        </button>
      </div>
    </div>
  );
}
