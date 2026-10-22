'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameState, PerguntaQuiz, EixoTematico } from '../../lib/types';
import { aplicarGanho, mapGameStateRow } from '../../lib/gamificacao';
import { lerOfensiva, registrarConclusao, ofensivaVigente } from '../../lib/ofensiva';
import { PLANTAS_COM_QUIZ } from '../../data/desafioDiarioQuiz';
import { PLANTAS_CATALOGO, DESAFIOS_INICIAIS, calcularNivel } from '../../data/plantasData';
import { createClient } from '../../lib/supabase/client';

// Único desafio hoje representado nesta tela — o quiz de 4 perguntas por
// planta é a implementação de DESAFIOS_INICIAIS[0] ('d0', "Desafio Diário:
// Quiz de Plantas"). Fixo aqui porque esta tela sempre corresponde a ele,
// nunca aos demais desafios do catálogo (esses são concluídos por outros
// fluxos, fora deste componente).
const ID_DESAFIO_QUIZ = 'd0';
import { StartScreen } from './StartScreen';
import { QuestionScreen } from './QuestionScreen';
import { FeedbackScreen } from './FeedbackScreen';
import { ResultScreen, StatusRecompensa } from './ResultScreen';

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

export function DesafioDiarioClient({
  gameStateInicial,
  hoje,
}: {
  gameStateInicial: GameState;
  /**
   * Data de hoje (YYYY-MM-DD), calculada no servidor e usada também no primeiro
   * render do cliente. Injetada em vez de chamada aqui dentro por dois motivos:
   * evita divergência de hidratação na virada da meia-noite e torna a lógica de
   * ofensiva testável sem mock de relógio.
   */
  hoje: string;
}) {
  const router = useRouter();

  const [gameState, setGameState] = useState<GameState>(gameStateInicial);
  const [selectedPlantIndex, setSelectedPlantIndex] = useState(0);
  const [tela, setTela] = useState<Tela>('start');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [userAnswers, setUserAnswers] = useState<Array<'A' | 'B' | 'C' | 'D'>>([]);
  const [pointsEarnedThisSession, setPointsEarnedThisSession] = useState(0);
  // O que a tela de resultado pode afirmar sobre a recompensa (ver ResultScreen).
  const [recompensa, setRecompensa] = useState<StatusRecompensa>('pendente');
  const [xpCreditado, setXpCreditado] = useState(0);
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

  // RENISUS vem SEMPRE do catálogo, nunca duplicado no banco de perguntas —
  // a duplicação já causou divergência antes (caso Amora).
  const isRenisus =
    PLANTAS_CATALOGO.find((p) => p.id === currentPlantData.planta_id)?.is_renisus ?? false;

  const handleStart = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedOption(null);
    setPointsEarnedThisSession(0);
    setRecompensa('pendente');
    setXpCreditado(0);
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

  const handleNextStep = async () => {
    if (currentQuestionIndex < currentPlantData.desafios.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setTela('question');
      return;
    }

    // Guarda importante: StartScreen deixa "Refazer" mesmo depois de
    // jaCompletouHoje ser true. Sem esta guarda, refazer o quiz no mesmo dia
    // continuaria concedendo XP/moedas e reescrevendo o registro de hoje em
    // desafios_diarios_concluidos — furando exatamente o "uma vez por dia"
    // que a existência da linha, sozinha, deveria garantir. A tela de
    // resultado desta sessão continua funcionando (o placar é sempre real,
    // calculado das respostas locais); só a recompensa não se repete.
    if (jaCompletouHoje) {
      setRecompensa('treino');
      setTela('result');
      return;
    }

    // Desafio da planta terminou — soma XP e streak.
    // QA-02: o ganho passa por aplicarGanho, que recalcula o nível a partir
    // do XP (Estado Derivado). Antes somava XP direto, então concluir
    // desafios nunca fazia o usuário subir de nível.
    const xpGanho = pointsEarnedThisSession * 5;
    // moedas_recompensa vem do catálogo (DESAFIOS_INICIAIS), não de um
    // número novo inventado aqui — mesmo raciocínio de QA-03 na loja: a
    // recompensa anunciada e a creditada têm que ser o mesmo dado. O código
    // anterior não concedia moeda nenhuma ao concluir o quiz, apesar do
    // catálogo prometer 35 — corrigido aqui, sinalizando a mudança.
    const moedasGanho = DESAFIOS_INICIAIS.find((d) => d.id === ID_DESAFIO_QUIZ)?.moedas_recompensa ?? 0;
    const resultado = aplicarGanho(gameState, { xp: xpGanho, moedas: moedasGanho });

    // QA-05: a ofensiva é recalculada por data. Refazer o desafio no mesmo dia
    // não incrementa (coberto pela guarda acima); um dia de falta reinicia a
    // sequência em 1.
    const ofensiva = registrarConclusao(
      gameState.streak,
      gameState.ultimo_desafio_em,
      hoje
    );

    const gameStateAnterior = gameState;
    const novoEstado: GameState = { ...resultado.estado, ...ofensiva };
    setGameState(novoEstado);
    setRecompensa('pendente');
    setXpCreditado(xpGanho);
    setTela('result');

    // concluir_desafio_diario (Migration 8 — GERMINA_Auditoria_
    // Autenticacao_Autorizacao.md, Fase 1) substitui os três passos
    // sequenciais que existiam aqui (upsert em desafios_diarios_concluidos +
    // insert em atividades + update em game_state) por uma única transação
    // no servidor. Fecha o exploit de replay por data forjada: "hoje" era
    // este mesmo `hoje` recebido como prop (calculado no servidor no
    // primeiro render, mas controlado pelo CLIENTE em qualquer chamada
    // direta subsequente à API) — agora a função recalcula a data no
    // servidor (fuso America/Manaus) e ignora qualquer data que o cliente
    // tente mandar. xp/moedas continuam informados aqui (baseados no placar
    // real das respostas), mas o servidor SEMPRE limita ao teto do catálogo
    // (catalogo_desafios) antes de creditar — nunca aceita o valor cru.
    const supabase = createClient();
    const { data, error } = await supabase.rpc('concluir_desafio_diario', {
      p_desafio_id: ID_DESAFIO_QUIZ,
      p_xp_ganho: xpGanho,
      p_moedas_ganho: moedasGanho,
    });

    if (error || !data?.[0]) {
      // Reverte xp/moedas/streak — o placar na tela de resultado continua
      // exibido (é real, independe da persistência), só a recompensa é
      // desfeita porque não foi confirmada pelo servidor.
      setGameState(gameStateAnterior);
      setRecompensa('falhou');
      console.error('Falha ao registrar desafio concluído:', error?.message);
      return;
    }

    // Substitui o palpite otimista (aplicarGanho + registrarConclusao
    // locais) pelo xp/moedas/streak autoritativos devolvidos pela RPC.
    const confirmado = mapGameStateRow(data[0]);
    setGameState(confirmado);

    // A RPC devolve o estado sem creditar quando o desafio de hoje já existe
    // no banco. O único sinal disso é o XP não ter mudado — e todo desafio
    // concluído rende pelo menos 100 XP, então a comparação é segura.
    const xpReal = confirmado.xp - gameStateAnterior.xp;
    if (xpReal <= 0) {
      setRecompensa('treino');
      return;
    }
    setXpCreditado(xpReal);
    setRecompensa('creditada');

    // Subir de nível era anunciado só no Jardim; aqui passava em silêncio.
    const nivelAntes = calcularNivel(gameStateAnterior.xp);
    const nivelDepois = calcularNivel(confirmado.xp);
    if (nivelDepois.nivel > nivelAntes.nivel) setNivelNovo(nivelDepois.nome);
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
          allPlants={PLANTAS_COM_QUIZ}
          selectedPlantIndex={selectedPlantIndex}
          onSelectPlant={(idx) => {
            setSelectedPlantIndex(idx);
            setCurrentQuestionIndex(0);
          }}
          ofensiva={ofensivaVigente(gameState, hoje)}
          jaCompletouHoje={jaCompletouHoje}
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
