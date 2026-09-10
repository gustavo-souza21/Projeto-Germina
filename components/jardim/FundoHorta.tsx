import { PALETA_JARDIM as P } from '../../lib/paletaJardim';

/** Reaproveita as cores de `P.flor` (mesma paleta das flores desenhadas em
    `IlustracaoPlanta.tsx`) só para variedade nas florzinhas silvestres do
    fundo — não tem relação com a categoria de nenhuma espécie aqui. */
const CORES_FLOR_SILVESTRE = Object.values(P.flor);

/* ============================================================================
   FUNDO DA HORTA — cenário em SVG plano

   PERFORMANCE (diretriz 1)
   Nenhum `filter`, `blur` ou `backdrop-filter`. `blur-3xl` força o navegador a
   rasterizar a camada e reprocessá-la a cada repaint — barato num MacBook,
   caro num Android de entrada, que é o aparelho do público em Itacoatiara.
   Todo o relevo aqui é `<path>` + gradiente, que o GPU compõe sem custo extra.

   A profundidade atmosférica (montanhas azuladas ao fundo, terra quente na
   frente) é obtida por VARIAÇÃO DE MATIZ E SATURAÇÃO entre as camadas, não por
   desfoque — é assim que a pintura resolve, e sai de graça em SVG.

   ARQUITETURA (diretriz 2)
   Todo o cenário vive aqui. O JardimConhecimento não conhece nenhuma div de
   paisagem. Se um dia entrar uma ilustração rasterizada, troca-se o conteúdo
   DESTE arquivo por uma <Image /> e nada mais no Jardim muda.

   As cores vêm de lib/paletaJardim.ts — nenhum hex literal neste arquivo.
   ========================================================================= */
