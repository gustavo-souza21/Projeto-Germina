import { Coins } from 'lucide-react';
import { fontesDeMoedas } from '../../lib/economia';
import { DESAFIOS_INICIAIS } from '../../data/plantasData';

/**
 * "Como ganhar moedas" — especificação da Sarah, item 1.3: o usuário precisava
 * de moedas e não encontrava em lugar nenhum como consegui-las.
 *
 * Os valores vêm de lib/economia.ts (espelho da tabela config_economia) e do
 * catálogo de desafios: nenhum número é escrito à mão aqui.
 */
export function ComoGanharMoedas({ compacto = false }: { compacto?: boolean }) {
  const moedasDesafio = DESAFIOS_INICIAIS.find((d) => d.id === 'd0')?.moedas_recompensa ?? 0;
  const fontes = fontesDeMoedas(moedasDesafio);

  return (
    <div className={compacto ? '' : 'space-y-3'}>
      {!compacto && (
        <h3 className="text-sm font-bold text-green-deep flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-medalha-ouro-anel" aria-hidden />
          Como ganhar moedas
        </h3>
      )}
      <ul className="space-y-2">
        {fontes.map((f) => (
          <li key={f.titulo} className="flex items-start justify-between gap-3 text-xs">
            <div className="min-w-0">
              <p className="font-semibold text-ink">{f.titulo}</p>
              <p className="text-[11px] text-ink-muted leading-snug">{f.detalhe}</p>
            </div>
            <span className="shrink-0 font-bold text-green-deep tabular-nums">+{f.moedas}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
