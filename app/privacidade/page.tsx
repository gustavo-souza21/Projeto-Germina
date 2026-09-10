import type { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';
import { BotaoVoltar } from '../../components/ui/BotaoVoltar';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Política de Privacidade do GERMINA — em fase de elaboração.',
};

/**
 * QA-06 — rota órfã resolvida. Ver a nota em app/termos/page.tsx sobre o motivo
 * de esta página ficar fora do grupo (app).
 */
export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-bg-base px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <BotaoVoltar />

        <article className="mt-6 bg-card-bg rounded-2xl border border-black/[0.04] shadow-card p-6 sm:p-8">
          <div className="flex items-center gap-2.5 mb-4">
            <ShieldCheck className="w-5 h-5 text-green-main shrink-0" strokeWidth={1.75} aria-hidden />
            <h1 className="text-2xl font-bold tracking-tight text-green-deep">
              Política de Privacidade
            </h1>
          </div>

          <p className="text-sm text-ink leading-relaxed">
            O documento oficial com a Política de Privacidade do GERMINA está em fase de
            elaboração e será publicado em breve nesta página.
          </p>

          <p className="text-sm text-ink-muted leading-relaxed mt-4">
            O GERMINA integra uma pesquisa acadêmica do PPGCTS/ICET/UFAM. Os dados coletados
            destinam-se ao funcionamento da plataforma e à avaliação da ferramenta no contexto
            da pesquisa.
          </p>

          <p className="text-xs text-ink-muted leading-relaxed mt-6 pt-4 border-t border-black/[0.06]">
            Solicitações relacionadas aos seus dados podem ser encaminhadas à equipe de pesquisa
            responsável pelo projeto.
          </p>
        </article>
      </div>
    </main>
  );
}
