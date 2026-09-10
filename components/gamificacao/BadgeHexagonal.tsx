import type { LucideIcon } from 'lucide-react';
import { Lock } from 'lucide-react';
import { cn } from '../../lib/cn';

/* ============================================================================
   GER-UI-10 (parte 1) — BADGE HEXAGONAL DE NÍVEL

   A referência usa DOIS formatos com semântica distinta:
     • hexágono  → NÍVEL da trilha de evolução (este componente)
     • medalha   → CONQUISTA (ver MedalhaConquista.tsx)

   O código antigo usava emoji (🌱 com animate-bounce) para nível e 🏆 para
   toda conquista — os dois formatos colapsados em nenhum.

   O hexágono é feito com `clip-path`, não com imagem: escala em qualquer
   tamanho, herda cor por token e não adiciona requisição de rede.
   ========================================================================= */

const HEX = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';

const DIMENSAO = {
  sm: { caixa: 'w-10 h-10', icone: 'w-4 h-4' },
  md: { caixa: 'w-16 h-16', icone: 'w-7 h-7' },
  lg: { caixa: 'w-24 h-24', icone: 'w-10 h-10' },
} as const;

interface BadgeHexagonalProps {
  icone: LucideIcon;
  tamanho?: keyof typeof DIMENSAO;
  /** Dessatura e troca o ícone por um cadeado. */
  bloqueado?: boolean;
  /** Anel de destaque — use no nível atual da trilha. */
  destacado?: boolean;
  /** Descrição para leitor de tela. Sem isso o badge é decorativo (aria-hidden). */
  rotulo?: string;
  className?: string;
}

export function BadgeHexagonal({
  icone: Icone,
  tamanho = 'md',
  bloqueado = false,
  destacado = false,
  rotulo,
  className,
}: BadgeHexagonalProps) {
  const { caixa, icone } = DIMENSAO[tamanho];
  const IconeFinal = bloqueado ? Lock : Icone;

  return (
    // O anel de destaque precisa de um wrapper: `ring` não acompanha o
    // clip-path, então o halo é um segundo hexágono levemente maior atrás.
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      {destacado && (
        <div
          style={{ clipPath: HEX }}
          className={cn(caixa, 'absolute scale-[1.18] bg-green-main/25')}
          aria-hidden
        />
      )}

      <div
        style={{ clipPath: HEX }}
        className={cn(
          caixa,
          'relative flex items-center justify-center bg-gradient-to-b',
          bloqueado
            ? 'from-locked to-locked-deep'
            : 'from-green-main to-green-deep'
        )}
        role={rotulo ? 'img' : undefined}
        aria-label={rotulo}
        aria-hidden={rotulo ? undefined : true}
      >
        <IconeFinal className={cn(icone, 'text-white')} strokeWidth={1.75} aria-hidden />
      </div>
    </div>
  );
}
