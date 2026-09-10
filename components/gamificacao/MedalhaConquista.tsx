import type { LucideIcon } from 'lucide-react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/cn';

/* ============================================================================
   GER-UI-10 (parte 2) — MEDALHA DE CONQUISTA

   Formato CIRCULAR com anel metálico, distinto do hexágono usado para nível.
   Nos protótipos as conquistas aparecem como medalhas em três acabamentos
   (bronze, prata, ouro) com um check verde no canto quando desbloqueadas.

   A raridade é DERIVADA do esforço exigido (`total`) em vez de virar mais um
   campo no banco: quanto mais itens a conquista pede, mais nobre a medalha.
   Assim o dado não pode entrar em contradição consigo mesmo — não existe o
   caso de uma conquista "ouro" que se completa com 1 ação.
   ========================================================================= */

export type Raridade = 'bronze' | 'prata' | 'ouro';

export function raridadePorEsforco(total: number): Raridade {
  if (total >= 7) return 'ouro';
  if (total >= 4) return 'prata';
  return 'bronze';
}

const ACABAMENTO: Record<Raridade, { anel: string; fundo: string; icone: string }> = {
  bronze: { anel: 'ring-medalha-bronze-anel/60', fundo: 'bg-medalha-bronze-fundo', icone: 'text-medalha-bronze-icone' },
  prata: { anel: 'ring-medalha-prata-anel/70', fundo: 'bg-medalha-prata-fundo', icone: 'text-medalha-prata-icone' },
  ouro: { anel: 'ring-medalha-ouro-anel/70', fundo: 'bg-medalha-ouro-fundo', icone: 'text-medalha-ouro-icone' },
};

const DIMENSAO = {
  sm: { caixa: 'w-10 h-10 ring-2', icone: 'w-4 h-4', check: 'w-3.5 h-3.5' },
  md: { caixa: 'w-14 h-14 ring-[3px]', icone: 'w-6 h-6', check: 'w-4 h-4' },
} as const;

interface MedalhaConquistaProps {
  icone: LucideIcon;
  raridade: Raridade;
  desbloqueada: boolean;
  tamanho?: keyof typeof DIMENSAO;
  rotulo?: string;
  className?: string;
}

export function MedalhaConquista({
  icone: Icone,
  raridade,
  desbloqueada,
  tamanho = 'md',
  rotulo,
  className,
}: MedalhaConquistaProps) {
  const { caixa, icone, check } = DIMENSAO[tamanho];
  const cor = ACABAMENTO[raridade];

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <div
        className={cn(
          caixa,
          'rounded-full flex items-center justify-center',
          cor.anel,
          cor.fundo,
          !desbloqueada && 'grayscale opacity-50'
        )}
        role={rotulo ? 'img' : undefined}
        aria-label={rotulo}
        aria-hidden={rotulo ? undefined : true}
      >
        <Icone className={cn(icone, cor.icone)} strokeWidth={1.75} aria-hidden />
      </div>

      {desbloqueada && (
        <span
          className="absolute -bottom-0.5 -right-0.5 rounded-full bg-green-main ring-2 ring-card-bg flex items-center justify-center p-0.5"
          aria-hidden
        >
          <Check className={cn(check, 'text-white')} strokeWidth={3} />
        </span>
      )}
    </div>
  );
}
