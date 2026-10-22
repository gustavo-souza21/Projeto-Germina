import { FaseCultivada, FaseCultivo, PlantaCatalogo, TerrenoJardim } from './types';
import { PLANTAS_CATALOGO } from '../data/plantasData';

/* ============================================================================
   GER-UI-15 — RÓTULOS DE FASE

   A UI exibia `Fase: {terreno.fase}` com `capitalize` — ou seja, imprimia o
   valor cru do enum do banco ('muda', 'flor', 'pronto') direto na tela.

   Na referência a tag descreve o ESTADO DO CONHECIMENTO em linguagem do
   usuário ("Estudada", "Nova planta"), não o estado da modelagem interna.

   O `Record<FaseCultivo, string>` é exaustivo de propósito: se alguém
   acrescentar uma fase ao enum, o TypeScript acusa o rótulo faltando aqui em
   vez de deixar vazar um valor de sistema para a tela.
   ========================================================================= */
export const ROTULO_FASE: Record<FaseCultivo, string> = {
  vazio: 'Espaço livre',
  semente: 'Recém-plantada',
  broto: 'Crescendo',
  muda: 'Em desenvolvimento',
  flor: 'Florescendo',
  pronto: 'Pronta para colher',
};

/** Frase curta de apoio, exibida abaixo do rótulo. */
export const DESCRICAO_FASE: Record<FaseCultivada, string> = {
  semente: 'A semente foi plantada e começa a germinar.',
  broto: 'O primeiro broto rompeu a terra.',
  muda: 'A muda ganha folhas e volume.',
  flor: 'A planta floresceu — falta pouco.',
  pronto: 'Colha para ganhar XP, moedas e sementes.',
};

/* ============================================================================
   GER-UI-14 — UNIÃO DISCRIMINADA DO ESTADO DO CANTEIRO

   Antes, os três estados eram decididos por ternários aninhados espalhados em
   quatro pontos do JSX (moldura, cabeçalho, ilustração e botões), cada um
   reavaliando as mesmas condições. A regra ficava duplicada e nada impedia
   que os blocos discordassem entre si.

   Agora a decisão acontece UMA vez, aqui, e o componente só faz `switch`.
   ========================================================================= */
export type EstadoCanteiro =
  | { tipo: 'bloqueado'; nivelNecessario: number }
  | { tipo: 'vazio' }
  | {
      tipo: 'cultivado';
      /** `null` quando o planta_id não existe no catálogo (dado inconsistente). */
      planta: PlantaCatalogo | null;
      /** 'vazio' é impossível aqui por construção do tipo. */
      fase: FaseCultivada;
      adubado: boolean;
      pronto: boolean;
      /** ms até a próxima fase; `null` em 'pronto'. */
      msParaProxima: number | null;
    };

/**
 * Deriva o estado visual de um canteiro a partir do dado bruto.
 *
 * Precedência importa: bloqueio vence tudo. Um canteiro acima do nível do
 * usuário é "bloqueado" mesmo que traga `planta_id` — o que só aconteceria por
 * inconsistência de dados, mas o tipo não impede, então a função decide.
 */
export function derivarEstadoCanteiro(
  terreno: TerrenoJardim,
  nivelUsuario: number,
  agora: number
): EstadoCanteiro {
  if (nivelUsuario < terreno.nivel_necessario) {
    return { tipo: 'bloqueado', nivelNecessario: terreno.nivel_necessario };
  }

  // Ocupação é decidida pela presença de planta, não por uma fase armazenada.
  if (!terreno.planta_id || terreno.plantado_em === undefined) {
    return { tipo: 'vazio' };
  }

  const progresso = calcularProgresso(terreno, agora);

  return {
    tipo: 'cultivado',
    planta: PLANTAS_CATALOGO.find((p) => p.id === terreno.planta_id) ?? null,
    fase: progresso.fase,
    adubado: terreno.adubado,
    pronto: progresso.fase === 'pronto',
    msParaProxima: progresso.msParaProxima,
  };
}

