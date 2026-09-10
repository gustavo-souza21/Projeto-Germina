'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { buttonClasses } from './Button';

/**
 * Botão "Voltar" com `router.back()`.
 *
 * Existe como Client Component isolado para que as páginas que o usam possam
 * continuar sendo Server Components — só o botão precisa de interatividade.
 *
 * `back()` em vez de um href fixo porque estas páginas são alcançadas de dois
 * lugares diferentes (splash e cadastro). Mandar todo mundo para uma rota fixa
 * tiraria do fluxo quem estava no meio do cadastro.
 *
 * `fallbackHref` cobre o acesso direto por URL, quando não há histórico para
 * onde voltar — sem isso, o clique não faria nada e pareceria um botão quebrado.
 */
export function BotaoVoltar({ fallbackHref = '/splash' }: { fallbackHref?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
      className={buttonClasses({ variant: 'ghost', size: 'md' })}
    >
      <ArrowLeft className="w-4 h-4" strokeWidth={2} aria-hidden />
      Voltar
    </button>
  );
}
