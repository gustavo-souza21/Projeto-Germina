/* ============================================================================
   NOME CIENTÍFICO — separação binômio / autor

   Convenção botânica: o binômio (Gênero + espécie, e o marcador de híbrido
   "x" quando existe) vai em itálico; a citação de autor (e qualquer nota de
   sinonímia entre parênteses) vai em texto normal, logo depois.

   `data/plantasData.ts` guarda os dois juntos num único campo `nome_cientifico`
   (ex.: "Kalanchoe pinnata Lam. (antiga Bryophyllum pinnatum)"), então a
   separação é feita aqui na leitura, sem duplicar dado.

   Regra: as duas primeiras palavras são o binômio — três palavras quando a
   segunda é o marcador de híbrido "x" (ex.: "Mentha x piperita"). Tudo o que
   vier depois é autor/nota, renderizado sem itálico.
   ========================================================================= */

export interface NomeCientificoPartes {
  /** Gênero + espécie (e "x" de híbrido, quando houver). Vai em itálico. */
  binomio: string;
  /** Autor + notas de sinonímia, se houver. Vai em texto normal. */
  resto: string;
}

export function parseNomeCientifico(nomeCientifico: string): NomeCientificoPartes {
  const partes = nomeCientifico.trim().split(/\s+/);
  const fimBinomio = partes[1] === 'x' && partes.length > 2 ? 3 : 2;

  return {
    binomio: partes.slice(0, fimBinomio).join(' '),
    resto: partes.slice(fimBinomio).join(' '),
  };
}
