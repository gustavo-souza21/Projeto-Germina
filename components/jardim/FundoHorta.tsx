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

   PROFUNDIDADE SEM HORIZONTE (pedido da Sarah, 22/10/2026)
   O cenário não tem mais céu nem montanhas: a base é um chão verde contínuo.
   A sensação de profundidade vem só de VARIAÇÃO DE TOM E DE ESCALA — gramado
   mais claro e frio ao fundo (topo), mais escuro e quente à frente; folhagens
   pequenas e claras atrás, maiores e mais escuras perto do observador. É
   assim que a pintura resolve, e sai de graça em SVG, sem desfoque.

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

      {/* ---- Gramado: chão verde contínuo, da borda de cima à de baixo ---- */}
      <rect width="1200" height="760" fill="url(#fh-campo)" />

      {/* ---- Folhagem do fundo: faixa irregular de moitas baixas e claras no
             topo, no lugar da antiga linha de árvores sob as montanhas. Dá o
             "fundo" da cena sem criar horizonte. ---- */}
      <g fill={P.arvores.distante} opacity="0.55">
        {[30, 120, 210, 300, 395, 480, 570, 660, 750, 840, 930, 1020, 1110, 1190].map((x, i) => (
          <ellipse key={x} cx={x} cy={18 + (i % 3) * 7} rx={52} ry={26} />
        ))}
      </g>
      <g fill={P.arvores.proxima} opacity="0.45">
        {[75, 165, 255, 350, 440, 525, 615, 705, 795, 885, 975, 1065, 1150].map((x, i) => (
          <ellipse key={x} cx={x} cy={40 + (i % 2) * 6} rx={34} ry={18} />
        ))}
      </g>

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
          [70, 158, 15], [250, 150, 12], [430, 164, 14], [610, 152, 11],
          [790, 166, 15], [960, 154, 12], [1130, 162, 14],
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
        {Array.from({ length: 120 }, (_, i) => {
          const x = ((i * 137) % 1200) + ((i % 7) * 9);
          const y = 70 + ((i * 61) % 670);
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
          const y = 80 + ((i * 97) % 650);
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
