'use client';

import React from 'react';
import Link from 'next/link';
import { GameState, Profile } from '../lib/types';
import { XP_MAXIMO } from '../data/plantasData';
import { Leaf, Bell } from 'lucide-react';

/* ============================================================================
   GER-UI-01 — HEADER CLARO

   Antes: barra sólida verde escura (#2f4d38) com um HUD de quatro contadores
   (sementes, adubo, moedas, ofensiva), badge "Nv.X" sobre o avatar e um selo
   "GERMINA Offline Sync".

   Nos protótipos o header é off-white e tem apenas três elementos: marca à
   esquerda, pílula de XP e avatar com nome + nível à direita. Os contadores de
   recurso não aparecem no header de nenhuma das 8 capturas — eles vivem dentro
   do Jardim, que é onde são gastos. Manter um HUD global de economia numa
   ferramenta educativa também empurra a leitura para "jogo de fazendinha", o
   oposto do tom acadêmico da referência.
   ========================================================================= */

interface HeaderProps {
  /** `null` = visitante navegando sem conta (Fase 4). */
  profile: Profile | null;
  /** `null` = visitante: sem XP para exibir na pílula. */
  gameState: GameState | null;
  nivelNome: string;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  gameState,
  nivelNome,
  onOpenNotifications,
}) => {
  // Fase 4 — modo visitante. O header continua existindo (marca, navegação de
  // volta), mas troca XP/avatar/notificações por um botão de entrar: pílula de
  // XP zerada e sino de notificações são promessas de um estado de conta que o
  // visitante não tem.
  const visitante = profile === null || gameState === null;
  const primeiroNome = profile?.nome_completo.split(' ')[0] ?? '';
  const inicial = profile?.nome_completo.charAt(0).toUpperCase() ?? '';

  return (
    <header className="sticky top-0 z-30 bg-card-bg/95 backdrop-blur-md border-b border-black/[0.06]">
      {/* QA-13: mesma cadeia de larguras do <main>. Antes o header usava
          max-w-7xl fixo contra o max-w-5xl do conteúdo, então o avatar e a
          pílula de XP ficavam ~128px à direita da borda da página. */}
      <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Marca — some no desktop, onde a sidebar já a exibe */}
        <Link
          href="/inicio"
          className="flex items-center gap-2 md:hidden shrink-0"
          aria-label="GERMINA — ir para o início"
        >
          <Leaf className="w-5 h-5 text-green-main" strokeWidth={2} aria-hidden />
          <span className="font-bold text-[15px] tracking-tight text-green-deep">
            GERMINA
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {visitante ? (
            <>
              <span className="hidden sm:block text-[11px] text-ink-muted">
                Navegando sem conta
              </span>
              <Link
                href="/login"
                className="text-[13px] font-semibold text-white bg-green-deep hover:bg-green-main transition-colors px-4 py-2 rounded-xl"
              >
                Entrar
              </Link>
            </>
          ) : (
            <>
          {/* Pílula de XP — único indicador de progresso do header, como na referência */}
          <div
            className="flex items-center gap-1.5 bg-surface-alt rounded-full px-3 py-1.5"
            title={`${gameState.xp} de ${XP_MAXIMO} XP até o nível máximo`}
          >
            <Leaf className="w-3.5 h-3.5 text-green-main" strokeWidth={2.25} aria-hidden />
            <span className="text-[13px] font-semibold text-green-deep tabular-nums">
              {gameState.xp.toLocaleString('pt-BR')}
              <span className="text-ink-muted font-medium"> XP</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-ink-muted hover:bg-black/[0.04] transition-colors"
            aria-label="Notificações"
          >
            <Bell className="w-5 h-5" strokeWidth={1.75} aria-hidden />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-green-main ring-2 ring-card-bg"
              aria-hidden
            />
          </button>

          {/* Avatar + identidade */}
          <Link
            href="/perfil"
            className="flex items-center gap-2.5 pl-1 sm:pl-2 group"
            aria-label="Abrir meu perfil"
          >
            <div className="hidden sm:block text-right leading-tight">
              <p className="text-[13px] font-semibold text-green-deep group-hover:text-green-main transition-colors">
                {primeiroNome}
              </p>
              <p className="text-[11px] text-ink-muted">{nivelNome}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-green-deep text-white font-semibold flex items-center justify-center text-sm shrink-0">
              {inicial}
            </div>
          </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
