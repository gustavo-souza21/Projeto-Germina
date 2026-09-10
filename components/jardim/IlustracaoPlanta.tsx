import { FaseCultivada, PlantaCatalogo } from '../../lib/types';
import { PALETA_JARDIM as P } from '../../lib/paletaJardim';

/* ============================================================================
   ILUSTRAÇÃO DA PLANTA (diretriz 4)

   Cinco desenhos, um por fase de cultivo. A identidade da ESPÉCIE não é
   carregada pelo desenho — é carregada pela pílula com o nome, exatamente como
   na referência. O que o desenho comunica é o ESTÁGIO DE CRESCIMENTO, que é a
   informação que muda com o tempo e é o ponto do jogo.

   O único traço específico da espécie é a cor da flor, derivada da `categoria`
   do catálogo. Assim uma calêndula (digestiva, laranja) e uma camomila
   (calmante, lilás) não florescem iguais, sem precisar de 15 ilustrações.

   Sem `filter` e sem `<image>`: só path e elipse.
   ========================================================================= */

const COR_FLOR = P.flor;
const VERDE_FOLHA = P.planta.folhaEscura;
const VERDE_CLARO = P.planta.folhaClara;
const CAULE = P.planta.caule;

export function IlustracaoPlanta({
  fase,
  categoria = 'Geral',
  className,
}: {
  fase: FaseCultivada;
  categoria?: PlantaCatalogo['categoria'];
  className?: string;
}) {
  const flor = COR_FLOR[categoria];

  // viewBox recortado no conteúdo real do desenho (x 20–100, y 38–112).
  // Com "0 0 120 120" sobrava margem vazia em volta e a planta renderizava
  // pequena dentro do canteiro; na referência ela domina o anel.
  return (
    <svg
      viewBox="20 38 80 74"
      className={className}
      aria-hidden
      focusable="false"
      overflow="visible"
    >
      {fase === 'semente' && (
        // Montinho de terra revolvida — ainda não há parte aérea.
        <>
          <ellipse cx="60" cy="104" rx="17" ry="7" fill={P.terraRevolvida.escura} />
          <ellipse cx="60" cy="101" rx="10" ry="4.5" fill={P.terraRevolvida.clara} />
        </>
      )}

      {fase === 'broto' && (
        <>
          <path d="M60 106 L60 88" stroke={CAULE} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M60 92 C 48 90, 44 80, 54 78 C 60 77, 61 86, 60 92 Z" fill={VERDE_CLARO} />
          <path d="M60 94 C 72 92, 76 83, 66 81 C 60 80, 59 88, 60 94 Z" fill={VERDE_FOLHA} />
        </>
      )}

      {fase === 'muda' && (
        <>
          <path d="M60 108 L60 64" stroke={CAULE} strokeWidth="4" strokeLinecap="round" />
          <path d="M60 96 C 42 94, 34 80, 48 76 C 58 73, 61 88, 60 96 Z" fill={VERDE_FOLHA} />
          <path d="M60 98 C 78 96, 86 82, 72 78 C 62 75, 59 90, 60 98 Z" fill={VERDE_CLARO} />
          <path d="M60 78 C 46 75, 40 63, 52 60 C 60 58, 61 71, 60 78 Z" fill={VERDE_CLARO} />
          <path d="M60 80 C 74 77, 80 65, 68 62 C 60 60, 59 73, 60 80 Z" fill={VERDE_FOLHA} />
          <path d="M60 66 C 52 62, 52 52, 60 50 C 68 52, 68 62, 60 66 Z" fill={VERDE_CLARO} />
        </>
      )}

      {fase === 'flor' && (
        <>
          <path d="M60 108 L60 54" stroke={CAULE} strokeWidth="4" strokeLinecap="round" />
          <path d="M60 98 C 40 96, 32 80, 48 76 C 58 73, 61 89, 60 98 Z" fill={VERDE_FOLHA} />
          <path d="M60 100 C 80 98, 88 82, 72 78 C 62 75, 59 91, 60 100 Z" fill={VERDE_CLARO} />
          <path d="M60 78 C 46 74, 40 62, 52 59 C 60 57, 61 71, 60 78 Z" fill={VERDE_CLARO} />
          <path d="M60 80 C 74 76, 80 64, 68 61 C 60 59, 59 73, 60 80 Z" fill={VERDE_FOLHA} />
          {/* Flor central + duas laterais */}
          {[
            [60, 48, 9],
            [44, 60, 6.5],
            [76, 58, 6.5],
          ].map(([cx, cy, r]) => (
            <g key={`${cx}-${cy}`}>
              {[0, 60, 120, 180, 240, 300].map((ang) => (
                <ellipse
                  key={ang}
                  cx={cx}
                  cy={cy - r * 0.72}
                  rx={r * 0.34}
                  ry={r * 0.72}
                  fill={flor}
                  transform={`rotate(${ang} ${cx} ${cy})`}
                />
              ))}
              <circle cx={cx} cy={cy} r={r * 0.36} fill={P.miolo} />
            </g>
          ))}
        </>
      )}

      {fase === 'pronto' && (
        <>
          <path d="M60 108 L60 46" stroke={CAULE} strokeWidth="4.5" strokeLinecap="round" />
          <path d="M60 100 C 36 98, 26 80, 46 75 C 57 72, 61 90, 60 100 Z" fill={VERDE_FOLHA} />
          <path d="M60 102 C 84 100, 94 82, 74 77 C 63 74, 59 92, 60 102 Z" fill={VERDE_CLARO} />
          <path d="M60 78 C 42 74, 34 60, 50 56 C 59 54, 61 70, 60 78 Z" fill={VERDE_CLARO} />
          <path d="M60 80 C 78 76, 86 62, 70 58 C 61 56, 59 72, 60 80 Z" fill={VERDE_FOLHA} />
          {/* Frutos maduros — o sinal de "pronta para colher" */}
          {[
            [46, 66, 6],
            [74, 62, 6],
            [60, 44, 7],
          ].map(([cx, cy, r]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={flor} />
          ))}
        </>
      )}
    </svg>
  );
}
