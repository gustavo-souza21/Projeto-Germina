'use client';

import { useState } from 'react';
import { ScannerIA, ScannerIAResult } from './ScannerIA';
import { GameState } from '../lib/types';

export function ScannerClient({ gameStateInicial }: { gameStateInicial: GameState }) {
  const [gameState, setGameState] = useState(gameStateInicial);
  const [ultimaRecompensa, setUltimaRecompensa] = useState<string | null>(null);

  const handleEstudarScan = (scanData: ScannerIAResult) => {
    setGameState((prev) => ({ ...prev, xp: prev.xp + scanData.xp_recompensa }));
    setUltimaRecompensa(`+${scanData.xp_recompensa} XP por estudar ${scanData.nome_popular}!`);
    setTimeout(() => setUltimaRecompensa(null), 3000);
    // TODO: quando o Supabase estiver plugado, persistir o XP em game_state e,
    // se a espécie identificada bater com uma planta do catálogo, adicionar em user_colecao.
  };

  return (
    <div className="relative">
      {ultimaRecompensa && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-green-deep)] text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg animate-in fade-in">
          {ultimaRecompensa}
        </div>
      )}
      <ScannerIA onEstudarScan={handleEstudarScan} />
    </div>
  );
}
