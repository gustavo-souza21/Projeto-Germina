'use client';

import React, { useState } from 'react';
import { GameState, Profile, Conquista, Atividade, PlantaCatalogo, UserColecao } from '../lib/types';
import { NIVEIS_EVOLUCAO, calcularNivel } from '../data/plantasData';
import { Share2, Sparkles, BookOpen, Flame, Trophy, Fingerprint } from 'lucide-react';
import { ProfileTabs, PerfilTabKey } from './perfil/ProfileTabs';
import { Card, CardHeader } from './ui/Card';
import { TimelineEvolucao } from './gamificacao/TimelineEvolucao';
import { Route } from 'lucide-react';
import { HerbarioTab } from './perfil/HerbarioTab';
import { ConquistasTab } from './perfil/ConquistasTab';
import { AtividadeTab } from './perfil/AtividadeTab';
import { ContaTab } from './perfil/ContaTab';

interface PerfilEConfiguracoesProps {
  profile: Profile;
  gameState: GameState;
  plantasEstudadasCount: number;
  plantas: PlantaCatalogo[];
  colecao: UserColecao[];
  conquistas: Conquista[];
  atividades: Atividade[];
  /** Ofensiva já validada por data (ofensivaVigente) — 0 se a sequência quebrou. */
  ofensiva: number;
}

export const PerfilEConfiguracoes: React.FC<PerfilEConfiguracoesProps> = ({
  profile,
  gameState,
  plantasEstudadasCount,
  plantas,
  colecao,
  conquistas,
  atividades,
  ofensiva,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<PerfilTabKey>('herbario');

  // Estado Derivado: nível não é persistido, é sempre recalculado do XP corrente.
  const nivelAtual = calcularNivel(gameState.xp).nivel;
  const nivelAtualInfo = NIVEIS_EVOLUCAO.find(n => n.nivel === nivelAtual) || NIVEIS_EVOLUCAO[0];
  const conquistasDesbloqueadas = conquistas.filter((c) => c.desbloqueada).length;

  const handleShareProgress = async () => {
    /* Fase 2 (achado #3) — este texto não estava no grep de `instituicao`
       porque escrevia "na UFAM" como literal, mas é o mesmo problema na sua
       forma mais pública: qualquer usuário que apertasse "Compartilhar"
       enviava a terceiros uma frase afirmando que ele estuda na UFAM. O app
       nunca soube disso de ninguém. O progresso (nível e XP) é real e
       derivado do banco, então continua; a afiliação sai. */
    const texto = `Conheça o GERMINA! Já alcancei o Nível ${nivelAtual} (${nivelAtualInfo.nome}) com ${gameState.xp} XP estudando plantas medicinais da Amazônia!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'GERMINA', text: texto });
        return;
      } catch {
        // usuário cancelou o share nativo — cai no fallback abaixo
      }
    }
    try {
      await navigator.clipboard.writeText(texto);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      // clipboard indisponível — ignora silenciosamente
    }
  };

  return (
    <div className="space-y-5 pb-20 md:pb-8">
      {/* Identity Card */}
      <div className="bg-card-bg rounded-2xl p-5 sm:p-6 border border-black/[0.04] shadow-card relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-green-deep text-green-soft font-bold flex items-center justify-center text-3xl shadow-md border-4 border-green-soft">
              {profile.nome_completo.charAt(0)}
            </div>
            <div className="absolute -bottom-2 -right-1 bg-amber-400 text-blue-deep font-bold text-xs px-2 py-0.5 rounded-full border border-amber-600 shadow">
              Nv.{nivelAtual}
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-green-deep">{profile.nome_completo}</h2>
              <span className="bg-green-soft text-green-deep font-bold text-xs px-2.5 py-0.5 rounded-full">
                {nivelAtualInfo.nome}
              </span>
            </div>

            <p className="text-xs text-ink-muted font-bold">@{profile.nickname}</p>
            {/* Fase 2 (achado #3): o fallback 'UFAM - Ciências Biológicas'
                inventava um curso e uma instituição para quem nunca preencheu
                nada — e como o cadastro nunca coletou o campo, isso valia para
                todo mundo. Sem valor real, a linha simplesmente não existe. */}
            {profile.instituicao && (
              <p className="text-xs text-emerald-800 font-bold">{profile.instituicao}</p>
            )}

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-ink-muted pt-1">
              <span>{profile.email}</span>
              <span>{profile.endereco}</span>
              <span>{profile.idade} anos</span>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-1 pt-0.5">
              <Fingerprint className="w-3 h-3 text-locked" />
              <span className="text-[10px] text-ink-muted font-mono">{profile.id}</span>
            </div>
          </div>

          <button
            onClick={handleShareProgress}
            className="bg-blue-main hover:bg-blue-deep text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow flex items-center gap-1.5 self-center sm:self-start"
          >
            <Share2 className="w-4 h-4" />
            <span>{copiedLink ? 'Copiado!' : 'Compartilhar'}</span>
          </button>
        </div>
      </div>

      {/* Métricas de Jornada */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card-bg p-4 rounded-2xl border border-black/[0.04] shadow-card text-center">
          <Sparkles className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
          <p className="text-xs text-ink-muted font-medium">XP Acumulado</p>
          <p className="text-xl font-bold text-green-deep">{gameState.xp} XP</p>
        </div>

        <div className="bg-card-bg p-4 rounded-2xl border border-black/[0.04] shadow-card text-center">
          <BookOpen className="w-6 h-6 text-teal-600 mx-auto mb-1" />
          <p className="text-xs text-ink-muted font-medium">Espécies Estudadas</p>
          <p className="text-xl font-bold text-blue-main">{plantasEstudadasCount} / 15</p>
        </div>

        <div className="bg-card-bg p-4 rounded-2xl border border-black/[0.04] shadow-card text-center">
          <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
          <p className="text-xs text-ink-muted font-medium">Ofensiva de Estudo</p>
          <p className="text-xl font-bold text-orange-600">{ofensiva} {ofensiva === 1 ? 'dia' : 'dias'}</p>
        </div>

        <div className="bg-card-bg p-4 rounded-2xl border border-black/[0.04] shadow-card text-center">
          <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-1" />
          <p className="text-xs text-ink-muted font-medium">Conquistas</p>
          <p className="text-xl font-bold text-amber-700">{conquistasDesbloqueadas} / {conquistas.length}</p>
        </div>
      </div>

      {/* GER-UI-09: "Sua jornada" é uma tela própria na referência. Aqui ela
          entra como bloco do perfil, que é onde o usuário já vem consultar
          progresso — evita criar mais uma rota para o mesmo conteúdo. */}
      <Card>
        <CardHeader
          titulo="Sua jornada de evolução"
          descricao="Estude, ganhe XP e desbloqueie novas conquistas"
          icone={Route}
        />
        <TimelineEvolucao nivelAtual={nivelAtual} />
      </Card>

      {/* Abas */}
      <ProfileTabs activeTab={abaAtiva} onChangeTab={setAbaAtiva} />

      {abaAtiva === 'herbario' && <HerbarioTab plantas={plantas} colecao={colecao} />}
      {abaAtiva === 'conquistas' && <ConquistasTab conquistas={conquistas} />}
      {abaAtiva === 'atividade' && <AtividadeTab atividades={atividades} />}
      {abaAtiva === 'conta' && <ContaTab profile={profile} gameState={gameState} />}
    </div>
  );
};
