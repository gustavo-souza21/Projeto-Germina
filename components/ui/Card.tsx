import React from 'react';
import { cn } from '../../lib/cn';

/* ============================================================================
   GER-UI-04 — CARD

   Nos protótipos o card é definido pela SOMBRA, não pela borda. O padrão
   herdado do protótipo AI Studio desenhava uma linha verde visível em volta de
   tudo, o que dava ao conjunto um aspecto de formulário que a referência não
   tem. Esse padrão foi eliminado do projeto na migração do QA-08.

   Aqui a superfície usa sombra em duas camadas + uma hairline quase invisível
   só para separar o branco do card do off-white do fundo (#ffffff sobre
   #f9f8f6 tem contraste baixo demais para se sustentar sozinho).
   ========================================================================= */

type Padding = 'none' | 'sm' | 'md' | 'lg';

const PADDING: Record<Padding, string> = {
  none: '',
  sm: 'p-3.5',
  md: 'p-5',
  lg: 'p-6 sm:p-7',
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Espaçamento interno. `none` para cards que abrem com imagem sangrada. */
  padding?: Padding;
  /**
   * Eleva no hover. Use apenas quando o card inteiro é clicável — sombra que
   * reage sem que nada aconteça no clique é uma promessa falsa de affordance.
   */
  interactive?: boolean;
  /** Renderiza como outro elemento (ex.: `article`, `li`, `section`). */
  as?: React.ElementType;
}

export function Card({
  padding = 'md',
  interactive = false,
  as: Component = 'div',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <Component
      className={cn(
        'bg-card-bg rounded-2xl border border-black/[0.04] shadow-card',
        interactive &&
          'transition-shadow duration-200 hover:shadow-card-hover cursor-pointer',
        PADDING[padding],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/* ---------------------------------------------------------------------------
   Subcomponentes opcionais. Existem para padronizar a hierarquia tipográfica
   dentro do card — hoje cada tela inventa o próprio tamanho de título, o que
   é parte do motivo de a tipografia parecer inconsistente entre as abas.
   ------------------------------------------------------------------------ */

export function CardHeader({
  titulo,
  descricao,
  acao,
  icone: Icone,
  className,
}: {
  titulo: string;
  descricao?: string;
  /** Botão ou link alinhado à direita (ex.: "Ver todas"). */
  acao?: React.ReactNode;
  icone?: React.ElementType;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-3 mb-3', className)}>
      <div className="flex items-start gap-2.5 min-w-0">
        {Icone && (
          <Icone
            className="w-5 h-5 text-green-deep shrink-0 mt-0.5"
            strokeWidth={1.75}
            aria-hidden
          />
        )}
        <div className="min-w-0">
          <h3 className="text-base font-bold text-green-deep leading-snug">{titulo}</h3>
          {descricao && (
            <p className="text-sm text-ink-muted mt-0.5 leading-relaxed">{descricao}</p>
          )}
        </div>
      </div>
      {acao && <div className="shrink-0">{acao}</div>}
    </div>
  );
}

export function CardSection({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('pt-4 mt-4 border-t border-black/[0.05]', className)}
      {...props}
    >
      {children}
    </div>
  );
}
