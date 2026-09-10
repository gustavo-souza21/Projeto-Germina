import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

/* ============================================================================
   GER-UI-06 — BUTTON

   A auditoria encontrou a hierarquia de cor invertida: 26 botões verdes contra
   8 azuis. Nos protótipos é o oposto — azul profundo é a cor da AÇÃO PRIMÁRIA
   ("ENTRAR" #0b2349, "ENVIAR RESPOSTA" #192851, FAB #112c4a) e o verde fica
   reservado à NATUREZA e ao SUCESSO ("VER RECOMPENSAS" #1f4c38).

   REGRA DE APLICAÇÃO (usar na migração dos 26 botões):

     primary   (azul)  → a ação AVANÇA UM FLUXO.
                         Entrar, criar conta, enviar resposta, confirmar,
                         comprar, salvar, continuar.

     secondary (verde) → a ação atua SOBRE O ORGANISMO VIVO, ou confirma
                         sucesso. Plantar, adubar, colher, ver recompensas.

     ghost             → ação terciária e navegação lateral. Cancelar, voltar,
                         "ver todas", filtros.

     danger            → ação destrutiva. Sair da conta, excluir. Não aparece
                         nos protótipos; incluído porque `ContaTab` precisa e
                         hoje improvisa com vermelho solto.

   Migrar com find/replace cego não funciona: a decisão é por SEMÂNTICA da
   ação, não pela cor que o botão tem hoje. Auditar caso a caso.
   ========================================================================= */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTES: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-main text-white shadow-sm hover:bg-blue-deep active:bg-blue-deep',
  secondary:
    'bg-green-deep text-white shadow-sm hover:bg-[#173a2b] active:bg-[#173a2b]',
  ghost:
    'bg-transparent text-blue-main border border-black/10 hover:bg-black/[0.04] active:bg-black/[0.06]',
  danger:
    'bg-transparent text-red-700 border border-red-200 hover:bg-red-50 active:bg-red-100',
};

const TAMANHOS: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
  md: 'text-sm px-4 py-2.5 gap-2 rounded-xl',
  lg: 'text-base px-6 py-3 gap-2 rounded-xl',
};

const ICONE: Record<ButtonSize, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const BASE =
  'inline-flex items-center justify-center font-semibold ' +
  'transition-colors duration-150 select-none ' +
  'disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none';

/**
 * Classes do botão, expostas separadamente para que `<Link>` do Next e `<a>`
 * consigam usar o mesmo visual sem aninhar um <button> dentro de uma âncora
 * (que é HTML inválido e quebra a navegação por teclado).
 *
 *   <Link href="/inicio" className={buttonClasses({ variant: 'primary' })}>
 *     Começar
 *   </Link>
 */
export function buttonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return cn(BASE, VARIANTES[variant], TAMANHOS[size], fullWidth && 'w-full', className);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Ícone à esquerda do rótulo. Passe o componente, não o elemento. */
  icone?: React.ElementType;
  /** Ícone à direita (ex.: seta de avanço). */
  iconeDireita?: React.ElementType;
  /**
   * Mostra spinner e desabilita o botão. Evita o duplo clique que hoje
   * acontece em telas como o Desafio Diário e a Loja.
   */
  carregando?: boolean;
  /** Texto anunciado a leitores de tela enquanto carrega. */
  carregandoLabel?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icone: Icone,
  iconeDireita: IconeDireita,
  carregando = false,
  carregandoLabel = 'Carregando',
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const dimIcone = ICONE[size];

  return (
    <button
      // `type` explícito: sem isso, um <button> dentro de <form> vira submit
      // por padrão e dispara envios acidentais.
      type={type}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...props}
    >
      {carregando ? (
        <>
          <Loader2 className={cn(dimIcone, 'animate-spin')} aria-hidden />
          <span className="sr-only">{carregandoLabel}</span>
          <span aria-hidden>{children}</span>
        </>
      ) : (
        <>
          {Icone && <Icone className={dimIcone} strokeWidth={2} aria-hidden />}
          {children}
          {IconeDireita && <IconeDireita className={dimIcone} strokeWidth={2} aria-hidden />}
        </>
      )}
    </button>
  );
}
