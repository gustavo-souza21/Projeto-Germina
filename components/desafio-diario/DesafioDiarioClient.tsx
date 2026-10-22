'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameState, PerguntaQuiz, EixoTematico, UserColecao } from '../../lib/types';
import { slugify } from '../../lib/slug';
import { aplicarGanho, mapGameStateRow, mensagemSubidaNivel } from '../../lib/gamificacao';
import { lerOfensiva, registrarConclusao, ofensivaVigente } from '../../lib/ofensiva';
import { PLANTAS_COM_QUIZ } from '../../data/desafioDiarioQuiz';
import { PLANTAS_CATALOGO, DESAFIOS_INICIAIS } from '../../data/plantasData';
import { createClient } from '../../lib/supabase/client';

// Único desafio hoje representado nesta tela — o quiz de 4 perguntas por
// planta é a implementação de DESAFIOS_INICIAIS[0] ('d0', "Desafio Diário:
// Quiz de Plantas"). Fixo aqui porque esta tela sempre corresponde a ele,
// nunca aos demais desafios do catálogo (esses são concluídos por outros
// fluxos, fora deste componente).
const ID_DESAFIO_QUIZ = 'd0';
import { StartScreen, SituacaoEstudo } from './StartScreen';
import { QuestionScreen } from './QuestionScreen';
import { FeedbackScreen } from './FeedbackScreen';
import { ResultScreen, StatusRecompensa, ResultadoEstudo } from './ResultScreen';

type Letra = 'A' | 'B' | 'C' | 'D';
const LETRAS: Letra[] = ['A', 'B', 'C', 'D'];

/**
 * Embaralha as alternativas de uma pergunta e remapeia o gabarito.
 *
 * Motivo: escrito à mão, o banco ficou com o gabarito concentrado em A/B/C
 * (D aparecia em apenas 3 das 60). Sem isso, quem joga muito aprende a posição
 * da resposta em vez do conteúdo. O embaralhamento é determinístico por
 * pergunta (semente = planta + índice), então a ordem não muda entre a tela de
 * resposta e a de feedback, nem "pula" a cada re-render.
 */
function embaralharAlternativas(desafio: PerguntaQuiz, semente: string): PerguntaQuiz {
  // Hash simples e estável a partir da semente.
  let h = 0;
  for (let i = 0; i < semente.length; i++) h = (h * 31 + semente.charCodeAt(i)) >>> 0;

  const ordem = [...LETRAS];
  for (let i = ordem.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
  }

  const alternativas = { A: '', B: '', C: '', D: '' } as Record<Letra, string>;
  let novaCorreta: Letra = desafio.resposta_correta;
  ordem.forEach((origem, idx) => {
    const destino = LETRAS[idx];
    alternativas[destino] = desafio.alternativas[origem];
    if (origem === desafio.resposta_correta) novaCorreta = destino;
  });

  return { ...desafio, alternativas, resposta_correta: novaCorreta };
}

/**
 * Fecha o gap crítico da conquista 'Curador Atento': ela progride por linha em
 * `respostas_quiz`, uma por PERGUNTA respondida (não uma por quiz completo).
 * Sem este insert a tabela nunca recebia dado nenhum e a conquista nunca
 * avançava, apesar de existir desde a Migration 7.
 *
 * Fire-and-forget de propósito (chamada sem await no call site): isto é
 * telemetria de progresso de conquista, não afeta o placar exibido nem tem
 * estado de UI próprio — uma falha de rede aqui não deve travar ou atrasar a
 * transição pra tela de feedback, que já é local e instantânea. Erro só vai
 * pro console, para depuração.
 */
async function registrarRespostaQuiz(
  userId: string,
  plantaId: string,
  eixo: EixoTematico,
  correta: boolean
) {
  const supabase = createClient();
  const { error } = await supabase.from('respostas_quiz').insert({
    user_id: userId,
    planta_id: plantaId,
    eixo,
    correta,
  });
  if (error) {
    console.error('Falha ao registrar resposta do quiz:', error.message);
  }
}

type Tela = 'start' | 'question' | 'feedback' | 'result';

