import { cn } from '../../lib/cn';

/* ============================================================================
   GER-UI-11 — BARRA DE XP

   Antes: `h-4` com padding interno, borda verde, `shadow-inner` e preenchimento
   em gradiente de três cores, exibindo a PORCENTAGEM.

   Na referência a barra é fina (~6px), trilho neutro, preenchimento verde
   sólido, sem borda e sem sombra. E o rótulo é sempre XP ABSOLUTO sobre a meta
   ("2.850 / 5.000 XP") — a porcentagem não aparece em nenhuma captura. Faz
   sentido: o usuário sabe quanto falta em XP, não em pontos percentuais.
   ========================================================================= */

interface BarraXPProps {
  /** XP atual do usuário (valor absoluto, não relativo à faixa). */
  xp: number;
  /** Limite inferior da faixa — use xpMin do nível para progresso dentro do nível. */
  min?: number;
  /** Limite superior da faixa. */
  max: number;
  /** Mostra o rótulo "x / y XP" acima da barra. */
  rotulo?: boolean;
  /** Texto adicional à esquerda do rótulo (ex.: "Próximo nível: Flor da Saúde"). */
  legenda?: string;
  tamanho?: 'sm' | 'md';
  /**
   * Texto exibido no lugar da fração quando `xp >= max` (QA-04).
   * Sem isso, o topo da trilha mostraria "5.250 / 5.000 XP".
   * Passe `null` em barras que não representam nível (ex.: missões).
   */
  textoMaximo?: string | null;
  className?: string;
}

export function BarraXP({
  xp,
  min = 0,
  max,
  rotulo = true,
  legenda,
  tamanho = 'md',
  textoMaximo = 'Nível máximo',
  className,
}: BarraXPProps) {
  const faixa = Math.max(1, max - min); // evita divisão por zero
  const percentual = Math.min(100, Math.max(0, ((xp - min) / faixa) * 100));
  const altura = tamanho === 'sm' ? 'h-1' : 'h-1.5';
  const noTeto = textoMaximo !== null && xp >= max;

  return (
    <div className={className}>
      {(rotulo || legenda) && (
        <div className="flex items-baseline justify-between gap-2 mb-1.5">
          {legenda && <span className="text-[11px] text-ink-muted truncate">{legenda}</span>}
          {rotulo &&
            (noTeto ? (
              <span className="text-[11px] font-bold text-green-main ml-auto shrink-0">
                {textoMaximo}
              </span>
            ) : (
              <span className="text-[11px] font-medium text-ink-muted tabular-nums ml-auto shrink-0">
                {xp.toLocaleString('pt-BR')} / {max.toLocaleString('pt-BR')} XP
              </span>
            ))}
        </div>
      )}

      <div
        className={cn('rounded-full bg-black/[0.06] overflow-hidden', altura)}
        role="progressbar"
        aria-valuenow={xp}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={legenda ?? 'Progresso de experiência'}
      >
        <div
          className="h-full bg-green-main rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${percentual}%` }}
        />
      </div>
    </div>
  );
}
