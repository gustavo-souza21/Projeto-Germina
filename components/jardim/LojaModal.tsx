'use client';

import { useEffect, useRef } from 'react';
import { X, ShoppingBag, Coins } from 'lucide-react';
import { Button } from '../ui/Button';
import { GameState } from '../../lib/types';
import { ITENS_LOJA, mensagemSucesso, rotuloRetorno } from '../../lib/loja';

/* ============================================================================
   GER-UI-16 — LOJA EM MODAL

   Antes a loja ocupava um terço da tela do Jardim, com três cards grandes
   sempre visíveis. Na referência ela não aparece: o espaço à direita é do
   Desafio Diário e das Missões, e a loja é só um botão discreto.

   A loja foi RECOLHIDA, não removida. Ela é onde o ciclo da economia fecha —
   `sementes`, `adubo` e `moedas` já existem no gameState, e sem lugar para
   gastar viram números decorativos.
   ========================================================================= */

export function LojaModal({
  aberta,
  gameState,
  onFechar,
  onComprarItem,
  onMensagem,
}: {
  aberta: boolean;
  gameState: GameState;
  onFechar: () => void;
  /**
   * Recebe só o id: preço e quantidade vêm do catálogo, não da UI (QA-03).
   * Resolve `true`/`false` conforme a persistência no Supabase teve sucesso —
   * é o que decide qual mensagem mostrar (ver onClick abaixo).
   */
  onComprarItem: (itemId: string) => Promise<boolean>;
  onMensagem: (msg: string) => void;
}) {
  const dialogoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberta) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar();
    };
    window.addEventListener('keydown', aoTeclar);
    // Trava o scroll do fundo enquanto o modal está aberto.
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogoRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = overflowAnterior;
    };
  }, [aberta, onFechar]);

  if (!aberta) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onFechar();
      }}
    >
      <div className="absolute inset-0 bg-blue-deep/40" aria-hidden />

      <div
        ref={dialogoRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-loja"
        className="relative w-full sm:max-w-lg bg-card-bg rounded-t-2xl sm:rounded-2xl shadow-card-hover max-h-[85vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-card-bg border-b border-black/[0.06] px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <ShoppingBag className="w-5 h-5 text-green-deep shrink-0" strokeWidth={1.75} aria-hidden />
            <h2 id="titulo-loja" className="text-base font-bold text-green-deep truncate">
              Loja do Conhecimento
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1 text-sm font-bold text-green-deep tabular-nums">
              <Coins className="w-4 h-4 text-medalha-ouro-anel" aria-hidden />
              {gameState.moedas}
            </span>
            <button
              type="button"
              onClick={onFechar}
              className="p-1 rounded-lg text-ink-muted hover:bg-black/[0.05]"
              aria-label="Fechar loja"
            >
              <X className="w-5 h-5" aria-hidden />
            </button>
          </div>
        </div>

        <ul className="p-4 space-y-2.5">
          {ITENS_LOJA.map((item) => {
            const podeComprar = gameState.moedas >= item.custo;

            return (
              <li
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-alt"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-[13px] font-bold text-green-deep leading-snug">
                    {item.nome}
                  </h3>
                  <p className="text-[11px] text-ink-muted leading-snug mt-0.5">
                    {item.descricao}
                  </p>
                  {/* QA-03: derivado de `quantidade`, o mesmo número que é
                      creditado. Antes era texto solto e mentia. */}
                  <p className="text-[11px] font-semibold text-green-main mt-0.5">
                    {rotuloRetorno(item)}
                  </p>
                  {!podeComprar && (
                    <p className="text-[10px] text-ink-muted mt-1">
                      Faltam {item.custo - gameState.moedas} moedas
                    </p>
                  )}
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  disabled={!podeComprar}
                  onClick={async () => {
                    // Espera a resposta do Supabase antes de anunciar sucesso
                    // — mostrar "Você comprou..." e a escrita falhar (rede
                    // caiu, saldo mudou entre a checagem e a escrita) seria a
                    // mesma classe de mentira que o QA-03 original cometia,
                    // só que na mensagem em vez do crédito.
                    const sucesso = await onComprarItem(item.id);
                    onMensagem(
                      sucesso
                        ? mensagemSucesso(item)
                        : `Não foi possível comprar ${item.nome} agora. Tente novamente.`
                    );
                  }}
                  className="shrink-0"
                >
                  {item.custo} moedas
                </Button>
              </li>
            );
          })}
        </ul>

        <p className="px-5 pb-5 text-[11px] text-ink-muted leading-relaxed">
          Moedas são ganhas colhendo plantas do seu jardim e completando desafios.
        </p>
      </div>
    </div>
  );
}
