import { Atividade } from '../../lib/types';
import { BookOpen, Sprout, MessageSquare, Award, Activity } from 'lucide-react';

const ICONES: Record<string, typeof BookOpen> = {
  BookOpen,
  Sprout,
  MessageSquare,
  Award,
};

function tempoRelativo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const horas = Math.floor(diffMs / 3600000);
  if (horas < 1) return 'há poucos minutos';
  if (horas < 24) return `há ${horas}h`;
  const dias = Math.floor(horas / 24);
  return `há ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
}

export function AtividadeTab({ atividades }: { atividades: Atividade[] }) {
  if (atividades.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-black/[0.04] text-ink-muted space-y-2">
        <Activity className="w-10 h-10 mx-auto text-locked" />
        <p className="font-bold">Nenhuma atividade registrada ainda.</p>
      </div>
    );
  }

  return (
    <div className="bg-card-bg rounded-2xl p-5 border border-black/[0.04] shadow-card space-y-1">
      <h3 className="text-base font-bold text-green-deep mb-2">Histórico de Atividades</h3>

      {atividades.map((atividade) => {
        const Icon = ICONES[atividade.icone] || Activity;
        return (
          <div key={atividade.id} className="flex items-center gap-3 py-2.5 border-b border-black/[0.05] last:border-0">
            <div className="w-9 h-9 rounded-xl bg-surface-alt flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-green-main" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-ink-muted font-medium">{atividade.texto}</p>
              <p className="text-[10px] text-ink-muted">{tempoRelativo(atividade.criado_em)}</p>
            </div>
            {atividade.xp_ganho > 0 && (
              <span className="text-xs font-bold text-emerald-700 shrink-0">+{atividade.xp_ganho} XP</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
