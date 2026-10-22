'use client';

import React, { useState } from 'react';
import { GameState, TerrenoJardim, UserColecao } from '../lib/types';
import { PLANTAS_CATALOGO, calcularNivel } from '../data/plantasData';
import { ShoppingBag, PartyPopper, X } from 'lucide-react';
import { Canteiro } from './jardim/Canteiro';
import { FundoHorta } from './jardim/FundoHorta';
import { LojaModal } from './jardim/LojaModal';
import { PainelJardim } from './jardim/PainelJardim';
import { ECONOMIA } from '../lib/economia';
import { totalSementes } from '../lib/sementes';
import { derivarEstadoCanteiro } from '../lib/jardim';

/**
 * Distribuição dos 8 canteiros em três fileiras.
 *
 * A escala decresce em direção ao fundo (1.0 → 0.86), o que sugere
 * profundidade sem exigir projeção isométrica de verdade. `largura` controla
 * quanto da cena cada fileira ocupa: a do fundo é mais estreita, reforçando o
 * ponto de fuga.
 */
const FILEIRAS = [
  { nome: 'fundo', ids: [1, 2], largura: 'max-w-[62%] sm:max-w-[52%]', espacamento: 'gap-3 sm:gap-8 scale-[0.82] sm:scale-[0.86]' },
  { nome: 'meio', ids: [3, 4, 5], largura: 'max-w-[88%] sm:max-w-[80%]', espacamento: 'gap-2 sm:gap-6 scale-[0.90] sm:scale-[0.93]' },
  { nome: 'frente', ids: [6, 7, 8], largura: 'max-w-full', espacamento: 'gap-1.5 sm:gap-5 scale-95 sm:scale-100' },
] as const;

interface JardimConhecimentoProps {
  gameState: GameState;
  terrenos: TerrenoJardim[];
  colecaoUsuario: UserColecao[];
  /** Resolve `true`/`false` conforme a persistência no Supabase teve sucesso — decide qual toast mostrar. */
  /** `comprar`: sem semente da espécie, paga o preço da configuração e planta. */
  onPlantSemente: (terrenoId: number, plantaId: string, comprar: boolean) => Promise<boolean>;
  onAdubarTerreno: (terrenoId: number) => Promise<boolean>;
  onColherPlanta: (terrenoId: number) => Promise<boolean>;
  /** QA-03: só o id trafega; preço e quantidade vêm do catálogo em lib/loja.ts. */
  onComprarItem: (itemId: string) => Promise<boolean>;
  /** Mensagem de promoção de nível (QA-02). `null` quando não há aviso pendente. */
  avisoNivel?: string | null;
  onDispensarAvisoNivel?: () => void;
  /** Instante usado para derivar a fase dos canteiros (QA-01). */
  agora: number;
}

