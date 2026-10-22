'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { JardimConhecimento } from './JardimConhecimento';
import { GameState, TerrenoJardim, UserColecao } from '../lib/types';
import { aplicarGanho, debitarRecursos, mapGameStateRow } from '../lib/gamificacao';
import { BONUS_ADUBO_MS, calcularProgresso } from '../lib/jardim';
import { buscarItemLoja } from '../lib/loja';
import { ECONOMIA } from '../lib/economia';
import { createClient } from '../lib/supabase/client';

/** Frequência do relógio. 1s é suficiente para o contador regressivo dos canteiros. */
const INTERVALO_RELOGIO_MS = 1000;

export function JardimClient({
  gameStateInicial,
  terrenosIniciais,
  colecaoUsuario,
  agoraInicial,
}: {
  gameStateInicial: GameState;
  terrenosIniciais: TerrenoJardim[];
  colecaoUsuario: UserColecao[];
  /**
   * Instante calculado no servidor. O primeiro render do cliente usa este mesmo
   * valor, e não `Date.now()`, para que servidor e cliente derivem a MESMA fase
   * e não haja erro de hidratação — sem isso, uma planta na virada de fase
   * renderizaria diferente dos dois lados.
   */
  agoraInicial: number;
}) {
  const router = useRouter();
  const [gameState, setGameState] = useState(gameStateInicial);
  const [terrenos, setTerrenos] = useState(terrenosIniciais);
  // Sementes são POR ESPÉCIE (Migration 14) e moram na coleção.
  const [colecao, setColecao] = useState(colecaoUsuario);
  // Aviso de promoção de nível. Subir de nível libera um canteiro, então a
  // mudança precisa ser anunciada — antes ela acontecia em silêncio.
  const [avisoNivel, setAvisoNivel] = useState<string | null>(null);

  /* ------------------------------------------------------------------------
     QA-01 — O RELÓGIO DA HORTA

     O intervalo NÃO muta terreno nenhum: ele só avança o instante de
     referência. A fase é função pura de (plantado_em, agora), derivada a cada
     render por `calcularProgresso()`.

     Isso tem uma consequência importante: se a aba ficar minimizada e o
     navegador estrangular o timer, nada se perde. Ao voltar, o próximo tick lê
     o relógio real e a planta aparece na fase correta — como uma horta de
     verdade, que cresce enquanto ninguém olha.
     --------------------------------------------------------------------- */
  const [agora, setAgora] = useState(agoraInicial);

  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), INTERVALO_RELOGIO_MS);
    // Cleanup obrigatório: sem isto, cada navegação para o Jardim deixaria um
    // intervalo órfão rodando e chamando setState em componente desmontado.
    return () => clearInterval(id);
  }, []);

  /**
   * Plantar e Adubar agora chamam as RPCs `plantar_semente`/`adubar_terreno`
   * (Migration 8 — GERMINA_Auditoria_Autenticacao_Autorizacao.md, Fase 1).
   *
   * Antes, este handler escrevia direto em terrenos_jardim + game_state por
   * duas chamadas SEQUENCIAIS — e `plantado_em` era o relógio do CLIENTE
   * (`new Date(agoraPlantio).toISOString()`), então nada impedia mandar um
   * timestamp no passado para a planta nascer já "pronta". Agora o cliente só
   * manda a AÇÃO (qual terreno, qual planta); `plantado_em` é sempre `now()`
   * calculado dentro da função, e o débito de sementes + a ocupação do
   * terreno acontecem na mesma transação — sem a janela "terreno plantado,
   * semente não debitada" que existia entre as duas chamadas antigas.
   *
   * A atualização otimista de `terrenos`/`gameState` continua aqui (feedback
   * visual instantâneo), mas o `gameState` é substituído pelo valor
   * autoritativo devolvido pela RPC assim que ela responde — nunca fica só
   * no palpite do cliente.
   */
  const handlePlantSemente = async (
    terrenoId: number,
    plantaId: string,
    comprar: boolean
  ): Promise<boolean> => {
    /* Migration 14: planta-se com a semente DA ESPÉCIE (a primeira vem do
       estudo — o plantio gratuito). Sem semente, `comprar` paga o preço da
       configuração e planta na mesma transação no servidor (plantar_especie),
       então nunca há moeda descontada sem plantio, nem o contrário. */
    const registro = colecao.find((c) => c.planta_id === plantaId);
    if (!registro) return false;
    const usaSemente = registro.sementes >= 1;
    if (!usaSemente && !comprar) return false;

    const estadoDebitado = usaSemente
      ? gameState
      : debitarRecursos(gameState, { moedas: ECONOMIA.semente_preco });
    if (!estadoDebitado) return false; // sem moedas — a opção já vem desabilitada na UI

    const terrenosAnteriores = terrenos;
    const gameStateAnterior = gameState;
    const colecaoAnterior = colecao;
    const agoraPlantio = Date.now();

    if (usaSemente) {
      setColecao((prev) =>
        prev.map((c) => (c.planta_id === plantaId ? { ...c, sementes: c.sementes - 1 } : c))
      );
    }

    setTerrenos((prev) =>
      prev.map((t) =>
        t.id === terrenoId
          ? {
              ...t,
              planta_id: plantaId,
              // Marca o instante do plantio; a fase sai daqui por derivação.
              // Só otimista — o valor real (now() do servidor) vem da RPC.
              plantado_em: agoraPlantio,
              bonus_adubo_ms: 0,
              adubado: false,
            }
          : t
      )
    );
    setGameState(estadoDebitado);

    const supabase = createClient();
    const { data, error } = await supabase.rpc('plantar_especie', {
      p_terreno_id: terrenoId,
      p_planta_id: plantaId,
      p_comprar: !usaSemente,
    });

    if (error || !data?.[0]) {
      setTerrenos(terrenosAnteriores);
      setGameState(gameStateAnterior);
      setColecao(colecaoAnterior);
      console.error('Falha ao plantar semente:', error?.message);
      return false;
    }

    setGameState(mapGameStateRow(data[0]));
    return true;
  };

  const handleAdubarTerreno = async (terrenoId: number): Promise<boolean> => {
    const terreno = terrenos.find((t) => t.id === terrenoId);
    if (!terreno) return false;

    const estadoDebitado = debitarRecursos(gameState, { adubo: 1 });
    if (!estadoDebitado) return false;

    const terrenosAnteriores = terrenos;
    const gameStateAnterior = gameState;
    // O adubo ADIANTA o relógio da planta em vez de encurtar um contador:
    // soma-se um bônus ao tempo decorrido, o que equivale a ter plantado antes.
    const novoBonus = (terreno.bonus_adubo_ms ?? 0) + BONUS_ADUBO_MS;

    setTerrenos((prev) =>
      prev.map((t) => (t.id === terrenoId ? { ...t, adubado: true, bonus_adubo_ms: novoBonus } : t))
    );
    setGameState(estadoDebitado);

    const supabase = createClient();
    const { data, error } = await supabase.rpc('adubar_terreno', {
      p_terreno_id: terrenoId,
    });

    if (error || !data?.[0]) {
      setTerrenos(terrenosAnteriores);
      setGameState(gameStateAnterior);
      console.error('Falha ao adubar terreno:', error?.message);
      return false;
    }

    setGameState(mapGameStateRow(data[0]));
    return true;
  };

  const handleColherPlanta = async (terrenoId: number): Promise<boolean> => {
    const terreno = terrenos.find((t) => t.id === terrenoId);
    if (!terreno?.plantado_em) return false;

    // Guarda de regra: a UI só mostra "Colher" quando a planta está pronta, mas
    // o handler não pode confiar nisso — um clique fora de hora daria XP grátis.
    if (calcularProgresso(terreno, Date.now()).fase !== 'pronto') return false;

    const plantaIdColhida = terreno.planta_id;
    if (!plantaIdColhida) return false;

    // Guarda os dois estados anteriores para rollback caso a RPC falhe — a UI
    // já foi atualizada de forma otimista (abaixo) antes da resposta do servidor.
    const terrenosAnteriores = terrenos;
    const gameStateAnterior = gameState;
    const colecaoAnterior = colecao;

    // A colheita devolve semente da MESMA espécie, para replantar.
    setColecao((prev) =>
      prev.map((c) =>
        c.planta_id === plantaIdColhida ? { ...c, sementes: c.sementes + ECONOMIA.colheita_sementes } : c
      )
    );

    setTerrenos((prev) =>
      prev.map((t) =>
        t.id === terrenoId
          ? {
              id: t.id,
              nivel_necessario: t.nivel_necessario,
              planta_id: undefined,
              plantado_em: undefined,
              bonus_adubo_ms: 0,
              adubado: false,
            }
          : t
      )
    );
    // QA-02: o ganho passa por aplicarGanho, que recalcula o nível a partir do
    // XP (Estado Derivado) — antes somava XP direto e o nível ficava
    // congelado, travando o desbloqueio dos canteiros 6, 7 e 8.
    const resultado = aplicarGanho(gameState, {
      xp: ECONOMIA.colheita_xp,
      moedas: ECONOMIA.colheita_moedas,
    });
    setGameState(resultado.estado);

    if (resultado.subiuDeNivel) {
      setAvisoNivel(`Novo nível: ${resultado.nomeNivelNovo}! Um canteiro foi liberado.`);
    }

    // Persistência real: a colheita inteira (limpar terreno + creditar
    // game_state + logar atividade + logar colheita) roda como uma única
    // transação atômica na RPC realizar_colheita — reescrita na Migration 8
    // para não confiar mais em p_xp/p_moedas/p_sementes do chamador (a
    // recompensa agora é uma constante fixada DENTRO da função) e para exigir
    // planta_id ocupado + ciclo de crescimento realmente decorrido, fechando
    // o exploit de "colher o mesmo canteiro em loop" que a versão anterior
    // permitia.
    const supabase = createClient();
    const { data, error } = await supabase.rpc('realizar_colheita', {
      p_terreno_id: terrenoId,
    });

    if (error || !data?.[0]) {
      // Rollback: desfaz a atualização otimista se o servidor recusou a colheita.
      setTerrenos(terrenosAnteriores);
      setGameState(gameStateAnterior);
      setColecao(colecaoAnterior);
      setAvisoNivel(null);
      console.error('Falha ao colher planta:', error?.message);
      return false;
    }

    // Substitui o palpite otimista (aplicarGanho com constantes locais) pelo
    // valor autoritativo devolvido pela RPC.
    setGameState(mapGameStateRow(data[0]));
    // O XP mudou: cabeçalho e menu lateral (layout do servidor) precisam
    // acompanhar, senão mostram o nível antigo (spec 6.3).
    router.refresh();
    return true;
  };

  /**
   * A lógica de mutação vive aqui, não em components/jardim/LojaModal.tsx —
   * mesmo padrão de handleColherPlanta: LojaModal só dispara `onComprarItem`
   * e não guarda estado nenhum, é JardimClient quem é dono do `gameState`.
   * O clique/mensagem de sucesso em si (que É pedido do LojaModal) está lá.
   */
  const handleComprarItem = async (itemId: string): Promise<boolean> => {
    // QA-03: preço e quantidade são lidos do catálogo, não recebidos da UI.
    // Antes o handler ignorava a quantidade anunciada e creditava sempre 1 —
    // o usuário pagava por 3 adubos e recebia um.
    const item = buscarItemLoja(itemId);
    if (!item) return false;

    const estadoDebitado = debitarRecursos(gameState, { moedas: item.custo });
    if (!estadoDebitado) return false; // sem saldo — o botão já vem desabilitado na UI

    const novoEstado: GameState = {
      ...estadoDebitado,
      adubo:
        item.recurso === 'adubo' ? estadoDebitado.adubo + item.quantidade : estadoDebitado.adubo,
      sementes:
        item.recurso === 'sementes'
          ? estadoDebitado.sementes + item.quantidade
          : estadoDebitado.sementes,
      tema_ativo: item.recurso === 'tema' ? item.nome : estadoDebitado.tema_ativo,
    };

    const gameStateAnterior = gameState;
    setGameState(novoEstado);

    // comprar_item_loja (Migration 8) lê preço/quantidade/recurso de
    // catalogo_itens_loja no servidor e faz débito+crédito+log em uma
    // transação só — antes eram três chamadas separadas (`game_state`
    // update, `atividades` insert) confiando no `item` lido do catálogo
    // TypeScript do cliente, que também é o dado que o QA-03 já mostrou dar
    // pra divergir do texto exibido se alguém chamar a tabela direto.
    const supabase = createClient();
    const { data, error } = await supabase.rpc('comprar_item_loja', {
      p_item_id: itemId,
    });

    if (error || !data?.[0]) {
      setGameState(gameStateAnterior);
      console.error('Falha ao processar compra:', error?.message);
      return false;
    }

    setGameState(mapGameStateRow(data[0]));
    return true;
  };

  return (
    <JardimConhecimento
      agora={agora}
      avisoNivel={avisoNivel}
      onDispensarAvisoNivel={() => setAvisoNivel(null)}
      gameState={gameState}
      terrenos={terrenos}
      colecaoUsuario={colecao}
      onPlantSemente={handlePlantSemente}
      onAdubarTerreno={handleAdubarTerreno}
      onColherPlanta={handleColherPlanta}
      onComprarItem={handleComprarItem}
    />
  );
}
