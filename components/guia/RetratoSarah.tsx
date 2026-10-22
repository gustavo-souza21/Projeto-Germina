/* ============================================================================
   RETRATO DA SARAH — PLACEHOLDER

   ATENÇÃO: PONTO ÚNICO DE TROCA DA ARTE

   Este é o ÚNICO arquivo que precisa mudar quando a ilustração real da Sarah
   existir. Nenhum outro componente sabe como ela é desenhada — todos só
   montam <RetratoSarah />.

   Para trocar por uma imagem:

     import Image from 'next/image';
     export function RetratoSarah({ className }: { className?: string }) {
       return (
         <Image
           src="/sarah.png"        // colocar em public/
           alt="Sarah, curadora do acervo"
           width={240} height={320}
           className={className}
           priority
         />
       );
     }

   O desenho abaixo é deliberadamente simples e geométrico: um retrato chapado
   em SVG, nas cores do app (verde-fundo, azul-detalhe), que sugere a
   personagem sem fingir ser a ilustração final. É melhor um placeholder que
   se assume placeholder do que um desenho meia-boca que alguém confunda com
   arte definitiva e esqueça de trocar.

   Proporção 3:4, pensado para ancorar no canto inferior esquerdo da tela.
   ========================================================================= */

export function RetratoSarah({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 160"
      className={className}
      role="img"
      aria-label="Sarah, curadora do acervo do GERMINA"
    >
      {/* Fundo circular suave, para destacar do cenário do app */}
      <circle cx="60" cy="72" r="56" className="fill-green-soft/40" />

      {/* Cabelo — camada de trás */}
      <path
        d="M24 66c0-22 16-38 36-38s36 16 36 38c0 14-3 24-6 34H30c-3-10-6-20-6-34z"
        className="fill-[#8a4b2a]"
      />

      {/* Rosto */}
      <ellipse cx="60" cy="68" rx="24" ry="28" className="fill-[#f2c6a0]" />

      {/* Olhos */}
      <ellipse cx="51" cy="66" rx="3.2" ry="4" className="fill-blue-deep" />
      <ellipse cx="69" cy="66" rx="3.2" ry="4" className="fill-blue-deep" />

      {/* Sorriso */}
      <path
        d="M52 80c3 4 13 4 16 0"
        className="stroke-[#b5714a]"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Cabelo — mechas da frente, por cima do rosto */}
      <path
        d="M36 60c2-18 12-30 24-30s22 12 24 30c-4-10-12-16-24-16s-20 6-24 16z"
        className="fill-[#a85c33]"
      />

      {/* Tronco / avental de campo */}
      <path
        d="M30 160c0-24 12-38 30-38s30 14 30 38z"
        className="fill-green-deep"
      />
      {/* Gola */}
      <path d="M52 124c3 6 13 6 16 0" className="fill-green-soft" />

      {/* Folha na lapela — ela é a curadora do acervo */}
      <path
        d="M74 140c-6 0-10-4-10-9 5 0 10 3 10 9z"
        className="fill-green-soft"
      />
    </svg>
  );
}