export const JardimConhecimento: React.FC<JardimConhecimentoProps> = ({
  gameState,
  terrenos,
  colecaoUsuario,
  onPlantSemente,
  onAdubarTerreno,
  onColherPlanta,
  onComprarItem,
  avisoNivel = null,
  onDispensarAvisoNivel,
  agora,
}) => {
  // Espécies estudadas, cada uma com as SUAS sementes (Migration 14).
  const opcoesPlantio = PLANTAS_CATALOGO.flatMap((planta) => {
    const registro = colecaoUsuario.find((c) => c.planta_id === planta.id);
    return registro ? [{ planta, sementes: registro.sementes }] : [];
  });
  const sementesTotal = totalSementes(colecaoUsuario);
  // Estado Derivado: nível não é persistido, é sempre recalculado do XP corrente.
  const nivelAtual = calcularNivel(gameState.xp).nivel;

  const [mensagemStatus, setMensagemStatus] = useState<string>('');
  const [lojaAberta, setLojaAberta] = useState(false);

  const showStatus = (msg: string) => {
    setMensagemStatus(msg);
    setTimeout(() => setMensagemStatus(''), 3000);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* GER-UI-05: bloco verde sólido substituído por cabeçalho de texto.
          GER-UI-01: os contadores de recurso saíram do Header global e passaram
          a viver aqui — este é o único lugar do app onde sementes, adubo e
          moedas são efetivamente gastos. */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-green-deep">
            Jardim do Conhecimento
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Cultive conhecimento, colha conquistas e transforme o mundo.
          </p>
        </div>

        <dl className="flex items-center gap-4 bg-card-bg rounded-xl px-4 py-2.5 border border-black/[0.04] shadow-card shrink-0">
          {[
            { valor: sementesTotal, label: 'Sementes' },
            { valor: gameState.adubo, label: 'Adubos' },
            { valor: gameState.moedas, label: 'Moedas' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <dt className="sr-only">{item.label}</dt>
              <dd className="text-sm font-bold text-green-deep tabular-nums">
                {item.valor}
              </dd>
              <p className="text-[10px] text-ink-muted mt-0.5" aria-hidden>
                {item.label}
              </p>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setLojaAberta(true)}
            className="flex flex-col items-center justify-center pl-3 ml-1 border-l border-black/[0.06] text-green-deep hover:text-green-main transition-colors"
          >
            <ShoppingBag className="w-4 h-4" strokeWidth={1.75} aria-hidden />
            <span className="text-[10px] font-semibold mt-0.5">Loja</span>
          </button>
        </dl>
      </header>

      {mensagemStatus && (
        <div className="bg-emerald-100 border border-emerald-400 text-emerald-900 px-4 py-2.5 rounded-xl text-xs font-bold animate-in fade-in flex items-center justify-between shadow">
          <span>{mensagemStatus}</span>
          <button onClick={() => setMensagemStatus('')} className="text-xs font-bold">Fechar</button>
        </div>
      )}

      {/* ================================================================
          A CENA (GER-UI-13)

          Diretriz 2: nenhuma div de cenário aqui. O relevo inteiro vive em
          <FundoHorta /> no z-0; este componente só empilha as camadas.

          Diretriz 3: 8 canteiros, um por nível da trilha, distribuídos em três
          fileiras. A perspectiva é sugerida por ESCALA e ORDEM NO DOM: a
          fileira do fundo é menor e desenhada primeiro, a da frente é maior e
          desenhada por último, então ela naturalmente se sobrepõe.
          A numeração cresce do fundo para a frente, o que mantém a ordem de
          leitura igual à ordem visual e à ordem dos níveis.
          ================================================================ */}
      {/* QA-02: subir de nível libera um canteiro — a mudança precisa ser
          visível. Antes o nível sequer avançava; agora avança e é anunciado. */}
      {avisoNivel && (
        <div
          role="status"
          className="flex items-center gap-2 bg-green-soft text-green-deep rounded-xl px-4 py-2.5 text-sm font-semibold"
        >
          <PartyPopper className="w-4 h-4 shrink-0" aria-hidden />
          <span className="flex-1">{avisoNivel}</span>
          <button
            type="button"
            onClick={onDispensarAvisoNivel}
            className="p-0.5 rounded hover:bg-green-deep/10"
            aria-label="Dispensar aviso"
          >
            <X className="w-4 h-4" aria-hidden />
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-4 items-start">
      <section aria-label="Canteiros da horta">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="text-base font-bold text-green-deep">Sua horta</h2>
          <span className="text-xs font-semibold text-green-deep bg-green-soft px-2.5 py-0.5 rounded-full">
            {terrenos.filter((t) => nivelAtual >= t.nivel_necessario).length} de{' '}
            {terrenos.length} canteiros liberados
          </span>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-black/[0.06] shadow-card">
          <FundoHorta className="absolute inset-0 w-full h-full z-0" />

          <div className="relative z-10 flex flex-col items-center gap-y-7 sm:gap-y-9 px-3 sm:px-6 pt-8 pb-14 sm:pt-12 sm:pb-20">
            {FILEIRAS.map((fileira) => (
              <ul
                key={fileira.nome}
                className={`flex justify-center w-full ${fileira.largura} ${fileira.espacamento}`}
              >
                {fileira.ids.map((idCanteiro) => {
                  const terreno = terrenos.find((t) => t.id === idCanteiro);
                  if (!terreno) return null;

                  const estado = derivarEstadoCanteiro(terreno, nivelAtual, agora);

                  // Regras de "pode agir" ficam no container, que é quem
                  // enxerga o inventário. Os canteiros só refletem a decisão.
                  const semEspecie = opcoesPlantio.length === 0;
                  const semAdubo = gameState.adubo <= 0;

                  return (
                    <Canteiro
                      key={terreno.id}
                      estado={estado}
                      identificacao={`Canteiro ${terreno.id}`}
                      opcoesPlantio={opcoesPlantio}
                      moedas={gameState.moedas}
                      podePlantar={!semEspecie}
                      motivoPlantarBloqueado={
                        semEspecie ? 'Estude uma espécie para ganhar a semente' : undefined
                      }
                      onPlantar={async (plantaId, comprar) => {
                        const nome = opcoesPlantio.find((o) => o.planta.id === plantaId)?.planta.nome_popular;
                        // Toast só depois da resposta do Supabase, não antes:
                        // mostrar "plantada com sucesso" otimisticamente e a
                        // escrita falhar deixaria o usuário lido, achando que
                        // funcionou quando o canteiro voltou vazio.
                        const sucesso = await onPlantSemente(terreno.id, plantaId, comprar);
                        showStatus(
                          sucesso
                            ? comprar
                              ? `${nome ?? 'Semente'} plantada! Semente comprada por ${ECONOMIA.semente_preco} moedas.`
                              : `${nome ?? 'Semente'} plantada com sucesso!`
                            : 'Não foi possível plantar agora. Tente novamente.'
                        );
                      }}
                      podeAdubar={!semAdubo}
                      motivoAdubarBloqueado={semAdubo ? 'Sem adubo no inventário.' : undefined}
                      onAdubar={async () => {
                        const sucesso = await onAdubarTerreno(terreno.id);
                        showStatus(
                          sucesso
                            ? 'Adubo aplicado! Crescimento acelerado.'
                            : 'Não foi possível adubar agora. Tente novamente.'
                        );
                      }}
                      onColher={async () => {
                        const sucesso = await onColherPlanta(terreno.id);
                        showStatus(
                          sucesso
                            ? `Colheita concluída! +${ECONOMIA.colheita_xp} XP, +${ECONOMIA.colheita_moedas} moedas e +${ECONOMIA.colheita_sementes} semente para replantar.`
                            : 'Não foi possível colher agora. Tente novamente.'
                        );
                      }}
                    />
                  );
                })}
              </ul>
            ))}
          </div>
        </div>
      </section>

        {/* GER-UI-16: espaço antes ocupado pela Loja. Na referência é aqui que
            ficam o Desafio Diário e as Missões — conteúdo que puxa o usuário de
            volta ao loop de estudo, em vez de pedir que gaste moedas. */}
        <PainelJardim
          gameState={gameState}
          agora={agora}
          terrenos={terrenos}
          especiesEstudadas={colecaoUsuario.length}
          totalEspecies={PLANTAS_CATALOGO.length}
        />
      </div>

      <LojaModal
        aberta={lojaAberta}
        gameState={gameState}
        onFechar={() => setLojaAberta(false)}
        onComprarItem={onComprarItem}
        onMensagem={showStatus}
      />
    </div>
  );
};
