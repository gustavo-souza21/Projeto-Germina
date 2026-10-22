import { Conquista } from '../../lib/types';
import { Award } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import {
  MedalhaConquista,
  raridadePorEsforco,
} from '../gamificacao/MedalhaConquista';
import { resolverIcone } from '../../lib/icones';

/**
 * GER-UI-10 — Conquistas com medalha real.
 *
 * Antes: TODA conquista renderizava o emoji de troféu dentro de um quadrado
 * arredondado, e o campo `conquista.icone` — que já existia no dado, com
 * valores como 'Sprout', 'Wheat', 'ShieldAlert' — era simplesmente ignorado.
 * O gradiente âmbar→esmeralda do card também não existe na referência.
 */
export function ConquistasTab({ conquistas }: { conquistas: Conquista[] }) {
  return (
    <Card>
      <CardHeader
        titulo="Conquistas e Medalhas do Herbário"
        descricao={`${conquistas.filter((c) => c.desbloqueada).length} de ${conquistas.length} desbloqueadas`}
        icone={Award}
      />

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {conquistas.map((conquista) => {
          const percentual = Math.min(
            100,
            (conquista.progresso / conquista.total) * 100
          );

          return (
            <li
              key={conquista.id}
              className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                conquista.desbloqueada
                  ? 'bg-surface-alt border-green-soft'
                  : 'bg-black/[0.02] border-black/[0.05]'
              }`}
            >
              <MedalhaConquista
                icone={resolverIcone(conquista.icone)}
                raridade={raridadePorEsforco(conquista.total)}
                desbloqueada={conquista.desbloqueada}
                rotulo={conquista.titulo}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-[13px] font-bold text-green-deep leading-snug">
                    {conquista.titulo}
                  </h4>
                  {!conquista.desbloqueada && (
                    <span className="text-[10px] font-semibold text-ink-muted tabular-nums shrink-0">
                      {conquista.progresso}/{conquista.total}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-ink-muted leading-snug mt-0.5">
                  {conquista.descricao}
                </p>

                {!conquista.desbloqueada && (
                  <div
                    className="w-full h-1.5 bg-black/[0.06] rounded-full mt-2 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={conquista.progresso}
                    aria-valuemin={0}
                    aria-valuemax={conquista.total}
                    aria-label={`Progresso: ${conquista.titulo}`}
                  >
                    <div
                      className="h-full bg-green-main rounded-full transition-[width] duration-500"
                      style={{ width: `${percentual}%` }}
                    />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
