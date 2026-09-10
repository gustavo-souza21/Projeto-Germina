'use client';

import { useEffect } from 'react';

/**
 * Lê o tema salvo em game_state.tema_ativo e aplica como atributo data-tema
 * na tag <html>. Os blocos [data-tema="..."] em globals.css fazem o resto —
 * nenhum componente de UI precisa saber que temas existem.
 */
export function TemaAplicador({ tema }: { tema: string }) {
  useEffect(() => {
    document.documentElement.setAttribute('data-tema', tema);
  }, [tema]);

  return null;
}