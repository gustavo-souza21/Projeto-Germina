'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlantaComQuiz } from '../../lib/types';
import { Share2, Home, RefreshCw, BookOpen, TrendingUp, Sprout } from 'lucide-react';

/**
 * O que aconteceu com a recompensa desta rodada.
 *
 * Antes a tela mostrava sempre "+X XP" e "Ofensiva Mantida!", calculados no
 * próprio aparelho — inclusive quando nada tinha sido creditado (refazer no
 * mesmo dia, falha de rede). A recompensa só é anunciada como ganha quando o
 * servidor confirmou.
 */
export type StatusRecompensa = 'pendente' | 'creditada' | 'treino' | 'falhou';

/** Resultado do ESTUDO da espécie (concluir_quiz_especie), independente do Desafio do dia. */
export interface ResultadoEstudo {
  status:
    | 'pendente'
    | 'falhou'
    | 'estudo_concluido'
    | 'ficha_pendente'
    | 'revisao_recompensada'
    | 'revisao_ja_recompensada';
  xp: number;
  moedas: number;
}

interface ResultScreenProps {
  plantaData: PlantaComQuiz;
  correctAnswersCount: number;
  totalQuestions: number;
  pointsEarned: number;
  recompensa: StatusRecompensa;
  /** XP confirmado pelo servidor; enquanto pendente, a previsão local. */
  xpGanho: number;
  /** Moedas do Desafio do dia (anunciadas junto com o XP). */
  moedasDesafio: number;
  estudo: ResultadoEstudo;
  hrefFicha: string;
  /** Ofensiva já validada por data (ofensivaVigente). */
  ofensiva: number;
  /** Mensagem de celebração (nível + recompensa), quando esta rodada fez o usuário subir. */
  nivelNovo: string | null;
  onHome: () => void;
  onRetry: () => void;
  onVerBiblioteca: () => void;
}