/** Resposta de concluir_quiz_especie (jsonb). */
interface RespostaQuizEspecie {
  status: Exclude<ResultadoEstudo['status'], 'pendente' | 'falhou'>;
  xp_ganho: number;
  moedas_ganho: number;
  sementes_ganhas: number;
  game_state: Parameters<typeof mapGameStateRow>[0];
}

export function DesafioDiarioClient({
  gameStateInicial,
  hoje,
  plantaInicialId,
  colecaoInicial,
  fichasLidasIniciais,
}: {
  gameStateInicial: GameState;
  /**
   * Data de hoje (YYYY-MM-DD), calculada no servidor e usada também no primeiro
   * render do cliente. Injetada em vez de chamada aqui dentro por dois motivos:
   * evita divergência de hidratação na virada da meia-noite e torna a lógica de
   * ofensiva testável sem mock de relógio.
   */
  hoje: string;
  /** Espécie já selecionada ao chegar pela ficha (`/desafio-diario?planta=4`). */
  plantaInicialId?: string;
  /** Espécies com estudo concluído. */
  colecaoInicial: UserColecao[];
  /** Espécies com a ficha já lida (1ª etapa do estudo). */
  fichasLidasIniciais: string[];
}) {
  const router = useRouter();

  const indiceInicial = Math.max(
    0,
    PLANTAS_COM_QUIZ.findIndex((p) => p.planta_id === plantaInicialId)
  );

  const [gameState, setGameState] = useState<GameState>(gameStateInicial);
  const [concluidas, setConcluidas] = useState<Set<string>>(
    () => new Set(colecaoInicial.map((c) => c.planta_id))
  );
  const fichasLidas = useMemo(() => new Set(fichasLidasIniciais), [fichasLidasIniciais]);
  // Espécies cuja revisão já rendeu moedas hoje (ultima_revisao_em === hoje).
  const [revisadasHoje, setRevisadasHoje] = useState<Set<string>>(
    () => new Set(colecaoInicial.filter((c) => c.ultima_revisao_em === hoje).map((c) => c.planta_id))
  );
  const [selectedPlantIndex, setSelectedPlantIndex] = useState(indiceInicial);
  const [tela, setTela] = useState<Tela>('start');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [userAnswers, setUserAnswers] = useState<Array<'A' | 'B' | 'C' | 'D'>>([]);
  const [pointsEarnedThisSession, setPointsEarnedThisSession] = useState(0);
  // O que a tela de resultado pode afirmar sobre cada recompensa (ver ResultScreen).
  const [recompensa, setRecompensa] = useState<StatusRecompensa>('pendente');
  const [xpCreditado, setXpCreditado] = useState(0);
  const [estudo, setEstudo] = useState<ResultadoEstudo>({ status: 'pendente', xp: 0, moedas: 0 });
  const [nivelNovo, setNivelNovo] = useState<string | null>(null);
  /* QA-05: antes era `useState(false)` — recarregar a página zerava a flag e o
     usuário incrementava a ofensiva infinitas vezes no mesmo dia. Agora é
     DERIVADO da data do último desafio concluído, que sobrevive ao reload. */
  const jaCompletouHoje = lerOfensiva(
    gameState.streak,
    gameState.ultimo_desafio_em,
    hoje
  ).jaCompletouHoje;

  const currentPlantData = PLANTAS_COM_QUIZ[selectedPlantIndex] || PLANTAS_COM_QUIZ[0];
  const currentDesafio = useMemo(() => {
    const original = currentPlantData.desafios[currentQuestionIndex];
    return embaralharAlternativas(original, `${currentPlantData.planta_id}-${currentQuestionIndex}`);
  }, [currentPlantData, currentQuestionIndex]);

  // RENISUS e XP vêm SEMPRE do catálogo, nunca duplicados no banco de
  // perguntas — a duplicação já causou divergência antes (caso Amora).
  const plantaCatalogo = PLANTAS_CATALOGO.find((p) => p.id === currentPlantData.planta_id);
  const isRenisus = plantaCatalogo?.is_renisus ?? false;
  const hrefFicha = plantaCatalogo ? `/biblioteca/${slugify(plantaCatalogo.nome_popular)}` : '/biblioteca';
  const desafioCatalogo = DESAFIOS_INICIAIS.find((d) => d.id === ID_DESAFIO_QUIZ);
  const moedasDesafio = desafioCatalogo?.moedas_recompensa ?? 0;

  const situacaoDe = (plantaId: string): SituacaoEstudo =>
    concluidas.has(plantaId) ? 'concluido' : fichasLidas.has(plantaId) ? 'ficha_lida' : 'nao_iniciado';

  const handleStart = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedOption(null);
    setPointsEarnedThisSession(0);
    setRecompensa('pendente');
    setXpCreditado(0);
    setEstudo({ status: 'pendente', xp: 0, moedas: 0 });
    setNivelNovo(null);
    setTela('question');
  };

  const handleConfirmAnswer = () => {
    if (!selectedOption) return;
    const isCorrect = selectedOption === currentDesafio.resposta_correta;
    const pontosDaPergunta = isCorrect ? 10 : 5;

    setPointsEarnedThisSession((prev) => prev + pontosDaPergunta);
    setUserAnswers((prev) => [...prev, selectedOption]);
    setTela('feedback');

    registrarRespostaQuiz(
      gameState.user_id,
      currentPlantData.planta_id,
      currentDesafio.eixo,
      isCorrect
    );
  };

  /**
   * Fim do quiz. Dois eventos INDEPENDENTES, cada um com sua RPC e sua regra
   * de repetição:
   *   1. Desafio do dia (concluir_desafio_diario): o primeiro quiz do dia, de
   *      qualquer espécie. Refazer no mesmo dia é treino.
   *   2. Estudo da espécie (concluir_quiz_especie): na primeira conclusão,
   *      com a ficha lida, rende XP + moedas + a semente da espécie; depois,
   *      revisão com moedas uma vez por dia (decisão de 22/10/2026).
   */
  const handleNextStep = async () => {
    if (currentQuestionIndex < currentPlantData.desafios.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setTela('question');
      return;
    }

    const supabase = createClient();
    const gameStateAnterior = gameState;
    let estadoFinal = gameState;
    setEstudo({ status: 'pendente', xp: 0, moedas: 0 });

    // ---- 1. Desafio do dia ------------------------------------------------
    if (jaCompletouHoje) {
      // StartScreen deixa refazer depois de concluído; sem esta guarda o
      // "uma vez por dia" dependeria só do servidor e a tela anunciaria XP.
      setRecompensa('treino');
      setTela('result');
    } else {
      // QA-02: o ganho passa por aplicarGanho (recalcula o nível pelo XP).
      const xpGanho = pointsEarnedThisSession * 5;
      const resultado = aplicarGanho(gameState, { xp: xpGanho, moedas: moedasDesafio });
      // QA-05: a ofensiva é recalculada por data.
      const ofensiva = registrarConclusao(gameState.streak, gameState.ultimo_desafio_em, hoje);
      setGameState({ ...resultado.estado, ...ofensiva });
      setRecompensa('pendente');
      setXpCreditado(xpGanho);
      setTela('result');

      // O servidor recalcula a data (America/Manaus) e limita xp/moedas ao
      // teto de catalogo_desafios — nunca aceita o valor cru do cliente.
      const { data, error } = await supabase.rpc('concluir_desafio_diario', {
        p_desafio_id: ID_DESAFIO_QUIZ,
        p_xp_ganho: xpGanho,
        p_moedas_ganho: moedasDesafio,
      });

      if (error || !data?.[0]) {
        setGameState(gameStateAnterior);
        setRecompensa('falhou');
        console.error('Falha ao registrar desafio concluído:', error?.message);
      } else {
        estadoFinal = mapGameStateRow(data[0]);
        setGameState(estadoFinal);
        // A RPC devolve o estado sem creditar quando o desafio de hoje já
        // existe no banco; todo desafio concluído rende pelo menos 100 XP.
        const xpReal = estadoFinal.xp - gameStateAnterior.xp;
        if (xpReal <= 0) {
          setRecompensa('treino');
        } else {
          setXpCreditado(xpReal);
          setRecompensa('creditada');
        }
      }
    }

    // ---- 2. Estudo da espécie ---------------------------------------------
    const { data: respostaEstudo, error: erroEstudo } = await supabase.rpc('concluir_quiz_especie', {
      p_planta_id: currentPlantData.planta_id,
      p_planta_nome: currentPlantData.planta,
    });

    if (erroEstudo || !respostaEstudo) {
      setEstudo({ status: 'falhou', xp: 0, moedas: 0 });
      console.error('Falha ao registrar o estudo da espécie:', erroEstudo?.message);
    } else {
      const r = respostaEstudo as unknown as RespostaQuizEspecie;
      setEstudo({ status: r.status, xp: r.xp_ganho, moedas: r.moedas_ganho });
      estadoFinal = mapGameStateRow(r.game_state);
      setGameState(estadoFinal);
      if (r.status === 'estudo_concluido') {
        setConcluidas((prev) => new Set(prev).add(currentPlantData.planta_id));
      }
      // A conclusão e a revisão paga ocupam a revisão do dia (regra do servidor).
      if (r.status === 'estudo_concluido' || r.status === 'revisao_recompensada') {
        setRevisadasHoje((prev) => new Set(prev).add(currentPlantData.planta_id));
      }
    }

    // Subir de nível era anunciado só no Jardim; aqui passava em silêncio.
    setNivelNovo(mensagemSubidaNivel(gameStateAnterior.xp, estadoFinal.xp));

    // Cabeçalho e menu lateral vêm do layout, renderizado no servidor; sem
    // isto continuariam mostrando o XP e o nível de antes (spec 6.3).
    router.refresh();
  };

  // Compara com o gabarito JÁ EMBARALHADO de cada pergunta — comparar com o
  // gabarito original contaria acertos errados depois do embaralhamento.
  const correctCount = userAnswers.reduce((count, ans, idx) => {
    const original = currentPlantData.desafios[idx];
    if (!original) return count;
    const alvo = embaralharAlternativas(original, `${currentPlantData.planta_id}-${idx}`)
      .resposta_correta;
    return ans === alvo ? count + 1 : count;
  }, 0);

  return (
    <div className="py-2">
      {tela === 'start' && (
        <StartScreen
          plantaData={currentPlantData}
          isRenisus={isRenisus}
          xpEstudo={plantaCatalogo?.xp_recompensa ?? 0}
          hrefFicha={hrefFicha}
          allPlants={PLANTAS_COM_QUIZ}
          selectedPlantIndex={selectedPlantIndex}
          onSelectPlant={(idx) => {
            setSelectedPlantIndex(idx);
            setCurrentQuestionIndex(0);
          }}
          situacaoDe={situacaoDe}
          revisaoPagaHoje={(id) => revisadasHoje.has(id)}
          ofensiva={ofensivaVigente(gameState, hoje)}
          jaCompletouHoje={jaCompletouHoje}
          xpDesafio={desafioCatalogo?.xp_recompensa ?? 0}
          moedasDesafio={moedasDesafio}
          onStart={handleStart}
        />
      )}

      {tela === 'question' && (
        <QuestionScreen
          plantaData={currentPlantData}
          isRenisus={isRenisus}
          desafio={currentDesafio}
          currentIndex={currentQuestionIndex}
          totalQuestions={currentPlantData.desafios.length}
          selectedOption={selectedOption}
          onSelectOption={setSelectedOption}
          onConfirm={handleConfirmAnswer}
        />
      )}

      {tela === 'feedback' && selectedOption && (
        <FeedbackScreen
          plantaData={currentPlantData}
          isRenisus={isRenisus}
          desafio={currentDesafio}
          currentIndex={currentQuestionIndex}
          totalQuestions={currentPlantData.desafios.length}
          userSelection={selectedOption}
          onNext={handleNextStep}
          modoTreino={jaCompletouHoje}
        />
      )}

      {tela === 'result' && (
        <ResultScreen
          plantaData={currentPlantData}
          correctAnswersCount={correctCount}
          totalQuestions={currentPlantData.desafios.length}
          pointsEarned={pointsEarnedThisSession}
          recompensa={recompensa}
          xpGanho={xpCreditado}
          moedasDesafio={moedasDesafio}
          estudo={estudo}
          hrefFicha={hrefFicha}
          ofensiva={ofensivaVigente(gameState, hoje)}
          nivelNovo={nivelNovo}
          onHome={() => router.push('/inicio')}
          onRetry={handleStart}
          onVerBiblioteca={() => router.push('/biblioteca')}
        />
      )}
    </div>
  );
}
