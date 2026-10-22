import { Fragment } from 'react';
import { parseNomeCientifico } from '../../lib/nomeCientifico';

/**
 * Nomes científicos (pedido da Sarah sobre a curadoria): gênero com inicial
 * maiúscula e epíteto em minúscula, os dois em itálico; autor em texto normal.
 *
 * Antes só o binômio principal saía em itálico. O sinônimo dentro da nota
 * "(antiga Bryophyllum pinnatum)" aparecia em texto normal, o que fere a mesma
 * convenção. O texto do catálogo não é alterado: só a forma de exibir.
 */
const SINONIMO = /(antiga\s+)([A-Z][a-z]+\s+[a-z-]+)/g;

function comSinonimosEmItalico(resto: string) {
  const partes: React.ReactNode[] = [];
  let ultimo = 0;
  for (const m of resto.matchAll(SINONIMO)) {
    const inicio = m.index ?? 0;
    partes.push(resto.slice(ultimo, inicio) + m[1]);
    partes.push(<i key={inicio}>{m[2]}</i>);
    ultimo = inicio + m[0].length;
  }
  partes.push(resto.slice(ultimo));
  return partes.map((p, i) => <Fragment key={i}>{p}</Fragment>);
}

export function NomeCientifico({ texto, className }: { texto: string; className?: string }) {
  const { binomio, resto } = parseNomeCientifico(texto);

  return (
    <span className={className}>
      <i>{binomio}</i>
      {resto && <> {comSinonimosEmItalico(resto)}</>}
    </span>
  );
}
