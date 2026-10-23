import { TextoCientifico } from '../ui/TextoCientifico';
import { PerguntaQuiz, PlantaComQuiz } from '../../lib/types';
import { ProgressBar } from './ProgressBar';
import { PlantBadge } from './PlantBadge';
import { AnswerOption } from './AnswerOption';
import { HelpCircle } from 'lucide-react';

interface QuestionScreenProps {
  plantaData: PlantaComQuiz;
  /** Vem do catálogo (PLANTAS_CATALOGO), não do banco de perguntas — fonte única da verdade. */
  isRenisus: boolean;
  desafio: PerguntaQuiz;
  currentIndex: number;
  totalQuestions: number;
  selectedOption: 'A' | 'B' | 'C' | 'D' | null;
  onSelectOption: (option: 'A' | 'B' | 'C' | 'D') => void;
  onConfirm: () => void;
}

export function QuestionScreen({
  plantaData,
  isRenisus,
  desafio,
  currentIndex,
  totalQuestions,
  selectedOption,
  onSelectOption,
  onConfirm,
}: QuestionScreenProps) {
  const letters: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <ProgressBar currentStep={currentIndex + 1} totalSteps={totalQuestions} />

      <div className="bg-card-bg rounded-2xl p-5 border border-black/[0.08] space-y-5">
        <PlantBadge
          plantaName={plantaData.planta}
          isRenisus={isRenisus}
          nivel={desafio.nivel}
          eixo={desafio.eixo}
        />

        <div className="space-y-1.5">
          <h2 className="text-base font-bold text-blue-deep leading-snug">
            <TextoCientifico texto={desafio.pergunta} />
          </h2>
          <p className="text-xs text-ink-muted flex items-center gap-1 font-medium">
            <HelpCircle className="w-3.5 h-3.5 text-blue-main" />
            Escolha uma das 4 opções abaixo:
          </p>
        </div>

        <div className="space-y-2.5">
          {letters.map((letter) => (
            <AnswerOption
              key={letter}
              keyLetter={letter}
              optionText={desafio.alternativas[letter]}
              isSelected={selectedOption === letter}
              isDisabled={false}
              onSelect={onSelectOption}
            />
          ))}
        </div>

        <button
          onClick={onConfirm}
          disabled={!selectedOption}
          className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2 ${
            selectedOption
              ? 'bg-blue-main text-white active:scale-[0.98]'
              : 'bg-black/[0.04] text-green-deep/70 border border-black/[0.06] cursor-not-allowed'
          }`}
        >
          {selectedOption ? 'Confirmar resposta' : 'Selecione uma alternativa'}
        </button>
      </div>
    </div>
  );
}
