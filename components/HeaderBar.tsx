'use client';

import { Header } from './Header';
import { GameState, Profile } from '../lib/types';

export function HeaderBar({
  profile,
  gameState,
  nivelNome,
}: {
  profile: Profile;
  gameState: GameState;
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
