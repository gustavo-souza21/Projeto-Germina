'use client';

import { useState } from 'react';
import { PlantaComQuiz, GameState } from '../../lib/types';
import { Share2, Home, RefreshCw, BookOpen } from 'lucide-react';

interface ResultScreenProps {
  plantaData: PlantaComQuiz;
  correctAnswersCount: number;
  totalQuestions: number;
  pointsEarned: number;
  gameState: GameState;
  onHome: () => void;
  onRetry: () => void;
  onVerBiblioteca: () => void;
}

export function ResultScreen({
  plantaData,
  correctAnswersCount,
  totalQuestions,
  pointsEarned,
  gameState,
  onHome,
  onRetry,
  onVerBiblioteca,
}: ResultScreenProps) {
  const [copiado, setCopiado] = useState(false);
  const xpGanho = pointsEarned * 5;

  const handleShare = async () => {
    const texto = `GERMINA - Desafio Diário sobre ${plantaData.planta}!\n\n` +
      `Acertei ${correctAnswersCount}/${totalQuestions} perguntas!\n` +
      `Ofensiva diária: ${gameState.streak} ${gameState.streak === 1 ? 'dia' : 'dias'}\n\n` +
      `Aprenda mais sobre plantas medicinais amazônicas no GERMINA!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Desafio Diário GERMINA', text: texto });
        return;
      } catch {
        // usuário cancelou o compartilhamento nativo — cai no fallback abaixo
      }
    }
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch {
      // clipboard indisponível — ignora silenciosamente
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div className="bg-card-bg rounded-2xl border border-black/[0.08] p-6 flex flex-col items-center text-center">
        <h3 className="text-2xl font-bold text-green-deep mb-1">Parabéns!</h3>
        <p className="text-xs text-ink-muted mb-6">
          Você completou o Desafio Diário da planta <strong>{plantaData.planta}</strong>!
        </p>

        <div className="grid grid-cols-2 gap-3 w-full mb-5">
          <div className="bg-blue-main/10 p-4 rounded-2xl text-center border border-black/10">
            <div className="text-2xl font-bold text-blue-main">+{xpGanho} XP</div>
            <div className="text-[10px] uppercase font-bold text-ink-muted">Pontuação (+{pointsEarned} pts)</div>
          </div>
          <div className="bg-green-soft/40 p-4 rounded-2xl text-center border border-green-soft">
            <div className="text-2xl font-bold text-green-deep">{correctAnswersCount}/{totalQuestions}</div>
            <div className="text-[10px] uppercase font-bold text-green-deep">Acertos Obtidos</div>
          </div>
        </div>

        <div className="w-full bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-center gap-3 mb-6">
          <div className="text-left">
            <div className="text-xs font-bold text-orange-900">Ofensiva Mantida!</div>
            <div className="text-[11px] text-orange-700">
              Você está a <strong>{gameState.streak} {gameState.streak === 1 ? 'dia' : 'dias'}</strong> aprendendo sem parar.
            </div>
          </div>
        </div>

        <div className="w-full space-y-2.5">
          <button
            onClick={onHome}
            className="w-full py-4 bg-green-main text-white rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            CONTINUAR PARA O INÍCIO
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShare}
              className="py-2.5 bg-blue-main/10 text-blue-main font-bold rounded-xl border border-black/10 text-xs flex items-center justify-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copiado ? 'Copiado!' : 'Compartilhar'}
            </button>

            <button
              onClick={onRetry}
              className="py-2.5 bg-card-bg text-green-deep font-bold rounded-xl border border-black/10 text-xs flex items-center justify-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refazer
            </button>
          </div>

          <button
            onClick={onVerBiblioteca}
            className="w-full py-2 text-xs font-bold text-green-deep flex items-center justify-center gap-1 underline"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Revisar {plantaData.planta} na Biblioteca
          </button>
        </div>
      </div>
    </div>
  );
}
