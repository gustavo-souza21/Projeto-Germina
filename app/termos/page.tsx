import type { Metadata } from 'next';
import { FileText } from 'lucide-react';
import { BotaoVoltar } from '../../components/ui/BotaoVoltar';

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Termos de Uso do GERMINA — em fase de elaboração.',
};

/**
 * QA-06 — rota órfã resolvida.
 *
 * Fica FORA do grupo (app) de propósito: os links que chegam aqui partem do
 * splash e do cadastro, onde o usuário ainda não tem conta. Dentro de (app), a
 * página herdaria o AppLayout — header com XP, sidebar e bottom nav — e
 * chamaria getPerfil()/getGameState() para alguém que ainda não se cadastrou.
 */
export default function TermosPage() {
  return (
    <main className="min-h-screen bg-bg-base px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <BotaoVoltar />

        <article className="mt-6 bg-card-bg rounded-2xl border border-black/[0.04] shadow-card p-6 sm:p-8">
          <div className="flex items-center gap-2.5 mb-4">
            <FileText className="w-5 h-5 text-green-main shrink-0" strokeWidth={1.75} aria-hidden />
            <h1 className="text-2xl font-bold tracking-tight text-green-deep">Termos de Uso</h1>
          </div>

          <p className="text-sm text-ink leading-relaxed">
            O documento oficial com os Termos de Uso do GERMINA está em fase de elaboração e
            será publicado em breve nesta página.
          </p>

          <p className="text-sm text-ink-muted leading-relaxed mt-4">
            O GERMINA é uma ferramenta educacional desenvolvida no âmbito de uma pesquisa de
            mestrado do PPGCTS/ICET/UFAM. O conteúdo botânico apresentado tem finalidade
            informativa e educativa, e{' '}
            <strong className="font-semibold text-green-deep">
              não substitui orientação médica ou farmacêutica
            </strong>
            .
          </p>

          <p className="text-xs text-ink-muted leading-relaxed mt-6 pt-4 border-t border-black/[0.06]">
            Dúvidas sobre o uso da plataforma podem ser encaminhadas à equipe de pesquisa
            responsável pelo projeto.
          </p>
        </article>
      </div>
    </main>
  );
}
