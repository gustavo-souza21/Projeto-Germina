'use client';

import { useState } from 'react';
import { ItemTroca } from '../../lib/types';
import { createClient } from '../../lib/supabase/client';
import { X, Repeat, Check, AlertTriangle } from 'lucide-react';

export function TrocaModal({ item, onFechar }: { item: ItemTroca; onFechar: () => void }) {
  const [ofertaTexto, setOfertaTexto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const oferta = ofertaTexto.trim();
    if (!oferta || enviando) return;

    setEnviando(true);
    setErro(null);

    const supabase = createClient();

    // proponente_user_id vem sempre da sessão, nunca de algo já em memória
    // no componente — este modal não recebe `profile` como prop, e mesmo se
    // recebesse, a fonte de verdade de "quem está enviando a proposta" é a
    // sessão autenticada, não um dado que pode ter ficado desatualizado.
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setEnviando(false);
      setErro('Sua sessão expirou. Atualize a página e faça login novamente.');
      return;
    }

    const { error } = await supabase.from('trocas_propostas').insert({
      item_troca_id: item.id,
      proponente_user_id: user.id,
      oferta_texto: oferta,
      // Coluna existe no schema (A2) e o formulário já coletava este campo
      // como opcional — omiti-lo aqui descartaria silenciosamente o que a
      // pessoa digitou. `null` (não string vazia) quando deixado em branco.
      mensagem: mensagem.trim() || null,
      // status não é enviado: a coluna tem default 'pendente' no banco
      // (ver migration A2) — não duplicar essa regra aqui.
    });

    setEnviando(false);

    if (error) {
      console.error('Falha ao enviar proposta de troca:', error.message);
      setErro('Não foi possível enviar sua proposta agora. Tente novamente.');
      return;
    }

    setEnviado(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4">
      <div className="w-full sm:max-w-md bg-card-bg rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
        {!enviado ? (
          <>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-surface-alt flex items-center justify-center">
                  <Repeat className="w-4 h-4 text-green-main" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-green-deep">Propor Troca</h3>
                  <p className="text-xs text-ink-muted">{item.item_nome} · com {item.autor_nome}</p>
                </div>
              </div>
              <button onClick={onFechar} className="text-ink-muted hover:text-ink-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-surface-alt rounded-xl p-3 text-xs text-ink-muted mb-4">
              <strong className="text-green-deep">{item.autor_nome}</strong> está procurando:{' '}
              <strong className="text-green-deep">{item.procura}</strong>
            </div>

            <form onSubmit={handleEnviar} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-ink-muted block mb-1">O que você oferece?</label>
                <input
                  type="text"
                  required
                  value={ofertaTexto}
                  onChange={(e) => setOfertaTexto(e.target.value)}
                  placeholder="Ex: 2 sementes de Cumaru"
                  className="w-full bg-surface-alt border border-black/10 rounded-xl px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-green-main"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink-muted block mb-1">Mensagem (opcional)</label>
                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  rows={2}
                  placeholder="Combine local ou forma de entrega..."
                  className="w-full bg-surface-alt border border-black/10 rounded-xl px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-green-main"
                />
              </div>

              {erro && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-2.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-red-900 leading-relaxed">{erro}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!ofertaTexto.trim() || enviando}
                className="w-full py-3 rounded-2xl font-bold text-white bg-green-deep hover:bg-green-main transition-colors disabled:opacity-50"
              >
                {enviando ? 'Enviando...' : 'Enviar Proposta'}
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-base font-bold text-green-deep">Proposta enviada!</h3>
            <p className="text-xs text-ink-muted">
              {item.autor_nome} vai receber sua oferta de <strong>{ofertaTexto}</strong> pelo(a) {item.item_nome}.
            </p>
            <button
              onClick={onFechar}
              className="w-full mt-2 py-3 rounded-2xl font-bold text-white bg-green-deep hover:bg-green-main transition-colors"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
