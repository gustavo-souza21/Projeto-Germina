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
 * Fuso de referência do jogo. É o MESMO que a RPC `concluir_desafio_diario`
 * usa no banco (`now() at time zone 'America/Manaus'`) — os dois lados têm que
 * concordar sobre que dia é hoje, senão um diz "já concluído" e o outro não.
 */
export const FUSO_GERMINA = 'America/Manaus';

const FORMATO_DIA = new Intl.DateTimeFormat('en-CA', {
  timeZone: FUSO_GERMINA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/**
 * Data de hoje no fuso do jogo, no formato YYYY-MM-DD.
 *
 * Antes usava os getters locais (`getFullYear`, `getDate`...), que leem o fuso
 * DA MÁQUINA onde o código roda. No navegador de Itacoatiara isso dava certo;
 * no servidor da Vercel, que roda em UTC, não: das 20h à meia-noite o app já
 * achava que era o dia seguinte, enquanto o banco (em America/Manaus) ainda
 * estava no dia atual. O card do Início mostrava o desafio como não feito, a
 * tela liberava jogar de novo e anunciava XP que o servidor (corretamente) não
 * pagava. Fixar o fuso aqui faz servidor, navegador e banco concordarem, em
 * qualquer lugar onde o código rode. (`en-CA` é só o formato: AAAA-MM-DD.)
 */
export function diaLocal(data: Date = new Date()): string {
  return FORMATO_DIA.format(data);
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

/**
 * A ofensiva que a TELA deve mostrar.
 *
 * `game_state.streak` só é regravado quando o usuário conclui um desafio. Quem
 * fez 5 dias seguidos e parou continuava vendo "5 dias" até voltar a jogar —
 * e aí caía para 1 de uma vez. Toda exibição de ofensiva passa por aqui, que
 * devolve 0 quando a sequência já quebrou. O dado bruto continua intocado.
 */
export function ofensivaVigente(
  estado: { streak: number; ultimo_desafio_em?: string },
  hoje: string
): number {
  return lerOfensiva(estado.streak, estado.ultimo_desafio_em, hoje).streak;
}
