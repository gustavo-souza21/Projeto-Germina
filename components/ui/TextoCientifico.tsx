import { Fragment } from 'react';
import { PLANTAS_CATALOGO } from '../../data/plantasData';
import { parseNomeCientifico } from '../../lib/nomeCientifico';

/* ============================================================================
   TEXTO CORRIDO COM NOMES CIENTÍFICOS EM ITÁLICO

   Especificação da Sarah (curadoria): "nomes científicos com gênero iniciado
   por maiúscula e epíteto em minúscula, ambos em itálico". O componente
   <NomeCientifico> já fazia isso no nome da ficha, mas os mesmos nomes
   aparecem DENTRO dos textos — "Quais usos populares registrados para a
   corama (Kalanchoe pinnata (Lam.) Pers.)?" — e ali saíam em texto normal.

   Este componente recebe um texto qualquer e põe em itálico só os binômios
   conhecidos: o de cada espécie do catálogo e os sinônimos citados na própria
   curadoria ("antiga Bryophyllum pinnatum"). A lista vem do catálogo, então
   uma espécie nova entra sozinha. Autor (Lam., Pers.) continua sem itálico.
   ========================================================================= */

function binomiosConhecidos(): string[] {
  const nomes = new Set<string>();
  for (const p of PLANTAS_CATALOGO) {
    const { binomio, resto } = parseNomeCientifico(p.nome_cientifico);
    nomes.add(binomio);
    for (const m of resto.matchAll(/antiga\s+([A-Z][a-z]+\s+[a-z-]+)/g)) nomes.add(m[1]);
  }
  // Mais longos primeiro: "Mentha × piperita" antes de qualquer prefixo.
  return [...nomes].sort((a, b) => b.length - a.length);
}

const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// "×" e "x" valem como o mesmo sinal de híbrido no texto.
const PADRAO = new RegExp(
  `(${binomiosConhecidos()
    .map((b) => escapar(b).replace(/ (×|x) /, ' [×x] '))
    .join('|')})`,
  'g'
);

export function TextoCientifico({ texto }: { texto: string }) {
  const partes = texto.split(PADRAO);
  return (
    <>
      {partes.map((parte, i) =>
        // Com um grupo de captura, os índices ímpares do split são os acertos.
        i % 2 === 1 ? <i key={i}>{parte}</i> : <Fragment key={i}>{parte}</Fragment>
      )}
    </>
  );
}