export function ResultScreen({
  plantaData,
  correctAnswersCount,
  totalQuestions,
  pointsEarned,
  recompensa,
  xpGanho,
  moedasDesafio,
  estudo,
  hrefFicha,
  ofensiva,
  nivelNovo,
  onHome,
  onRetry,
  onVerBiblioteca,
}: ResultScreenProps) {
  const [copiado, setCopiado] = useState(false);
  const rotuloDias = ofensiva === 1 ? 'dia' : 'dias';
  const valeu = recompensa === 'creditada' || recompensa === 'pendente';

  const handleShare = async () => {
    const texto = `GERMINA - Desafio Diário sobre ${plantaData.planta}!\n\n` +
      `Acertei ${correctAnswersCount}/${totalQuestions} perguntas!\n` +
      `Ofensiva diária: ${ofensiva} ${rotuloDias}\n\n` +
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
        <h3 className="text-2xl font-bold text-green-deep mb-1">
          {recompensa === 'treino' ? 'Treino concluído!' : 'Parabéns!'}
        </h3>
        <p className="text-xs text-ink-muted mb-6">
          Você completou o Desafio Diário da planta <strong>{plantaData.planta}</strong>!
        </p>

        {nivelNovo && (
          <div
            role="status"
            className="w-full flex items-center justify-center gap-2 bg-green-soft/40 border border-green-soft text-green-deep text-sm font-bold rounded-xl px-4 py-3 mb-4"
          >
            <TrendingUp className="w-4 h-4" aria-hidden />
            {nivelNovo}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 w-full mb-5">
          <div className="bg-blue-main/10 p-4 rounded-2xl text-center border border-black/10">
            {valeu && (
              <>
                <div className="text-2xl font-bold text-blue-main">+{xpGanho} XP</div>
                <div className="text-[11px] font-bold text-ink-muted">
                  {recompensa === 'pendente'
                    ? 'Salvando...'
                    : `Desafio do dia: +${moedasDesafio} moedas (${pointsEarned} pts)`}
                </div>
              </>
            )}
            {recompensa === 'treino' && (
              <>
                <div className="text-2xl font-bold text-blue-main">Treino</div>
                <div className="text-[11px] font-bold text-ink-muted">Desafio de hoje já foi pago</div>
              </>
            )}
            {recompensa === 'falhou' && (
              <>
                <div className="text-2xl font-bold text-blue-main">Não salvo</div>
                <div className="text-[11px] font-bold text-ink-muted">Toque em Refazer para tentar de novo</div>
              </>
            )}
          </div>
          <div className="bg-green-soft/40 p-4 rounded-2xl text-center border border-green-soft">
            <div className="text-2xl font-bold text-green-deep">{correctAnswersCount}/{totalQuestions}</div>
            <div className="text-[11px] font-bold text-green-deep">Acertos</div>
          </div>
        </div>

        {/* Estudo da espécie (spec 1.1): a semente é o centro desta tela quando
            o estudo é concluído pela primeira vez. */}
        <div
          role="status"
          className="w-full text-left bg-green-soft/30 border border-green-soft rounded-xl p-4 mb-5 text-xs text-green-deep leading-snug"
        >
          {estudo.status === 'pendente' && <p>Registrando o estudo de {plantaData.planta}...</p>}
          {estudo.status === 'falhou' && (
            <p>Não foi possível registrar o estudo de {plantaData.planta} agora. Refaça o quiz para tentar de novo.</p>
          )}
          {estudo.status === 'estudo_concluido' && (
            <>
              <p className="text-sm font-bold flex items-center gap-1.5">
                <Sprout className="w-4 h-4" aria-hidden />
                Parabéns! Você conquistou a semente de {plantaData.planta}!
              </p>
              <p className="mt-1">
                Estudo concluído: +{estudo.xp} XP e +{estudo.moedas} moedas. O primeiro plantio desta espécie é gratuito.
              </p>
              <Link
                href="/jardim"
                className="mt-3 inline-flex items-center gap-1.5 bg-green-deep text-white font-bold px-4 py-2 rounded-lg"
              >
                <Sprout className="w-3.5 h-3.5" aria-hidden />
                Plantar no Jardim
              </Link>
            </>
          )}
          {estudo.status === 'ficha_pendente' && (
            <>
              <p className="font-bold">Falta uma etapa para ganhar a semente de {plantaData.planta}.</p>
              <p className="mt-1">Leia a ficha da espécie na Biblioteca e depois refaça este quiz.</p>
              <Link
                href={hrefFicha}
                className="mt-3 inline-flex items-center gap-1.5 bg-green-deep text-white font-bold px-4 py-2 rounded-lg"
              >
                <BookOpen className="w-3.5 h-3.5" aria-hidden />
                Ler a ficha
              </Link>
            </>
          )}
          {estudo.status === 'revisao_recompensada' && (
            <p>Revisão de {plantaData.planta}: +{estudo.moedas} moedas.</p>
          )}
          {estudo.status === 'revisao_ja_recompensada' && (
            <p>
              A revisão de {plantaData.planta} já rendeu moedas hoje (concluir o estudo também conta como a
              revisão do dia). Amanhã revisar rende de novo.
            </p>
          )}
        </div>

        {recompensa !== 'falhou' && (
          <div className="w-full bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-center gap-3 mb-6">
            <div className="text-left">
              <div className="text-xs font-bold text-orange-900">
                {recompensa === 'treino' ? 'Ofensiva de hoje já garantida' : 'Ofensiva mantida!'}
              </div>
              <div className="text-[11px] text-orange-700">
                Você está a <strong>{ofensiva} {rotuloDias}</strong> aprendendo sem parar.
              </div>
            </div>
          </div>
        )}

        <div className="w-full space-y-2.5">
          <button
            onClick={onHome}
            className="w-full py-4 bg-green-main text-white rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Continuar para o início
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
