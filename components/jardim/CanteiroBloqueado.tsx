import { Lock } from 'lucide-react';
import { NIVEIS_EVOLUCAO } from '../../data/plantasData';
import { AneisCanteiro } from './AneisCanteiro';

/**
 * ESTADO 1 — BLOQUEADO
 *
 * Terra fria, sem planta, cadeado ao centro e a legenda nomeando o REQUISITO
 * ("Desbloqueie no nível 6"), não o obstáculo. O código antigo dizia só
 * "Bloqueado" — o usuário via a porta fechada, não a chave.
 *
 * O nome do nível aparece junto porque liga o canteiro à trilha de evolução
 * que o usuário já vê no perfil.
 */
export function CanteiroBloqueado({ nivelNecessario }: { nivelNecessario: number }) {
  const nivel = NIVEIS_EVOLUCAO.find((n) => n.nivel === nivelNecessario);

  return (
    <div className="relative w-full">
      <AneisCanteiro variante="inerte" className="w-full h-auto" />

      <div className="absolute inset-0 flex items-center justify-center -translate-y-[12%]">
        <Lock className="w-1/5 h-auto text-white/85" strokeWidth={2.5} aria-hidden />
      </div>

      {/* QA-10 — colisão de rótulos no mobile.
          "Desbloqueie no nível 6" mede ~130px; num viewport de 360px cada
          canteiro tem ~96px e o gap entre eles é de 8px, então a pílula
          transbordava 34px e encostava na do canteiro vizinho.

          A solução é troca de TEXTO por breakpoint, não truncamento: cortar
          com reticências ("Desbloqueie no ní…") esconderia justamente o
          número, que é a informação útil. No mobile mostramos só "Nível 6";
          a partir de sm, a frase completa com o nome do nível.

          `max-w-full` é a trava final: mesmo que um nome de nível cresça no
          futuro, a pílula nunca ultrapassa a largura do próprio canteiro. */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/3 w-full sm:w-[112%] text-center">
        <span className="inline-block max-w-full text-[10px] sm:text-[11px] font-semibold text-white/95 bg-blue-deep/85 rounded-2xl px-2 sm:px-2.5 py-1 leading-tight align-bottom">
          {/* Leitores de tela recebem a frase completa uma única vez; as duas
              versões visuais ficam ocultas para eles. */}
          <span className="sr-only">
            Bloqueado. Desbloqueie no nível {nivelNecessario}
            {nivel ? `, ${nivel.nome}` : ''}.
          </span>

          <span className="sm:hidden" aria-hidden>
            Nível {nivelNecessario}
          </span>

          <span className="hidden sm:inline" aria-hidden>
            Desbloqueie no nível {nivelNecessario}
          </span>

          {/* O nome do nível entra a partir de md, NUMA LINHA PRÓPRIA: com os
              nomes da trilha nova ("Guardião do Conhecimento") a frase numa
              linha só era cortada com reticências e o nome sumia. */}
          {nivel && (
            <span className="hidden md:block font-medium text-white/85" aria-hidden>
              {nivel.nome}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
