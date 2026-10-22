'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, Star, X } from 'lucide-react';
import { PlantaCatalogo } from '../../lib/types';
import { AneisCanteiro } from './AneisCanteiro';
import { ECONOMIA } from '../../lib/economia';

/** Uma espécie estudada e quantas sementes dela o usuário tem. */
export interface OpcaoPlantio {
  planta: PlantaCatalogo;
  sementes: number;
}

/**
 * ESTADO 2 — VAZIO
 *
 * Terra preparada e vazia. Clicar no canteiro abre a lista de espécies já
 * estudadas ali mesmo — a escolha acontece onde a ação acontece, e o estado é
 * local (antes havia um <select> global no topo da tela compartilhado pelos
 * oito canteiros, embora só um receba a planta).
 *
 * O canteiro inteiro é o alvo de clique, não um botão pequeno: numa cena com
 * elipses de ~120px, um botão dentro do anel ficaria minúsculo no celular.
 */
export function CanteiroVazio({
  opcoes,
  moedas,
  podePlantar,
  motivoBloqueio,
  onPlantar,
}: {
  opcoes: OpcaoPlantio[];
  moedas: number;
  podePlantar: boolean;
  motivoBloqueio?: string;
  onPlantar: (plantaId: string, comprar: boolean) => void;
}) {
  const podeComprar = moedas >= ECONOMIA.semente_preco;
  const [escolhendo, setEscolhendo] = useState(false);
  const painelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!escolhendo) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEscolhendo(false);
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [escolhendo]);

  useEffect(() => {
    if (escolhendo) painelRef.current?.focus();
  }, [escolhendo]);

  return (
    <div className="relative w-full">
      <AneisCanteiro variante="ativo" className="w-full h-auto" />

      <button
        type="button"
        onClick={() => setEscolhendo(true)}
        disabled={!podePlantar}
        title={motivoBloqueio}
        className="absolute inset-0 flex items-center justify-center -translate-y-[10%] disabled:cursor-not-allowed group"
        aria-label={
          podePlantar ? 'Plantar neste canteiro' : `Indisponível: ${motivoBloqueio ?? ''}`
        }
      >
        <span className="w-[22%] aspect-square rounded-full border-2 border-dashed border-white/45 flex items-center justify-center group-hover:border-white/80 group-disabled:border-white/25 transition-colors">
          <Plus className="w-3/5 h-auto text-white/70 group-disabled:text-white/35" strokeWidth={2.5} aria-hidden />
        </span>
      </button>

      {/* QA-10 — mesmo problema do estado bloqueado, e pior: o motivo
          ("Estude uma planta na Biblioteca") mede ~175px contra ~96px de
          canteiro. O texto longo fica para sm+; no mobile, uma versão curta.
          O motivo completo permanece no `title` e no aria-label do botão. */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-[30%] w-full sm:w-[118%] text-center">
        <span className="inline-block max-w-full text-[10px] sm:text-[11px] font-semibold text-white/95 bg-green-deep/85 rounded-full px-2 sm:px-2.5 py-0.5 leading-tight truncate align-bottom">
          {podePlantar ? (
            'Espaço livre'
          ) : (
            <>
              <span className="sm:hidden" aria-hidden>
                Indisponível
              </span>
              <span className="hidden sm:inline" aria-hidden>
                {motivoBloqueio ?? 'Indisponível'}
              </span>
              <span className="sr-only">{motivoBloqueio ?? 'Indisponível'}</span>
            </>
          )}
        </span>
      </div>

      {/* Seletor de espécie */}
      {escolhendo && (
        <div
          ref={painelRef}
          tabIndex={-1}
          role="group"
          aria-label="Escolher espécie para plantar"
          className="absolute z-30 left-1/2 -translate-x-1/2 top-0 w-56 max-h-64 overflow-y-auto bg-card-bg rounded-xl shadow-card-hover border border-black/[0.06] p-2"
        >
          <div className="flex items-center justify-between gap-2 mb-1.5 px-0.5">
            <p className="text-[11px] font-semibold text-green-deep">O que plantar?</p>
            <button
              type="button"
              onClick={() => setEscolhendo(false)}
              className="p-0.5 rounded text-ink-muted hover:bg-black/[0.05]"
              aria-label="Cancelar"
            >
              <X className="w-3.5 h-3.5" aria-hidden />
            </button>
          </div>

          {/* Custo SEMPRE visível antes da confirmação (spec 1.3 e 1.4): com
              semente, plantar é gratuito; sem semente, a opção mostra o preço. */}
          <ul className="space-y-0.5">
            {opcoes.map(({ planta: especie, sementes }) => {
              const temSemente = sementes >= 1;
              const desabilitado = !temSemente && !podeComprar;
              return (
                <li key={especie.id}>
                  <button
                    type="button"
                    disabled={desabilitado}
                    onClick={() => {
                      onPlantar(especie.id, !temSemente);
                      setEscolhendo(false);
                    }}
                    className="w-full text-left text-[11px] font-medium text-green-deep px-2 py-1.5 rounded-lg hover:bg-surface-alt disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="truncate">{especie.nome_popular}</span>
                      {especie.is_renisus && (
                        <Star
                          className="w-3 h-3 text-green-main shrink-0"
                          fill="currentColor"
                          aria-label="Espécie RENISUS"
                        />
                      )}
                    </span>
                    <span className="block text-[10px] text-ink-muted font-normal">
                      {temSemente
                        ? `Plantio gratuito · ${sementes} ${sementes === 1 ? 'semente' : 'sementes'}`
                        : podeComprar
                          ? `Sem semente · comprar por ${ECONOMIA.semente_preco} moedas`
                          : `Sem semente · custa ${ECONOMIA.semente_preco} moedas`}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
