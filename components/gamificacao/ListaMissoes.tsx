'use client';

import { useState } from 'react';
import { Target, Check } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { BarraXP } from './BarraXP';
import { Missao } from '../../lib/types';

/* ============================================================================
   MISSÕES (especificação da Sarah, itens 1.3 e 7: "conclusão de missão concede
   as recompensas previamente informadas")

   Antes este painel mostrava três "missões" calculadas na tela, com um campo
   de XP que nunca era exibido nem pago. Agora as missões vêm do banco
   (catalogo_missoes, via listar_missoes), o progresso é calculado no servidor
   e a recompensa é resgatada uma vez por resgatar_missao. A recompensa aparece
   ANTES de a missão ser concluída.

   Ordem de exibição: primeiro as prontas para resgatar, depois as em
   andamento, por fim as já resgatadas (recolhidas).
   ========================================================================= */

export function ListaMissoes({
  missoes,
  onResgatar,
}: {
  missoes: Missao[];
  /** Resolve `true` quando o servidor confirmou o resgate. */
  onResgatar: (missaoId: string) => Promise<boolean>;
}) {
  const [resgatando, setResgatando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const prontas = missoes.filter((m) => !m.resgatada && m.progresso >= m.meta);
  const andamento = missoes.filter((m) => !m.resgatada && m.progresso < m.meta);
  const feitas = missoes.filter((m) => m.resgatada);
  const visiveis = [...prontas, ...andamento].slice(0, 4);

  const resgatar = async (id: string) => {
    if (resgatando) return;
    setResgatando(id);
    setErro(null);
    const ok = await onResgatar(id);
    setResgatando(null);
    if (!ok) setErro('Não foi possível resgatar agora. Tente novamente.');
  };

  return (
    <Card padding="md">
      <CardHeader
        titulo="Missões"
        descricao={`${feitas.length} de ${missoes.length} concluídas`}
        icone={Target}
      />

      {visiveis.length === 0 ? (
        <p className="text-xs text-ink-muted">Todas as missões foram concluídas. Parabéns!</p>
      ) : (
        <ul className="space-y-3.5">
          {visiveis.map((m) => {
            const pronta = m.progresso >= m.meta;
            return (
              <li key={m.missao_id}>
                <div className="flex items-start gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-green-deep leading-snug">{m.titulo}</p>
                    <p className="text-[11px] text-ink-muted leading-snug">{m.descricao}</p>
                  </div>
                  <span className="text-[11px] font-bold text-amber-800 tabular-nums shrink-0">
                    +{m.moedas} moedas
                  </span>
                </div>

                {pronta ? (
                  <button
                    type="button"
                    onClick={() => resgatar(m.missao_id)}
                    disabled={resgatando !== null}
                    className="w-full min-h-[40px] mt-1 text-xs font-bold text-white bg-green-deep hover:bg-green-main rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    <Check className="w-3.5 h-3.5" aria-hidden />
                    {resgatando === m.missao_id ? 'Resgatando...' : `Resgatar ${m.moedas} moedas`}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <BarraXP
                        xp={m.progresso}
                        max={m.meta}
                        rotulo={false}
                        tamanho="sm"
                        // Missão não é nível: nunca deve exibir "Nível máximo".
                        textoMaximo={null}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-ink-muted tabular-nums shrink-0">
                      {m.progresso}/{m.meta}
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {erro && <p className="text-[11px] text-red-600 font-semibold mt-3">{erro}</p>}
    </Card>
  );
}
