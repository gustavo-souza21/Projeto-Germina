import Link from 'next/link';
import { PlantaComQuiz } from '../../lib/types';
import { ShieldCheck, Flame, Play, Check, BookOpen } from 'lucide-react';
import { ECONOMIA } from '../../lib/economia';

/** Situação do estudo (ficha + quiz) de uma espécie para este usuário. */
export type SituacaoEstudo = 'nao_iniciado' | 'ficha_lida' | 'concluido';

interface StartScreenProps {
  plantaData: PlantaComQuiz;
  /** Vem do catálogo (PLANTAS_CATALOGO), não do banco de perguntas — fonte única da verdade. */
  isRenisus: boolean;
  /** XP do catálogo para concluir o estudo desta espécie. */
  xpEstudo: number;
  /** Link para a ficha desta espécie na Biblioteca. */
  hrefFicha: string;
  allPlants: PlantaComQuiz[];
  selectedPlantIndex: number;
  onSelectPlant: (index: number) => void;
  situacaoDe: (plantaId: string) => SituacaoEstudo;
  /** A revisão desta espécie já rendeu moedas hoje (a conclusão do estudo também conta). */
  revisaoPagaHoje: (plantaId: string) => boolean;
  /** Ofensiva já validada por data (ofensivaVigente). */
  ofensiva: number;
  jaCompletouHoje: boolean;
  xpDesafio: number;
  moedasDesafio: number;
  onStart: () => void;
}

export function StartScreen({
  plantaData,
  isRenisus,
  xpEstudo,
  hrefFicha,
  allPlants,
  selectedPlantIndex,
  onSelectPlant,
  situacaoDe,
  revisaoPagaHoje,
  ofensiva,
  jaCompletouHoje,
  xpDesafio,
  moedasDesafio,
  onStart,
}: StartScreenProps) {
  const situacao = situacaoDe(plantaData.planta_id);

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Abas de seleção de planta */}
      {/* 15 espécies não cabem numa linha só: rolagem horizontal em vez de flex-1 espremido. */}
      <div className="bg-card-bg p-1.5 rounded-2xl border border-black/[0.08] flex gap-1 overflow-x-auto">
        {allPlants.map((plantItem, idx) => {
          const concluida = situacaoDe(plantItem.planta_id) === 'concluido';
          return (
            <button
              key={plantItem.planta_id}
              onClick={() => onSelectPlant(idx)}
              className={`shrink-0 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                selectedPlantIndex === idx
                  ? 'bg-green-main text-white'
                  : 'text-ink-muted hover:bg-surface-alt'
              }`}
            >
              {concluida && <Check className="w-3 h-3" aria-label="Estudo concluído" />}
              <span>{plantItem.planta}</span>
            </button>
          );
        })}
      </div>

      {/* Card principal */}
      <div className="bg-card-bg rounded-2xl border border-black/[0.08] p-6 flex flex-col items-center text-center">
        <div className="space-y-1 mb-2">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[11px] font-bold text-green-deep bg-green-soft/40 px-2 py-0.5 rounded">
              Quiz da espécie
            </span>
            {isRenisus && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3 h-3 text-teal-700" /> RENISUS
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-green-deep tracking-tight">
            {plantaData.planta}
          </h2>
        </div>

        <div className="w-full space-y-2 mb-4 text-left mt-3">
          <div className="flex justify-between items-center text-xs py-1.5 border-b border-black/[0.06] font-medium text-ink-muted">
            <span>Questões</span>
            <span className="font-bold text-blue-deep">{plantaData.desafios.length} perguntas</span>
          </div>
          <div className="flex justify-between items-center text-xs py-1.5 border-b border-black/[0.06] font-medium text-ink-muted">
            <span>Dificuldade</span>
            <span className="text-blue-main font-bold">Fácil, médio e difícil</span>
          </div>
          <div className="flex justify-between items-center text-xs py-1.5 border-b border-black/[0.06] font-medium text-ink-muted">
            <span>Ofensiva diária</span>
            <span className="text-orange-600 font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              {ofensiva} {ofensiva === 1 ? 'dia' : 'dias'}
            </span>
          </div>
        </div>

        {/* Recompensas anunciadas ANTES da atividade (spec 1.3). Dois eventos
            independentes: o Desafio do dia e o estudo desta espécie. */}
        <div className="w-full text-left space-y-2 mb-5">
          <div className="rounded-xl bg-surface-alt border border-black/[0.06] p-3 text-[11px] leading-snug">
            <p className="font-bold text-green-deep">Estudo de {plantaData.planta}</p>
            {situacao === 'concluido' && (
              <p className="text-ink-muted mt-0.5">
                {revisaoPagaHoje(plantaData.planta_id) ? (
                  <>Já concluído. A revisão de hoje já foi paga; amanhã revisar rende <strong>+{ECONOMIA.revisao_moedas} moedas</strong> de novo.</>
                ) : (
                  <>Já concluído. Revisar hoje rende <strong>+{ECONOMIA.revisao_moedas} moedas</strong> (uma vez por dia).</>
                )}
              </p>
            )}
            {situacao === 'ficha_lida' && (
              <p className="text-ink-muted mt-0.5">
                Ficha lida. Concluindo o quiz você ganha <strong>+{xpEstudo} XP</strong>,{' '}
                <strong>+{ECONOMIA.estudo_moedas} moedas</strong> e a <strong>semente de {plantaData.planta}</strong>.
              </p>
            )}
            {situacao === 'nao_iniciado' && (
              <p className="text-ink-muted mt-0.5">
                Para ganhar a semente, leia antes a ficha da espécie.{' '}
                <Link
                  href={hrefFicha}
                  className="font-bold text-green-deep underline inline-flex items-center gap-0.5"
                >
                  <BookOpen className="w-3 h-3" aria-hidden />
                  Abrir a ficha
                </Link>
              </p>
            )}
          </div>

          <div className="rounded-xl bg-surface-alt border border-black/[0.06] p-3 text-[11px] leading-snug">
            <p className="font-bold text-green-deep">Desafio do dia</p>
            <p className="text-ink-muted mt-0.5">
              {jaCompletouHoje ? (
                <>Já concluído hoje. Esta rodada não rende XP do desafio; volte amanhã para manter a ofensiva.</>
              ) : (
                <>
                  O primeiro quiz do dia, de qualquer espécie, rende até <strong>{xpDesafio} XP</strong> e{' '}
                  <strong>{moedasDesafio} moedas</strong>.
                </>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full py-4 bg-green-main text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-base active:scale-[0.98]"
        >
          <Play className="w-5 h-5 fill-white" />
          {situacao === 'concluido' && jaCompletouHoje ? 'Refazer o quiz' : 'Começar o quiz'}
        </button>
      </div>
    </div>
  );
}
