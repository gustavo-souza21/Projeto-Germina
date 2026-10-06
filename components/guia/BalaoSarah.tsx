'use client';

import { useEffect, useState } from 'react';
import { RetratoSarah } from './RetratoSarah';
import { X } from 'lucide-react';

/* ============================================================================
   O BALÃO DA SARAH

   A peça visual do guia: retrato ancorado no canto inferior esquerdo, balão
   de fala ao lado, e — quando a fala aponta para algo — um anel destacando o
   elemento na tela.

   DUAS DECISÕES DE COMPORTAMENTO QUE VALEM EXPLICAÇÃO

   1. NÃO BLOQUEIA O APP. Diferente de um tutorial modal, não há overlay
      cobrindo a tela nem clique capturado: a pessoa pode ignorar a Sarah e
      continuar usando o app normalmente. Quem já sabe onde está não deve ser
      obrigado a clicar "próximo" três vezes para seguir.

   2. O DESTAQUE FALHA EM SILÊNCIO. Se o elemento apontado não estiver na
      tela (layout diferente no celular, canteiro ainda bloqueado, lista
      vazia), o anel simplesmente não aparece e a fala continua. Guia que
      quebra a tela por não achar um elemento é pior do que guia nenhum.
   ========================================================================= */

interface Retangulo {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Acompanha a posição do elemento marcado com `data-guia="<chave>"`.
 *
 * Remede em scroll e resize porque a pessoa pode rolar a página com a Sarah
 * falando — o anel precisa seguir o elemento, não ficar para trás.
 */
function usePosicaoDestaque(chave: string | undefined): Retangulo | null {
  const [area, setArea] = useState<Retangulo | null>(null);

  useEffect(() => {
    if (!chave) {
      setArea(null);
      return;
    }

    const medir = () => {
      const alvo = document.querySelector(`[data-guia="${chave}"]`);
      if (!alvo) {
        setArea(null);
        return;
      }
      const r = alvo.getBoundingClientRect();
      // Fora da viewport (rolado para longe): não desenha.
      if (r.bottom < 0 || r.top > window.innerHeight) {
        setArea(null);
        return;
      }
      setArea({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    medir();
    window.addEventListener('scroll', medir, { passive: true });
    window.addEventListener('resize', medir);
    return () => {
      window.removeEventListener('scroll', medir);
      window.removeEventListener('resize', medir);
    };
  }, [chave]);

  return area;
}

export function BalaoSarah({
  baloes,
  destaque,
  onFechar,
}: {
  baloes: string[];
  destaque?: string;
  /** Chamado quando a pessoa termina ou dispensa a fala. */
  onFechar: () => void;
}) {
  const [indice, setIndice] = useState(0);
  const area = usePosicaoDestaque(destaque);

  const ultimo = indice === baloes.length - 1;
  const texto = baloes[indice];

  const avancar = () => {
    if (ultimo) onFechar();
    else setIndice((i) => i + 1);
  };

  // Esc dispensa — atalho esperado de qualquer coisa sobreposta.
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar();
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [onFechar]);

  return (
    <>
      {/* Anel de destaque — `pointer-events-none` para não roubar o clique do
          elemento que ele está justamente mandando a pessoa clicar. */}
      {area && (
        <div
          className="fixed z-40 pointer-events-none rounded-2xl ring-4 ring-amber-400 ring-offset-2 ring-offset-transparent animate-pulse"
          style={{
            top: area.top - 4,
            left: area.left - 4,
            width: area.width + 8,
            height: area.height + 8,
          }}
          aria-hidden
        />
      )}

      <div
        className="fixed bottom-0 left-0 right-0 z-40 p-3 pb-24 md:pb-4 pointer-events-none"
        role="status"
        aria-live="polite"
      >
        <div className="max-w-2xl mx-auto md:mx-0 md:ml-4 flex items-end gap-2 pointer-events-auto">
          <RetratoSarah className="w-16 h-[5.33rem] sm:w-20 sm:h-[6.67rem] shrink-0 drop-shadow-lg" />

          <div className="flex-1 min-w-0 bg-card-bg rounded-2xl rounded-bl-sm border border-black/[0.06] shadow-xl p-3.5 pr-10 relative">
            <button
              type="button"
              onClick={onFechar}
              className="absolute top-2 right-2 p-1.5 rounded-lg text-ink-muted hover:bg-black/[0.04] transition-colors"
              aria-label="Dispensar"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2.25} aria-hidden />
            </button>

            <p className="text-[11px] font-bold text-green-main uppercase tracking-wide">Sarah</p>
            <p className="text-sm text-ink leading-snug mt-0.5">{texto}</p>

            <div className="flex items-center justify-between gap-3 mt-2.5">
              {/* Marcadores de progresso — só quando há mais de um balão */}
              <div className="flex items-center gap-1" aria-hidden>
                {baloes.length > 1 &&
                  baloes.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === indice ? 'w-4 bg-green-main' : 'w-1.5 bg-black/15'
                      }`}
                    />
                  ))}
              </div>

              <button
                type="button"
                onClick={avancar}
                className="text-xs font-bold text-white bg-green-deep hover:bg-green-main transition-colors px-3.5 py-1.5 rounded-lg shrink-0"
              >
                {ultimo ? 'Entendi' : 'Continuar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
