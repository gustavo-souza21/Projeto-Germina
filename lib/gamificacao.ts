import { GameState } from './types';
import { calcularNivel, NIVEIS_EVOLUCAO, XP_MAXIMO } from '../data/plantasData';

/* ============================================================================
   GAMIFICAÇÃO — MUTAÇÃO CENTRALIZADA DE XP  (QA-02 e QA-04)

   PROBLEMA QUE ISTO RESOLVE
   `JardimClient` e `DesafioDiarioClient` faziam `xp: prev.xp + N` direto no
   setState e nunca recalculavam `nivel_atual`. Resultado: o XP subia e o nível
   ficava congelado — simulando 60 colheitas, o usuário chegava a 5.250 XP
   ainda marcado como nível 5. Como o desbloqueio de canteiro compara
   `gameState.nivel_atual >= terreno.nivel_necessario`, os canteiros 6, 7 e 8
   nunca abriam e a trilha de 8 níveis era inalcançável.

   A causa raiz é ter DOIS dados que precisam concordar (`xp` e `nivel_atual`)
   e três lugares livres para alterar um sem o outro. A correção não é lembrar
   de chamar `calcularNivel()` em cada handler — é remover a possibilidade de
   esquecer. Daqui em diante, todo ganho passa por `aplicarGanho()`, que é a
   ÚNICA função autorizada a escrever em `xp` e `nivel_atual`.

   Regra de revisão: se aparecer `xp: prev.xp +` fora deste arquivo, é bug.
   ========================================================================= */

/** Recompensas de uma ação do jogo. Só `xp` é obrigatório. */
export interface GanhoRecompensa {
  xp: number;
  moedas?: number;
  sementes?: number;
  adubo?: number;
}

export interface ResultadoGanho {
  estado: GameState;
  /** Verdadeiro quando a ação fez o usuário mudar de nível. */
  subiuDeNivel: boolean;
  /** Nome do novo nível, quando houve promoção. */
  nomeNivelNovo?: string;
  /** Verdadeiro quando o usuário atingiu o teto nesta ação. */
  atingiuNivelMaximo: boolean;
}

/** O usuário chegou ao topo da trilha (Nível 8 — Curador Botânico)? */
export function estaNoNivelMaximo(xp: number): boolean {
  return xp >= XP_MAXIMO;
}

/** Último nível da trilha, sem depender do índice literal 8. */
export const NIVEL_MAXIMO = NIVEIS_EVOLUCAO[NIVEIS_EVOLUCAO.length - 1];

/**
 * Aplica um ganho ao estado do jogo.
 *
 * TETO (QA-04): o XP acumulado NÃO é truncado — ele continua somando, porque
 * serve de base para ranking e para as estatísticas da dissertação. O que trava
 * no teto é o NÍVEL: `calcularNivel()` devolve o nível 8 para qualquer valor a
 * partir de 5.000, e a UI passa a exibir "Nível máximo" em vez da fração
 * (senão apareceria "5.250 / 5.000 XP", que não faz sentido).
 *
 * Retorna um objeto em vez do estado puro para que o chamador possa reagir à
 * promoção de nível — no Jardim, subir de nível libera um canteiro, e isso
 * merece aviso.
 */
export function aplicarGanho(estado: GameState, ganho: GanhoRecompensa): ResultadoGanho {
  // Guarda contra XP negativo por bug de chamada: o nível nunca deve regredir
  // por causa de um sinal trocado em algum handler.
  const xpNovo = Math.max(0, estado.xp + ganho.xp);

  const nivelAntes = calcularNivel(estado.xp).nivel;
  const nivelInfoDepois = calcularNivel(xpNovo);
  const subiuDeNivel = nivelInfoDepois.nivel > nivelAntes;

  return {
    estado: {
      ...estado,
      xp: xpNovo,
      // nivel_atual NÃO existe mais em GameState (Estado Derivado) — o nível
      // agora é recalculado por calcularNivel(xp) em cada ponto de leitura,
      // nunca guardado aqui. Este comentário substitui o antigo campo que
      // era o coração da correção do QA-02.
      moedas: estado.moedas + (ganho.moedas ?? 0),
      sementes: estado.sementes + (ganho.sementes ?? 0),
      adubo: estado.adubo + (ganho.adubo ?? 0),
    },
    subiuDeNivel,
    nomeNivelNovo: subiuDeNivel ? nivelInfoDepois.nome : undefined,
    atingiuNivelMaximo: !estaNoNivelMaximo(estado.xp) && estaNoNivelMaximo(xpNovo),
  };
}

/**
 * Debita recursos sem tocar em XP (plantar consome semente, adubar consome
 * adubo, comprar consome moeda). Fica aqui junto de `aplicarGanho` para que
 * toda alteração de economia esteja num arquivo só.
 *
 * Retorna `null` quando não há saldo — o chamador decide o que fazer. Antes,
 * os handlers faziam `if (saldo < 1) return;` silenciosamente, sem avisar.
 */
/**
 * Converte a linha crua de `game_state` (como o Postgres devolve — snake_case,
 * `ultimo_desafio_em` podendo ser `null`) para o tipo `GameState` do cliente.
 *
 * Usada tanto no servidor (`lib/queries/perfil.ts:getGameState`) quanto nos
 * handlers client-side que agora chamam as RPCs de economia
 * (plantar_semente/adubar_terreno/comprar_item_loja/estudar_planta/
 * concluir_desafio_diario/realizar_colheita, todas com `returns setof
 * game_state`) — ter um único ponto de conversão evita que os dois lados
 * traduzam o `null` → `undefined` de formas diferentes.
 */
export function mapGameStateRow(row: {
  user_id: string
  xp: number
  streak: number
  ultimo_desafio_em: string | null
  sementes: number
  adubo: number
  moedas: number
  tema_ativo: string
}): GameState {
  return {
    user_id: row.user_id,
    xp: row.xp,
    streak: row.streak,
    ultimo_desafio_em: row.ultimo_desafio_em ?? undefined,
    sementes: row.sementes,
    adubo: row.adubo,
    moedas: row.moedas,
    tema_ativo: row.tema_ativo,
  };
}

export function debitarRecursos(
  estado: GameState,
  custo: { moedas?: number; sementes?: number; adubo?: number }
): GameState | null {
  if (
    estado.moedas < (custo.moedas ?? 0) ||
    estado.sementes < (custo.sementes ?? 0) ||
    estado.adubo < (custo.adubo ?? 0)
  ) {
    return null;
  }

  return {
    ...estado,
    moedas: estado.moedas - (custo.moedas ?? 0),
    sementes: estado.sementes - (custo.sementes ?? 0),
    adubo: estado.adubo - (custo.adubo ?? 0),
  };
}
