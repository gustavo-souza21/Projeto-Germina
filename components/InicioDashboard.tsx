'use client';

import React from 'react';
import Link from 'next/link';
import { GameState, Profile, Atividade, DesafioDiario } from '../lib/types';
import { Card } from './ui/Card';
import { BarraXP } from './gamificacao/BarraXP';
import { BadgeHexagonal } from './gamificacao/BadgeHexagonal';
import { TimelineEvolucao } from './gamificacao/TimelineEvolucao';
import { resolverIcone } from '../lib/icones';
import { NIVEIS_EVOLUCAO, XP_MAXIMO, calcularNivel } from '../data/plantasData';
import { Sprout, Flame, Trophy, BookOpen, Clock, CheckCircle2, ArrowRight, Award, Sparkles } from 'lucide-react';

interface InicioDashboardProps {
  profile: Profile;
  gameState: GameState;
  atividades: Atividade[];
  desafios: DesafioDiario[];
  plantasEstudadasCount: number;
  conquistasDesbloqueadas: number;
  conquistasTotal: number;
  onConcluirDesafio: (desafioId: string) => void;
}

export const InicioDashboard: React.FC<InicioDashboardProps> = ({
  profile,
  gameState,
  atividades,
  desafios,
  plantasEstudadasCount,
  conquistasDesbloqueadas,
  conquistasTotal,
  onConcluirDesafio,
}) => {
  // Estado Derivado: nível não é persistido, é sempre recalculado do XP corrente.
  const nivelAtual = calcularNivel(gameState.xp).nivel;
  const nivelAtualInfo = NIVEIS_EVOLUCAO.find(n => n.nivel === nivelAtual) || NIVEIS_EVOLUCAO[0];
  const proximoNivelInfo = NIVEIS_EVOLUCAO.find(n => n.nivel === nivelAtual + 1);

  // Quanto falta para o PRÓXIMO nível. No nível máximo não há próximo, então
  // o valor é 0 e a legenda da barra muda (ver <BarraXP legenda=...>).
  const xpFaltante = proximoNivelInfo ? proximoNivelInfo.xpMin - gameState.xp : 0;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* GER-UI-05: o banner em gradiente de três cores (com emoji gigante em
          marca-d'água e pílula "Jardim do Conhecimento Botânico") não existe em
          nenhuma das 8 capturas de referência. O protótipo abre a tela de
          Início com texto direto sobre o off-white. */}
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-green-deep">
          Olá, {profile.nome_completo.split(' ')[0]}!
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          Continue cultivando conhecimento. Seu nível atual é{' '}
          <strong className="font-semibold text-green-deep">{nivelAtualInfo.nome}</strong>.
        </p>
      </header>

      {/* GER-UI-09/10/11: o emoji com animate-bounce e a barra de 16px com
          gradiente de três cores + porcentagem foram substituídos pelos
          componentes de gamificação alinhados à referência. */}
      <Card padding="lg">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex items-center gap-4 shrink-0">
            <BadgeHexagonal
              icone={resolverIcone(nivelAtualInfo.icone)}
              tamanho="lg"
              rotulo={`Nível ${nivelAtual}: ${nivelAtualInfo.nome}`}
            />
            <div className="sm:hidden">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                Nível {nivelAtual}
              </p>
              <p className="text-base font-bold text-green-deep">{nivelAtualInfo.nome}</p>
            </div>
          </div>

          <div className="flex-1 w-full min-w-0">
            <div className="hidden sm:block">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                Nível {nivelAtual}
              </p>
              <h2 className="text-lg font-bold text-green-deep">{nivelAtualInfo.nome}</h2>
            </div>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">
              {nivelAtualInfo.descricao}
            </p>

            <BarraXP
              xp={gameState.xp}
              max={XP_MAXIMO}
              legenda={
                proximoNivelInfo
                  ? `Faltam ${xpFaltante.toLocaleString('pt-BR')} XP para ${proximoNivelInfo.nome}`
                  : 'Nível máximo alcançado'
              }
              className="mt-3.5"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-surface-alt text-green-deep px-3 py-2 rounded-xl font-semibold text-xs shrink-0 self-start sm:self-center">
            <Flame className="w-4 h-4 text-orange-500" aria-hidden />
            <span>{gameState.streak} dias</span>
          </div>
        </div>

        {/* Trilha completa — GER-UI-09 */}
        <div className="mt-5 pt-5 border-t border-black/[0.05]">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-3">
            Sua jornada de evolução
          </h3>
          <TimelineEvolucao nivelAtual={nivelAtual} />
        </div>
      </Card>

      {/* Daily Challenge Card (Card do Desafio Diário) */}
      <div className="bg-gradient-to-br from-amber-50 to-emerald-50 rounded-2xl p-5 sm:p-6 border border-amber-200 shadow-card relative overflow-hidden">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md tracking-wider">
                Desafio Diário
              </span>
              <div className="flex items-center gap-1 text-xs text-amber-800 font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Expira à meia-noite</span>
              </div>
            </div>

            {desafios.length > 0 && (
              <>
                <h4 className="text-base font-bold text-blue-deep mt-1">
                  {desafios[0].titulo}
                </h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  {desafios[0].descricao}
                </p>
              </>
            )}
          </div>

          {desafios.length > 0 && (
            <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-emerald-200">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>+{desafios[0].xp_recompensa} XP</span>
                <span className="text-amber-600 font-bold">+{desafios[0].moedas_recompensa} Moedas</span>
              </div>

              {desafios[0].concluido ? (
                <button
                  disabled
                  className="flex items-center justify-center gap-1.5 bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-default opacity-90 shadow"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Desafio Concluído!</span>
                </button>
              ) : (
                <button
                  onClick={() => onConcluirDesafio(desafios[0].id)}
                  className="flex items-center justify-center gap-1.5 bg-green-deep hover:bg-green-main text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow hover:shadow-md active:scale-95"
                >
                  <span>Aceitar & Concluir</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total XP */}
        <div className="bg-card-bg p-4 rounded-2xl border border-black/[0.04] shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-ink-muted font-medium">XP Total</p>
            <p className="text-lg font-bold text-green-deep">{gameState.xp}</p>
          </div>
        </div>

        {/* Plants Studied */}
        <Link
          href="/biblioteca"
          className="bg-card-bg p-4 rounded-2xl border border-black/[0.04] shadow-card flex items-center gap-3 hover:border-green-main transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-ink-muted font-medium">Herbário</p>
            <p className="text-lg font-bold text-blue-main">{plantasEstudadasCount} / 15</p>
          </div>
        </Link>

        {/* Garden Plots Active */}
        <Link
          href="/jardim"
          className="bg-card-bg p-4 rounded-2xl border border-black/[0.04] shadow-card flex items-center gap-3 hover:border-green-main transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-ink-muted font-medium">Sementes</p>
            <p className="text-lg font-bold text-green-800">{gameState.sementes}</p>
          </div>
        </Link>

        {/* Achievements Unlocked */}
        <Link
          href="/perfil"
          className="bg-card-bg p-4 rounded-2xl border border-black/[0.04] shadow-card flex items-center gap-3 hover:border-green-main transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-ink-muted font-medium">Conquistas</p>
            <p className="text-lg font-bold text-amber-800">{conquistasDesbloqueadas} / {conquistasTotal}</p>
          </div>
        </Link>
      </div>

      {/* Feed de Últimas Atividades */}
      <div className="bg-card-bg rounded-2xl p-5 border border-black/[0.04] shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-green-deep flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-main" />
            <span>Últimas Atividades de Estudo</span>
          </h3>
          <Link 
            href="/biblioteca"
            className="text-xs text-blue-main font-bold hover:underline"
          >
            Ver catálogo completo &rarr;
          </Link>
        </div>

        <div className="space-y-3">
          {atividades.slice(0, 4).map((act) => (
            <div 
              key={act.id}
              className="flex items-center justify-between p-3 rounded-xl bg-surface-alt border border-black/[0.04] text-xs sm:text-sm"
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-semibold text-ink leading-tight">{act.texto}</p>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    {new Date(act.criado_em).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <span className="font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg text-xs">
                +{act.xp_ganho} XP
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
