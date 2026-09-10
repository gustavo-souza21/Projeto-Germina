import { Camera } from 'lucide-react';
import { parseFotoCredito } from '../lib/fotoCredito';

interface CreditoFotoProps {
  fotosFonte: string;
  /** 'sm' para cards pequenos da Biblioteca, 'md' para a Ficha Botânica */
  tamanho?: 'sm' | 'md';
}

/**
 * Selo semi-transparente no canto da foto, creditando a fonte tal como
 * consta na curadoria (Sarah B. Freitas, 2025). Vira link clicável quando a
 * curadoria informa uma URL; senão mostra só o texto do crédito.
 */
export function CreditoFoto({ fotosFonte, tamanho = 'md' }: CreditoFotoProps) {
  const { label, href } = parseFotoCredito(fotosFonte);

  const classesBase =
    tamanho === 'sm'
      ? 'text-[9px] px-1.5 py-0.5 gap-0.5'
      : 'text-[10px] px-2 py-1 gap-1';

  const conteudo = (
    <>
      <Camera className={tamanho === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      <span className="truncate max-w-[140px]">{label}</span>
    </>
  );

  const classesComuns = `absolute bottom-1.5 right-1.5 z-10 flex items-center rounded-full
    bg-black/55 backdrop-blur-sm text-white/90 font-medium ${classesBase}`;

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        title={`Foto: ${label} (fonte da curadoria — abre em nova aba)`}
        className={`${classesComuns} hover:bg-black/75 transition-colors underline-offset-2 hover:underline`}
      >
        {conteudo}
      </a>
    );
  }

  return (
    <span title={`Foto: ${label} (crédito conforme a curadoria)`} className={classesComuns}>
      {conteudo}
    </span>
  );
}
