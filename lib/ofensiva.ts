/* ============================================================================
   OFENSIVA (STREAK) — CÁLCULO POR DATA  (QA-05)

   O BUG
   `DesafioDiarioClient` fazia `streak: jaCompletouHoje ? streak : streak + 1`,
   e `jaCompletouHoje` era um `useState(false)`. Recarregar a página zerava a
   flag: o usuário podia concluir o desafio, dar F5 e incrementar a ofensiva
   de novo, **infinitas vezes no mesmo dia**. Não havia comparação de datas em
   lugar nenhum do projeto.

   A CORREÇÃO
   Ofensiva deixa de depender do ciclo de vida do componente e passa a ser
   função de duas datas: a do último desafio concluído e a de hoje. Recarregar
   a página não muda nenhuma das duas.

   Mesma família dos QA-01/02/03: o dado de verdade é `ultimo_desafio_em`; o
   `jaCompletouHoje` que a UI consome é derivado dele.

   POR QUE DATA-ONLY (YYYY-MM-DD) E NÃO TIMESTAMP
   A ofensiva é uma regra de calendário, não de intervalo: quem estuda às 23h50
   de segunda e às 00h10 de terça manteve dois dias seguidos, ainda que tenham
   passado 20 minutos. Comparar timestamps daria o resultado errado.
   ========================================================================= */

/**
 * Data local no formato YYYY-MM-DD.
 *
 * Usa os getters locais (não `toISOString()`, que converte para UTC): em
 * Itacoatiara/AM (UTC-4), qualquer estudo após as 20h cairia no dia seguinte se
 * usássemos UTC, e a ofensiva quebraria para quem estuda à noite.
 */
export function diaLocal(data: Date = new Date()): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/**
 * Diferença em dias de calendário entre duas datas YYYY-MM-DD.
 *
 * Ancora ao meio-dia UTC de propósito: assim uma mudança de horário de verão
 * (que desloca o dia em 1h) nunca é suficiente para virar a contagem.
 */
export function diferencaEmDias(deIso: string, ateIso: string): number {
  const MS_DIA = 86_400_000;
  const de = Date.parse(`${deIso}T12:00:00Z`);
  const ate = Date.parse(`${ateIso}T12:00:00Z`);
  if (Number.isNaN(de) || Number.isNaN(ate)) return Number.POSITIVE_INFINITY;
  return Math.round((ate - de) / MS_DIA);
}

export interface EstadoOfensiva {
  /** Ofensiva a gravar após concluir o desafio de hoje. */
  streak: number;
  /** O desafio de hoje já foi concluído? Substitui o antigo useState. */
  jaCompletouHoje: boolean;
  /** A ofensiva foi perdida por falta (mais de um dia sem estudar)? */
  quebrou: boolean;
}

/**
 * Estado da ofensiva ANTES de concluir o desafio de hoje.
 *
 * Serve para a tela inicial saber se deve mostrar "Começar" ou "Refazer", e
 * para exibir a ofensiva já zerada quando o usuário faltou.
 */
export function lerOfensiva(
  streakArmazenado: number,
  ultimoDesafioEm: string | undefined,
  hoje: string
): EstadoOfensiva {
  if (!ultimoDesafioEm) {
    return { streak: 0, jaCompletouHoje: false, quebrou: false };
  }

  const dias = diferencaEmDias(ultimoDesafioEm, hoje);

  // Data futura (relógio do aparelho adiantado, ou fuso trocado em viagem):
  // trata como "hoje" em vez de quebrar a ofensiva de quem não fez nada errado.
  if (dias <= 0) {
    return { streak: streakArmazenado, jaCompletouHoje: true, quebrou: false };
  }

  if (dias === 1) {
    return { streak: streakArmazenado, jaCompletouHoje: false, quebrou: false };
  }

  // Faltou um ou mais dias: a sequência acabou.
  return { streak: 0, jaCompletouHoje: false, quebrou: true };
}

/**
 * Ofensiva DEPOIS de concluir o desafio de hoje.
 *
 * Regras:
 *   • já concluiu hoje  → não incrementa (refazer não conta de novo)
 *   • concluiu ontem    → +1
 *   • faltou ou é a primeira vez → reinicia em 1
 */
export function registrarConclusao(
  streakArmazenado: number,
  ultimoDesafioEm: string | undefined,
  hoje: string
): { streak: number; ultimo_desafio_em: string } {
  const atual = lerOfensiva(streakArmazenado, ultimoDesafioEm, hoje);

  if (atual.jaCompletouHoje) {
    return { streak: atual.streak, ultimo_desafio_em: hoje };
  }

  return {
    streak: atual.quebrou || !ultimoDesafioEm ? 1 : atual.streak + 1,
    ultimo_desafio_em: hoje,
  };
}
