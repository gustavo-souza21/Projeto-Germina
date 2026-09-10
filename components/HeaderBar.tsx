'use client';

import { Header } from './Header';
import { GameState, Profile } from '../lib/types';

export function HeaderBar({
  profile,
  gameState,
  nivelNome,
}: {
  /** `null` = visitante navegando sem conta (Fase 4). */
  profile: Profile | null;
  gameState: GameState | null;
  nivelNome: string;
}) {
  return (
    <Header
      profile={profile}
      gameState={gameState}
      nivelNome={nivelNome}
      onOpenNotifications={() => {
        // TODO: abrir painel de notificações quando existir
      }}
    />
  );
}
