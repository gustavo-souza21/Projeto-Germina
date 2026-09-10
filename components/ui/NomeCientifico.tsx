import { parseNomeCientifico } from '../../lib/nomeCientifico';

/**
 * Renderiza um `nome_cientifico` do catálogo com a convenção botânica: só o
 * binômio (Gênero + espécie) em itálico, autor/nota de sinonímia em texto
 * normal. Herda cor/tamanho/fonte do elemento pai — não define os próprios.
 */
export function NomeCientifico({ texto, className }: { texto: string; className?: string }) {
  const { binomio, resto } = parseNomeCientifico(texto);

  return (
    <span className={className}>
      <i>{binomio}</i>
      {resto && ` ${resto}`}
    </span>
  );
}