export function FundoHorta({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 760"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id="fh-ceu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={P.ceu.topo} />
          <stop offset="55%" stopColor={P.ceu.meio} />
          <stop offset="100%" stopColor={P.ceu.horizonte} />
        </linearGradient>

        {/* Gramado: mais claro e frio ao fundo, mais escuro e quente à frente. */}
        <linearGradient id="fh-campo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={P.grama.fundo} />
          <stop offset="45%" stopColor={P.grama.meio} />
          <stop offset="100%" stopColor={P.grama.frente} />
        </linearGradient>

        <linearGradient id="fh-caminho" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={P.caminho.claro} />
          <stop offset="100%" stopColor={P.caminho.escuro} />
        </linearGradient>

        {/* Luz difusa do alto — substitui o antigo overlay branco com blur. */}
        <radialGradient id="fh-luz" cx="50%" cy="6%" r="72%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ---- Céu ----
             Horizonte alto de propósito: o céu ocupa ~25% da altura, não 40%.
             A referência é quase toda jardim, e área grande de céu (matiz de
             baixa saturação por natureza) derruba a vivacidade percebida da
             cena inteira. Subir o horizonte devolve espaço ao verde.
             Todo o bloco de fundo é deslocado por um único transform — para
             reverter, basta trocar o valor abaixo. ---- */}
      <rect y="-90" width="1200" height="300" fill="url(#fh-ceu)" />

      <g transform="translate(0,-90)">
      {/* ---- Montanhas: azul-ardósia, a distante mais clara ---- */}
      <path
        d="M0 246 L120 214 L214 240 L318 202 L430 238 L512 218 L604 244 L700 208 L806 240 L910 216 L1024 242 L1120 222 L1200 244 L1200 300 L0 300 Z"
        fill={P.montanha.distante}
      />
      <path
        d="M0 266 L96 240 L206 262 L300 234 L410 260 L520 242 L640 266 L742 238 L860 262 L980 240 L1100 264 L1200 244 L1200 310 L0 310 Z"
        fill={P.montanha.proxima}
      />

      {/* ---- Linha de árvores ---- */}
      <g fill={P.arvores.distante}>
        {[40, 130, 215, 300, 390, 470, 560, 650, 740, 830, 915, 1000, 1090, 1170].map(
          (x, i) => (
            <ellipse key={x} cx={x} cy={286 - (i % 3) * 6} rx={46} ry={30} />
          )
        )}
      </g>
      <g fill={P.arvores.proxima}>
        {[85, 175, 258, 345, 430, 515, 605, 695, 785, 872, 958, 1045, 1132].map((x, i) => (
          <ellipse key={x} cx={x} cy={298 - (i % 2) * 5} rx={40} ry={26} />
        ))}
      </g>

      </g>

      {/* ---- Gramado ---- */}
      <rect y="206" width="1200" height="554" fill="url(#fh-campo)" />

      {/* ---- Caminhos de terra ---- */}
      <path
        d="M-40 330 C 220 306, 420 350, 660 330 S 1060 308, 1240 334 L1240 366 C 1060 340, 880 378, 660 362 S 220 336, -40 362 Z"
        fill="url(#fh-caminho)"
        opacity="0.9"
      />
      <path
        d="M-40 508 C 260 476, 500 528, 760 502 S 1080 474, 1240 504 L1240 552 C 1080 522, 900 574, 760 546 S 260 524, -40 548 Z"
        fill="url(#fh-caminho)"
        opacity="0.88"
      />

      {/* ---- Arbustos: densidade e escuridão crescem em direção ao observador ---- */}
      <g fill={P.arbusto.distante} opacity="0.9">
        {[
          [70, 268, 15], [250, 262, 12], [430, 274, 14], [610, 264, 11],
          [790, 276, 15], [960, 266, 12], [1130, 274, 14],
        ].map(([cx, cy, r]) => (
          <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={r} ry={r * 0.6} />
        ))}
      </g>
      <g fill={P.arbusto.meio} opacity="0.9">
        {[
          [140, 420, 22], [340, 436, 19], [540, 414, 24], [720, 440, 20],
          [900, 418, 23], [1080, 436, 20],
        ].map(([cx, cy, r]) => (
          <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={r} ry={r * 0.6} />
        ))}
      </g>
      <g fill={P.arbusto.proximo} opacity="0.92">
        {[
          [60, 690, 34], [280, 712, 29], [520, 698, 36], [760, 716, 30],
          [1000, 696, 34], [1160, 714, 28],
        ].map(([cx, cy, r]) => (
          <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={r} ry={r * 0.55} />
        ))}
      </g>

      {/* ---- Tufos de capim: textura do gramado.
             Distribuição pseudoaleatória DETERMINÍSTICA — Math.random() geraria
             markup diferente no servidor e no cliente, quebrando a hidratação. */}
      <g stroke={P.capim} strokeWidth="2.5" strokeLinecap="round" opacity="0.6">
        {Array.from({ length: 90 }, (_, i) => {
          const x = ((i * 137) % 1200) + ((i % 7) * 9);
          const y = 250 + ((i * 61) % 490);
          const h = 6 + ((i * 13) % 9);
          return <path key={i} d={`M${x} ${y} l${(i % 3) - 1} -${h}`} />;
        })}
      </g>

      {/* ---- Florzinhas silvestres: pontuam o gramado pra "florear" a cena,
             mesma técnica de desenho das flores do canteiro (pétalas em
             elipse rotacionadas + miolo) e mesma distribuição determinística
             dos tufos de capim acima (sem Math.random, pra não quebrar
             hidratação SSR/cliente). ---- */}
      <g opacity="0.85">
        {Array.from({ length: 46 }, (_, i) => {
          const x = ((i * 173) % 1200) + ((i % 5) * 11);
          const y = 250 + ((i * 97) % 480);
          const r = 3 + (i % 3);
          const cor = CORES_FLOR_SILVESTRE[i % CORES_FLOR_SILVESTRE.length];
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              {[0, 72, 144, 216, 288].map((ang) => (
                <ellipse
                  key={ang}
                  cy={-r * 0.85}
                  rx={r * 0.42}
                  ry={r * 0.85}
                  fill={cor}
                  transform={`rotate(${ang})`}
                />
              ))}
              <circle r={r * 0.42} fill={P.miolo} />
            </g>
          );
        })}
      </g>

      {/* ---- Luz ambiente ---- */}
      <rect width="1200" height="760" fill="url(#fh-luz)" />
    </svg>
  );
}
