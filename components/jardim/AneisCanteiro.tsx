'use client';

import { useId } from 'react';
import { PALETA_JARDIM as P } from '../../lib/paletaJardim';

/* ============================================================================
   ANEL DE PEDRAS DO CANTEIRO

   A referência mostra uma ELIPSE (proporção ~2,2:1), não um círculo — é vista
   de cima em ângulo. `rounded-full` num quadrado daria círculo e quebraria a
   perspectiva da cena inteira.

   O anel de pedras individuais é feito com `stroke-dasharray` sobre a elipse:
   cada traço vira uma pedra, e o espaçamento vira a argamassa. Resolve em uma
   linha o que seriam ~24 elementos posicionados por trigonometria, e escala
   sozinho.

   `useId()` é obrigatório aqui: são 8 canteiros na tela, cada um com seus
   gradientes. IDs fixos colidiriam e todos herdariam o preenchimento do
   primeiro que o navegador encontrasse.
   ========================================================================= */

export function AneisCanteiro({
  variante,
  className,
}: {
  /** 'ativo' = canteiro disponível; 'inerte' = bloqueado (terra fria, pedra dessaturada). */
  variante: 'ativo' | 'inerte';
  className?: string;
}) {
  const id = useId();
  const solo = `${id}-solo`;
  const pedra = `${id}-pedra`;

  const inerte = variante === 'inerte';
  const cor = inerte ? P.canteiroInerte : P.canteiro;

  return (
    <svg
      viewBox="0 0 200 108"
      className={className}
      aria-hidden
      focusable="false"
      overflow="visible"
    >
      <defs>
        <radialGradient id={solo} cx="50%" cy="38%" r="62%">
          <stop offset="0%" stopColor={cor.soloClaro} />
          <stop offset="100%" stopColor={cor.soloEscuro} />
        </radialGradient>
        <linearGradient id={pedra} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={cor.pedraClara} />
          <stop offset="100%" stopColor={cor.pedraEscura} />
        </linearGradient>
      </defs>

      {/* Sombra de contato no chão */}
      <ellipse cx="100" cy="92" rx="88" ry="15" fill="#000000" opacity="0.16" />

      {/* Terra */}
      <ellipse cx="100" cy="60" rx="78" ry="35" fill={`url(#${solo})`} />

      {/* Anel de pedras — cada traço do dash é uma pedra */}
      <ellipse
        cx="100"
        cy="60"
        rx="84"
        ry="38"
        fill="none"
        stroke={`url(#${pedra})`}
        strokeWidth="12"
        strokeDasharray="13 4.5"
        strokeLinecap="butt"
      />

      {/* Realce superior das pedras, para dar volume sem usar filtro */}
      <ellipse
        cx="100"
        cy="58"
        rx="84"
        ry="38"
        fill="none"
        stroke="#ffffff"
        strokeOpacity={inerte ? 0.1 : 0.18}
        strokeWidth="2.5"
        strokeDasharray="13 4.5"
        strokeLinecap="butt"
      />
    </svg>
  );
}
