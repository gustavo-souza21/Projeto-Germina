import { TextoCientifico } from '../ui/TextoCientifico';
import { PerguntaQuiz, PlantaComQuiz } from '../../lib/types';
import { ProgressBar } from './ProgressBar';
import { PlantBadge } from './PlantBadge';
import { AnswerOption } from './AnswerOption';
import { FeedbackBanner } from './FeedbackBanner';
import { BookMarked } from 'lucide-react';

interface FeedbackScreenProps {
  plantaData: PlantaComQuiz;
  /** Vem do catálogo (PLANTAS_CATALOGO), não do banco de perguntas — fonte única da verdade. */
  isRenisus: boolean;
  desafio: PerguntaQuiz;
  currentIndex: number;
  totalQuestions: number;
  userSelection: 'A' | 'B' | 'C' | 'D';
  onNext: () => void;
  modoTreino: boolean;
}

export function FeedbackScreen({
  plantaData,
  isRenisus,
  desafio,
  currentIndex,
  totalQuestions,
  userSelection,
  onNext,
  modoTreino,
}: FeedbackScreenProps) {
  const isCorrect = userSelection === desafio.resposta_correta;
  const isLastQuestion = currentIndex === totalQuestions - 1;
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

        <h2 className="text-base font-bold text-blue-deep leading-snug">
          <TextoCientifico texto={desafio.pergunta} />
        </h2>

        <div className="space-y-2.5">
          {letters.map((letter) => {
            const isOptionCorrect = letter === desafio.resposta_correta;
            const isOptionSelected = letter === userSelection;
            const isOptionIncorrect = isOptionSelected && !isCorrect;

            return (
              <AnswerOption
                key={letter}
                keyLetter={letter}
                optionText={desafio.alternativas[letter]}
                isSelected={isOptionSelected}
                isCorrect={isOptionCorrect}
                isIncorrect={isOptionIncorrect}
                isDisabled={true}
                onSelect={() => {}}
              />
            );
          })}
        </div>

        <FeedbackBanner
          isCorrect={isCorrect}
          respostaCorreta={desafio.resposta_correta}
          feedbackText={desafio.feedback}
          onNext={onNext}
          isLastQuestion={isLastQuestion}
          modoTreino={modoTreino}
        />

        {/* Rastreabilidade acadêmica: mostra de qual campo da curadoria a resposta
            foi extraída. É o que permite ao Comitê Ad Hoc validar item a item. */}
        <div className="flex items-start gap-1.5 pt-1 border-t border-black/[0.06]">
          <BookMarked className="w-3.5 h-3.5 mt-0.5 shrink-0 text-ink-muted" />
          <p className="text-xs leading-snug text-ink-muted">
            <span className="font-bold">Fonte na curadoria: </span>
            <TextoCientifico texto={desafio.fonte} />{' '}
            <span className="opacity-70">
              (Freitas, 2025)
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
