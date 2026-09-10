'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PostComunidade, RespostaPost, Profile } from '../../lib/types';
import { ArrowLeft, Heart, Send } from 'lucide-react';
import { createClient } from '../../lib/supabase/client';

export function PostDetalheClient({
  post,
  respostasIniciais,
  profile,
}: {
  post: PostComunidade;
  respostasIniciais: RespostaPost[];
  profile: Profile;
}) {
  const router = useRouter();
  const [curtido, setCurtido] = useState(post.curtido_pelo_usuario);
  const [curtidas, setCurtidas] = useState(post.curtidas);
  const [respostas, setRespostas] = useState(respostasIniciais);
  const [novaResposta, setNovaResposta] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erroResposta, setErroResposta] = useState<string | null>(null);

  // Mesmo motivo do ComunidadeMural: sem isto, o router.refresh() disparado
  // depois de responder (abaixo) não teria efeito visível aqui — `respostas`
  // é local ao componente cliente e só lê `respostasIniciais` uma vez.
  useEffect(() => {
    setRespostas(respostasIniciais);
  }, [respostasIniciais]);

  const handleToggleCurtida = async () => {
    const curtidoAntes = curtido;
    const curtidasAntes = curtidas;

    // Optimistic UI Update: alterna na tela de imediato, reverte se a
    // escrita no Supabase falhar.
    setCurtido(!curtidoAntes);
    setCurtidas((n) => (curtidoAntes ? n - 1 : n + 1));

    const supabase = createClient();
    const { error } = curtidoAntes
      ? await supabase.from('post_curtidas').delete().eq('post_id', post.id).eq('user_id', profile.id)
      : await supabase.from('post_curtidas').insert({ post_id: post.id, user_id: profile.id });

    if (error) {
      setCurtido(curtidoAntes);
      setCurtidas(curtidasAntes);
      console.error('Falha ao curtir/descurtir post:', error.message);
    }
  };

  const handleResponder = async (e: React.FormEvent) => {
    e.preventDefault();
    const conteudo = novaResposta.trim();
    if (!conteudo || enviando) return;

    setEnviando(true);
    setErroResposta(null);

    const supabase = createClient();
    const { error } = await supabase.from('respostas_post').insert({
      post_id: post.id,
      user_id: profile.id,
      conteudo,
    });

    setEnviando(false);

    if (error) {
      setErroResposta('Não foi possível enviar sua resposta agora. Tente novamente.');
      console.error('Falha ao registrar resposta:', error.message);
      return;
    }

    setNovaResposta('');
    // Mesmo raciocínio do ComunidadeMural: autor_nome/autor_nivel da nova
    // resposta vêm sempre do embed do PostgREST (lib/queries/comunidade.ts),
    // nunca montados aqui. router.refresh() busca a lista real da Server
    // Component, já com a resposta nova e o nível correto do autor.
    router.refresh();
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8 max-w-2xl mx-auto">
      <button
        onClick={() => router.push('/comunidade')}
        className="flex items-center gap-1.5 text-sm text-blue-main font-bold"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar pra Comunidade
      </button>

      <div className="bg-card-bg rounded-2xl p-5 border border-black/[0.04] shadow-card space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-green-deep text-emerald-300 font-bold flex items-center justify-center text-sm shadow">
              {post.autor_nome.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-green-deep">{post.autor_nome}</h4>
                <span className="text-[10px] bg-green-soft text-green-deep px-2 py-0.5 rounded font-bold">
                  {post.autor_nivel}
                </span>
              </div>
              <p className="text-[11px] text-ink-muted">{post.autor_instituicao}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-blue-main/10 text-blue-main px-2 py-0.5 rounded-md">
            {post.tag}
          </span>
        </div>

        <p className="text-sm text-ink-muted leading-relaxed">{post.conteudo}</p>

        <div className="pt-2 border-t border-black/[0.05] flex items-center gap-3 text-xs text-ink-muted font-semibold">
          <button
            onClick={handleToggleCurtida}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
              curtido ? 'text-red-600 bg-red-50 font-bold' : 'hover:bg-surface-alt text-ink-muted'
            }`}
          >
            <Heart className={`w-4 h-4 ${curtido ? 'fill-red-600' : ''}`} />
            <span>{curtidas} Apoios</span>
          </button>
          <span>{respostas.length} Respostas</span>
        </div>
      </div>

      <form onSubmit={handleResponder} className="space-y-1.5">
        <div className="bg-card-bg rounded-2xl p-4 border border-black/[0.04] shadow-card flex gap-2">
          <input
            type="text"
            value={novaResposta}
            onChange={(e) => setNovaResposta(e.target.value)}
            placeholder="Escreva uma resposta..."
            className="flex-1 bg-surface-alt border border-black/10 rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-green-main"
          />
          <button
            type="submit"
            disabled={!novaResposta.trim() || enviando}
            className="bg-green-deep hover:bg-green-main text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        {erroResposta && <p className="text-[11px] text-red-600 font-semibold px-1">{erroResposta}</p>}
      </form>

      <div className="space-y-3">
        {respostas.map((r) => (
          <div key={r.id} className="bg-card-bg rounded-2xl p-4 border border-black/[0.04] shadow-card flex gap-3">
            <div className="w-8 h-8 rounded-full bg-green-soft text-green-deep font-bold flex items-center justify-center text-xs shrink-0">
              {r.autor_nome.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h5 className="text-xs font-bold text-green-deep">{r.autor_nome}</h5>
                <span className="text-[9px] bg-green-soft text-green-deep px-1.5 py-0.5 rounded font-bold">
                  {r.autor_nivel}
                </span>
              </div>
              <p className="text-xs text-ink-muted mt-0.5">{r.conteudo}</p>
            </div>
          </div>
        ))}

        {respostas.length === 0 && (
          <p className="text-xs text-ink-muted text-center py-4">Seja o primeiro a responder este post.</p>
        )}
      </div>
    </div>
  );
}
