import Link from 'next/link';
import { Card, CardHeader } from '../ui/Card';
import { buttonClasses } from '../ui/Button';
import { BookMarked } from 'lucide-react';
import { Missao } from '../../lib/types';
import { DESAFIOS_INICIAIS } from '../../data/plantasData';
import { ComoGanharMoedas } from '../gamificacao/ComoGanharMoedas';
import { ListaMissoes } from '../gamificacao/ListaMissoes';

/* ============================================================================
   GER-UI-16 — PAINEL LATERAL DO JARDIM

   Ocupa o espaço que a Loja monopolizava. Na referência esse lugar é do
   Desafio Diário e das Missões em andamento — conteúdo que PUXA o usuário de
   volta ao loop de estudo, em vez de pedir que ele gaste moedas.

   As missões vêm do banco, com progresso calculado e recompensa paga pelo
   servidor (ListaMissoes / Migration 15).
   ========================================================================= */

export function PainelJardim({
  missoes,
  onResgatarMissao,
}: {
  missoes: Missao[];
  onResgatarMissao: (missaoId: string) => Promise<boolean>;
}) {
  const desafioDia = DESAFIOS_INICIAIS.find((d) => d.id === 'd0');

  return (
    <div className="space-y-4">
      {/* Desafio Diário — o gancho de volta ao estudo */}
      <Card padding="md">
        <CardHeader
          titulo="Desafio Diário"
          descricao="Perguntas baseadas nas plantas do seu jardim"
          icone={BookMarked}
        />

        <div className="flex items-center gap-3 bg-surface-alt rounded-xl p-3">
          <div className="text-center px-1">
            <p className="text-lg font-bold text-green-deep leading-none tabular-nums">4</p>
            <p className="text-[10px] text-ink-muted mt-0.5">perguntas</p>
          </div>
          <div className="w-px h-8 bg-black/[0.08]" aria-hidden />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-ink-muted leading-snug">
              Indicação, preparo, segurança e identificação botânica.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mt-3">
          <p className="text-[11px] font-semibold text-green-deep">
            Recompensa: até {desafioDia?.xp_recompensa ?? 0} XP e {desafioDia?.moedas_recompensa ?? 0} moedas
          </p>
          <Link
            href="/desafio-diario"
            className={buttonClasses({ variant: 'primary', size: 'sm' })}
          >
            Responder
          </Link>
        </div>
      </Card>

      {/* Missões com recompensa resgatável (Migration 15). */}
      <ListaMissoes missoes={missoes} onResgatar={onResgatarMissao} />

      {/* Spec 1.3: o saldo de moedas fica no topo do Jardim; aqui, como ganhá-las. */}
      <Card padding="md">
        <ComoGanharMoedas />
      </Card>
    </div>
  );
}
