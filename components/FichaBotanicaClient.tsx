'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FichaBotanicaPlanta, EtapaEstudo } from './FichaBotanicaPlanta';
import { GameState, PlantaCatalogo, UserColecao } from '../lib/types';
import { createClient } from '../lib/supabase/client';
import { ExigeLoginModal } from './ExigeLoginModal';

/* ============================================================================
   ESTUDO DE UMA ESPÉCIE = FICHA + QUIZ  (especificação da Sarah, item 1.1)

   Antes: um botão "Estudar & Adicionar à Coleção" creditava o XP com um
   clique, sem verificar nada, e não dava semente nenhuma — o Jardim ficava
   travado para quem só estudava.

   Agora a ficha é a primeira etapa. Ao tocar em "Li a ficha", a leitura fica
   registrada no servidor (registrar_leitura_ficha) e a pessoa segue para o
   quiz daquela espécie. É a conclusão do quiz (concluir_quiz_especie, no
   Desafio Diário) que concede o XP, as moedas e a semente da espécie.
   ========================================================================= */

export function FichaBotanicaClient({
  planta,
  colecaoInicial,
  fichaLidaInicial,
  hoje,
  gameStateInicial,
}: {
  planta: PlantaCatalogo;
  colecaoInicial: UserColecao[];
  /** O servidor já tem a leitura desta ficha registrada para o usuário. */
  fichaLidaInicial: boolean;
  /** Hoje (YYYY-MM-DD, America/Manaus), calculado no servidor. */
  hoje: string;
  /** `null` = visitante sem conta (Fase 4): a ficha é legível, estudar não. */
  gameStateInicial: GameState | null;
}) {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pedindoLogin, setPedindoLogin] = useState(false);

  const registro = colecaoInicial.find((c) => c.planta_id === planta.id);
  const etapa: EtapaEstudo = registro
    ? 'concluido'
    : fichaLidaInicial
      ? 'ficha_lida'
      : 'nao_iniciado';

  const irParaQuiz = () => router.push(`/desafio-diario?planta=${encodeURIComponent(planta.id)}`);

  const handleAvancar = async () => {
    if (!gameStateInicial) {
      setPedindoLogin(true);
      return;
    }

    // Ficha já registrada (ou estudo concluído): é só ir para o quiz.
    if (etapa !== 'nao_iniciado') {
      irParaQuiz();
      return;
    }

    if (salvando) return;
    setSalvando(true);
    setErro(null);

    const supabase = createClient();
    const { error } = await supabase.rpc('registrar_leitura_ficha', { p_planta_id: planta.id });

    if (error) {
      setSalvando(false);
      console.error('Falha ao registrar leitura da ficha:', error.message);
      setErro('Não foi possível registrar a leitura agora. Tente novamente.');
      return;
    }

    irParaQuiz();
  };

  return (
    <>
      <FichaBotanicaPlanta
        planta={planta}
        etapa={etapa}
        sementes={registro?.sementes ?? 0}
        revisaoPagaHoje={registro?.ultima_revisao_em === hoje}
        salvando={salvando}
        onAvancar={handleAvancar}
      />
      {erro && <p className="text-xs text-red-600 font-semibold text-center mt-3">{erro}</p>}

      <ExigeLoginModal
        aberto={pedindoLogin}
        onFechar={() => setPedindoLogin(false)}
        acao={`estudar ${planta.nome_popular} e ganhar a semente dela`}
      />
    </>
  );
}
