/* ============================================================================
   ECONOMIA DO JOGO — VALORES DE RECOMPENSA E CUSTO

   Pedido da especificação da Sarah (22/10/2026): "os valores de XP e a
   quantidade de moedas concedidas por atividade deverão ser definidos em uma
   tabela de configuração. Não devem ser arbitrados isoladamente em cada tela."

   A FONTE DE VERDADE é a tabela `config_economia` no banco (Migration 14): é
   de lá que as RPCs leem quanto creditar ou cobrar. Este arquivo é o ESPELHO
   que as telas usam para ANUNCIAR a recompensa antes da atividade (spec 1.3).
   Mesmo padrão de catalogo_plantas_xp / PLANTAS_CATALOGO.

   Regra de manutenção: mudou um valor aqui, mude a linha correspondente em
   `config_economia` (um UPDATE no SQL Editor) — e vice-versa. As chaves são
   idênticas nos dois lados de propósito.

   O XP por espécie continua no catálogo de plantas (RENISUS 100, demais 50),
   e o XP/moedas do Desafio Diário em DESAFIOS_INICIAIS / catalogo_desafios.
   ========================================================================= */

export const ECONOMIA = {
  /** Moedas por concluir o estudo de uma espécie pela primeira vez (ficha + quiz). */
  estudo_moedas: 20,
  /** Sementes da espécie concedidas ao concluir o estudo — é o plantio gratuito. */
  estudo_sementes: 1,
  /** Moedas por revisar uma espécie já estudada (refazer o quiz dela). Uma vez por dia por espécie. */
  revisao_moedas: 10,
  /** Preço de uma semente extra de uma espécie já estudada. */
  semente_preco: 10,
  /** Recompensa da colheita. XP baixo de propósito: a horta é fonte de MOEDAS;
   *  o nível vem do estudo (análise de ritmo, 22/10/2026). */
  colheita_xp: 10,
  colheita_moedas: 15,
  /** Sementes da MESMA espécie devolvidas pela colheita (para replantar). */
  colheita_sementes: 1,
  /** Tempo do plantio até a colheita (30 min). */
  ciclo_ms: 1_800_000,
  /** Quanto cada adubo adianta o crescimento (5 min). */
  adubo_bonus_ms: 300_000,
} as const;

/** Moedas do Desafio Diário — lido do catálogo para não duplicar o número. */
export { DESAFIOS_INICIAIS } from '../data/plantasData';

/**
 * Lista "Como ganhar moedas" (spec 1.3: "disponibilizar uma área que explique
 * como obter moedas"). Derivada dos valores acima, nunca escrita à mão na tela.
 */
export function fontesDeMoedas(moedasDesafio: number) {
  return [
    {
      titulo: 'Concluir o estudo de uma espécie',
      detalhe: 'Leia a ficha na Biblioteca e responda o quiz da planta. Também rende a semente dela.',
      moedas: ECONOMIA.estudo_moedas,
    },
    {
      titulo: 'Desafio Diário',
      detalhe: 'O primeiro quiz concluído no dia.',
      moedas: moedasDesafio,
    },
    {
      titulo: 'Colher uma planta',
      detalhe: 'Também devolve uma semente da mesma espécie para replantar.',
      moedas: ECONOMIA.colheita_moedas,
    },
    {
      titulo: 'Revisar uma espécie já estudada',
      detalhe: 'Refazer o quiz de uma planta que você já estudou. Uma vez por dia por espécie.',
      moedas: ECONOMIA.revisao_moedas,
    },
  ];
}