/* ============================================================================
   QA-01 — CRESCIMENTO POR TIMESTAMP

   O bug: `tempo_restante_segundos` era gravado ao plantar e nunca decrementado
   por ninguém. Não havia timer no projeto inteiro. Uma semente ficava na fase
   'semente' para sempre, e como só o canteiro 1 vinha pré-semeado como
   'pronto', depois da primeira colheita não existia mais nenhuma colheita
   possível no app — o core loop terminava ali.

   A correção não é só adicionar um timer: é trocar o MODELO. Fase deixa de ser
   armazenada e passa a ser derivada de `plantado_em`. Consequências:

     • O crescimento continua com o app fechado. `Date.now() - plantado_em` não
       se importa se a aba estava minimizada.
     • Não há estado para dessincronizar: a fase é sempre função pura do tempo.
     • O intervalo do React só faz avançar o relógio; ele não muta terreno
       nenhum. Se o timer falhar, a horta ainda mostra a fase certa no próximo
       render.
   ========================================================================= */

/**
 * Duração de cada fase até a próxima, em ms.
 *
 * Valores curtos de propósito nesta etapa: ciclo completo em 10 minutos, para
 * que a banca e os testes vejam a horta evoluir dentro de uma sessão. Em
 * produção, subir para horas — é o único lugar a alterar.
 */
export const DURACAO_FASE_MS: Record<Exclude<FaseCultivada, 'pronto'>, number> = {
  semente: 1 * 60_000,
  broto: 2 * 60_000,
  muda: 3 * 60_000,
  flor: 4 * 60_000,
};

/** Ordem da progressão. */
export const ORDEM_FASES: FaseCultivada[] = ['semente', 'broto', 'muda', 'flor', 'pronto'];

/** Tempo total do plantio até 'pronto'. */
export const CICLO_COMPLETO_MS = Object.values(DURACAO_FASE_MS).reduce((a, b) => a + b, 0);

/** Quanto tempo o adubo adianta a cada aplicação. */
export const BONUS_ADUBO_MS = 90_000;

/**
 * Folga entre o relógio do aparelho e o do servidor.
 *
 * O botão "Colher" aparece quando o relógio DO APARELHO diz que a planta está
 * pronta; a RPC `realizar_colheita` confere com o relógio DO SERVIDOR e com o
 * horário de plantio que ELE registrou (alguns centésimos de segundo depois do
 * clique em plantar). Quem colhia no instante exato, ou tinha o celular um
 * pouco adiantado, recebia "Não foi possível colher agora". Atrasar a fase na
 * tela por alguns segundos garante que, quando o botão aparece, o servidor já
 * concorda. Só afeta a EXIBIÇÃO: o ciclo real continua sendo o do servidor.
 */
export const MARGEM_SINCRONIA_MS = 3_000;

export interface ProgressoCultivo {
  fase: FaseCultivada;
  /** ms até a próxima fase. `null` quando já está em 'pronto'. */
  msParaProxima: number | null;
  proximaFase: FaseCultivada | null;
}

/**
 * Deriva a fase e o tempo restante a partir do timestamp de plantio.
 *
 * `agora` é injetado em vez de chamar `Date.now()` aqui dentro: torna a função
 * pura (testável sem mock de relógio) e permite que servidor e cliente usem o
 * mesmo instante no primeiro render, evitando erro de hidratação.
 */
export function calcularProgresso(terreno: TerrenoJardim, agora: number): ProgressoCultivo {
  const decorrido = Math.max(
    0,
    Math.max(0, agora - (terreno.plantado_em ?? agora)) +
      (terreno.bonus_adubo_ms ?? 0) -
      MARGEM_SINCRONIA_MS
  );

  let acumulado = 0;
  for (const fase of ORDEM_FASES) {
    if (fase === 'pronto') break;

    const duracao = DURACAO_FASE_MS[fase as Exclude<FaseCultivada, 'pronto'>];
    if (decorrido < acumulado + duracao) {
      const indice = ORDEM_FASES.indexOf(fase);
      return {
        fase,
        msParaProxima: acumulado + duracao - decorrido,
        proximaFase: ORDEM_FASES[indice + 1],
      };
    }
    acumulado += duracao;
  }

  return { fase: 'pronto', msParaProxima: null, proximaFase: null };
}

/** Formata o tempo restante para exibição ("2min 15s", "48s"). */
export function formatarTempoRestante(ms: number): string {
  const totalSegundos = Math.max(0, Math.ceil(ms / 1000));
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;
  return minutos > 0 ? `${minutos}min ${segundos}s` : `${segundos}s`;
}
