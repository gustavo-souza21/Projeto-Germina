import Link from 'next/link';
import { Profile, GameState } from '../../lib/types';
import { Fingerprint, Settings, ChevronRight, ShieldCheck } from 'lucide-react';

export function ContaTab({ profile, gameState }: { profile: Profile; gameState: GameState }) {
  return (
    <div className="space-y-3">
      <div className="bg-card-bg rounded-2xl p-4 border border-black/[0.04] shadow-card space-y-2.5">
        <h3 className="text-xs font-bold text-ink-muted uppercase tracking-wider">Informações da Conta</h3>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-ink-muted block">Membro desde</span>
            <span className="font-bold text-green-deep">
              {new Date(profile.criado_em).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-ink-muted block">Instituição</span>
            {/* Fase 2 (achado #3): o fallback era 'UFAM' — ou seja, todo
                usuário que nunca preencheu o campo (100% deles, já que o
                cadastro nunca coletou isso) aparecia como sendo da UFAM.
                Campo vazio agora se assume vazio. Esta tela é o perfil
                privado do próprio usuário; o dado não aparece mais para
                terceiros em lugar nenhum. */}
            {profile.instituicao ? (
              <span className="font-bold text-green-deep">{profile.instituicao}</span>
            ) : (
              <span className="font-bold text-locked italic">Não informada</span>
            )}
          </div>
          <div>
            <span className="text-[10px] text-ink-muted block">Localização</span>
            <span className="font-bold text-green-deep">{profile.endereco}</span>
          </div>
          <div>
            <span className="text-[10px] text-ink-muted block">Tema ativo</span>
            <span className="font-bold text-green-deep">{gameState.tema_ativo}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 pt-1 text-[10px] text-ink-muted font-mono">
          <Fingerprint className="w-3 h-3" />
          <span>{profile.id}</span>
        </div>
      </div>

      <Link
        href="/configuracoes"
        className="w-full flex items-center justify-between p-4 rounded-2xl bg-card-bg border border-black/[0.04] shadow-card hover:border-green-main transition-all"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-surface-alt flex items-center justify-center">
            <Settings className="w-4 h-4 text-green-deep" />
          </div>
          <div>
            <span className="text-sm font-bold text-green-deep block">Configurações</span>
            <span className="text-[10px] text-ink-muted">Conta, notificações, privacidade e tema</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-locked" />
      </Link>

      <div className="flex items-center gap-2 text-[11px] text-ink-muted px-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Modo Demonstração Offline com Sincronização Local</span>
      </div>
    </div>
  );
}
