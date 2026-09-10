'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, X } from 'lucide-react';

/* ============================================================================
   "FAÇA LOGIN PARA CONTINUAR" — Fase 4, modo visitante

   O QUE ESTE COMPONENTE RESOLVE

   Com /biblioteca e /comunidade abertas a visitante, os botões de escrita
   dessas telas (estudar planta, publicar, curtir, responder, propor troca)
   passaram a ser alcançáveis por quem não tem conta. Sem este gate, o
   visitante clicaria e a escrita falharia contra o RLS — corretamente, do
   ponto de vista de segurança, e de forma incompreensível do ponto de vista
   dele: um erro genérico, ou pior, nada.

   Então a divisão é: o BANCO recusa (é ele quem garante), e esta tela
   EXPLICA. Uma coisa não substitui a outra — se este modal sumisse amanhã,
   nada ficaria inseguro; só ficaria confuso.

   UM COMPONENTE, NÃO UMA TELA POR ROTA: o convite é o mesmo em todos os
   pontos, e a ação que o disparou é sempre uma frase curta ("para estudar
   esta planta", "para curtir"). Uma tela cheia por rota multiplicaria o
   mesmo texto por cinco lugares livres para divergir — o problema que os
   achados #5 e QA-03 deste projeto já mostraram na prática.
   ========================================================================= */

export function ExigeLoginModal({
  aberto,
  onFechar,
  acao,
}: {
  aberto: boolean;
  onFechar: () => void;
  /**
   * Completa a frase "Entre na sua conta para ___".
   * Ex.: "estudar esta planta", "curtir este post", "propor uma troca".
   */
  acao: string;
}) {
  const pathname = usePathname();

  if (!aberto) return null;

  // Volta para a tela onde a pessoa estava quando esbarrou no gate — não para
  // /inicio. Ela estava lendo uma ficha específica ou um post específico;
  // perder isso no login seria fazer ela procurar de novo o que já tinha
  // achado. Mesmo `?next=` que o middleware usa nas rotas protegidas.
  const destino = `/login?next=${encodeURIComponent(pathname ?? '/biblioteca')}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exige-login-titulo"
      onClick={onFechar}
    >
      <div
        className="w-full max-w-sm bg-card-bg rounded-2xl shadow-xl border border-black/[0.06] p-5 space-y-4"
        // Sem isto, clicar dentro do card fecharia o modal junto com o
        // fundo — o clique borbulha até o overlay.
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-green-soft flex items-center justify-center shrink-0">
              <LogIn className="w-4 h-4 text-green-deep" strokeWidth={1.75} aria-hidden />
            </div>
            <h2 id="exige-login-titulo" className="text-base font-bold text-green-deep">
              Entre para continuar
            </h2>
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="p-1.5 -m-1.5 rounded-lg text-ink-muted hover:bg-black/[0.04]"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" strokeWidth={2} aria-hidden />
          </button>
        </div>

        <p className="text-sm text-ink-muted leading-relaxed">
          Entre na sua conta para {acao}. Seu progresso — XP, herbário e jardim — fica guardado
          na conta, por isso essa parte precisa de login.
        </p>

        <div className="space-y-2">
          <Link
            href={destino}
            className="w-full block text-center py-3 rounded-xl font-semibold text-white bg-green-deep hover:bg-green-main transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="w-full block text-center py-2.5 rounded-xl font-semibold text-sm text-green-deep hover:bg-black/[0.04] transition-colors"
          >
            Criar uma conta
          </Link>
        </div>

        <button
          type="button"
          onClick={onFechar}
          className="w-full text-xs text-ink-muted hover:text-green-deep transition-colors"
        >
          Continuar explorando sem conta
        </button>
      </div>
    </div>
  );
}
