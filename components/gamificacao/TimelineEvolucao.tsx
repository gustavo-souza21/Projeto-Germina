'use client';

import { useEffect, useRef } from 'react';
import { NIVEIS_EVOLUCAO } from '../../data/plantasData';
import { resolverIcone } from '../../lib/icones';
import { BadgeHexagonal } from './BadgeHexagonal';
import { Check, Lock } from 'lucide-react';
import { cn } from '../../lib/cn';

/* ============================================================================
   GER-UI-09 — TIMELINE DE EVOLUÇÃO

   `NIVEIS_EVOLUCAO` existia desde o começo do projeto e era importado em três
   arquivos — mas SEMPRE só para dar `.find()` no nível atual. A trilha
   horizontal, que aparece em três telas diferentes da referência ("Sua
   jornada", "Jornada do Conhecimento" e o infográfico institucional), nunca
   tinha sido renderizada.

   Três estados por nó, como no protótipo:
     concluído  → badge colorido + check verde no conector
     atual      → badge com halo, escala maior, rótulo em destaque
     bloqueado  → badge dessaturado + cadeado

   No mobile a trilha rola horizontalmente e centraliza o nível atual no mount.
   Com 8 níveis isso deixou de ser luxo: eles não cabem numa tela de 380px, e
   sem o scroll automático o usuário abriria a tela sempre vendo o nível 1.
   ========================================================================= */

interface TimelineEvolucaoProps {
  nivelAtual: number;
  /** Compacta espaçamentos — use dentro de cards estreitos. */
  compacto?: boolean;
  className?: string;
}

export function TimelineEvolucao({
  nivelAtual,
  compacto = false,
  className,
}: TimelineEvolucaoProps) {
  const trilhaRef = useRef<HTMLOListElement>(null);
  const atualRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const no = atualRef.current;
    const trilha = trilhaRef.current;
    if (!no || !trilha) return;

    // scrollIntoView moveria a PÁGINA inteira além do container. Ajustar o
    // scrollLeft do próprio container mantém o resto da tela parada.
    const alvo = no.offsetLeft - trilha.clientWidth / 2 + no.clientWidth / 2;
    trilha.scrollTo({ left: Math.max(0, alvo), behavior: 'smooth' });
  }, [nivelAtual]);

  return (
    <ol
      ref={trilhaRef}
      className={cn(
        'flex items-start overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2',
        compacto ? 'gap-1' : 'gap-2 sm:gap-3',
        className
      )}
      aria-label="Trilha de evolução"
    >
      {NIVEIS_EVOLUCAO.map((nivel, indice) => {
        const concluido = nivel.nivel < nivelAtual;
        const atual = nivel.nivel === nivelAtual;
        const bloqueado = nivel.nivel > nivelAtual;
        const ultimo = indice === NIVEIS_EVOLUCAO.length - 1;

        return (
          <li
            key={nivel.nivel}
            ref={atual ? atualRef : undefined}
            className={cn(
              'flex flex-col items-center shrink-0 snap-center',
              compacto ? 'w-[76px]' : 'w-[88px]'
            )}
            aria-current={atual ? 'step' : undefined}
          >
            {/* Badge + conector. O conector fica na mesma linha do badge, o que
                exige posicioná-lo absoluto para não empurrar o layout. */}
            <div className="relative flex items-center justify-center w-full">
              {!ultimo && (
                <span
                  className={cn(
                    'absolute left-1/2 top-1/2 -translate-y-1/2 h-[3px] w-full rounded-full',
                    concluido ? 'bg-green-main' : 'bg-locked/40'
                  )}
                  aria-hidden
                />
              )}

              <div className="relative z-10">
                <BadgeHexagonal
                  icone={resolverIcone(nivel.icone)}
                  tamanho={compacto ? 'sm' : 'md'}
                  bloqueado={bloqueado}
                  destacado={atual}
                  rotulo={`Nível ${nivel.nivel}: ${nivel.nome}${
                    concluido ? ' (concluído)' : atual ? ' (atual)' : ' (bloqueado)'
                  }`}
                />

                {concluido && (
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-main ring-2 ring-bg-base flex items-center justify-center"
                    aria-hidden
                  >
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3.5} />
                  </span>
                )}

                {bloqueado && !compacto && (
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-locked ring-2 ring-bg-base flex items-center justify-center"
                    aria-hidden
                  >
                    <Lock className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </span>
                )}
              </div>
            </div>

            <p
              className={cn(
                'text-center leading-tight mt-2 px-0.5',
                compacto ? 'text-[10px]' : 'text-[11px]',
                atual ? 'font-bold text-green-deep' : 'font-medium text-ink-muted'
              )}
            >
              {nivel.nome}
            </p>
            <p className="text-[10px] text-ink-muted/70 mt-0.5">Nível {nivel.nivel}</p>
          </li>
        );
      })}
    </ol>
  );
}
