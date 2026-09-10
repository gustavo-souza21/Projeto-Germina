'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PostComunidade, Profile, ItemTroca } from '../lib/types';
import { MessageSquare, Heart, Share2, Send, Users, Sprout } from 'lucide-react';
import { TrocaModal } from './comunidade/TrocaModal';
import { ExigeLoginModal } from './ExigeLoginModal';
import { createClient } from '../lib/supabase/client';

interface ComunidadeMuralProps {
  /** `null` = visitante lendo o mural sem conta (Fase 4). */
  profile: Profile | null;
  postsIniciais: PostComunidade[];
  trocas: ItemTroca[];
}

export const ComunidadeMural: React.FC<ComunidadeMuralProps> = ({ profile, postsIniciais, trocas }) => {
  const router = useRouter();
  const [posts, setPosts] = useState<PostComunidade[]>(postsIniciais);
  const [novoPostTexto, setNovoPostTexto] = useState('');
  const [tagSelecionada, setTagSelecionada] = useState('#PlantasMedicinais');
  const [trocaSelecionada, setTrocaSelecionada] = useState<ItemTroca | null>(null);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [publicando, setPublicando] = useState(false);
  const [erroPost, setErroPost] = useState<string | null>(null);
  // Fase 4: qual ação o visitante tentou. `null` = modal fechado.
  const [acaoExigindoLogin, setAcaoExigindoLogin] = useState<string | null>(null);

  // `posts` só é inicializado a partir de `postsIniciais` no primeiro render
  // (comportamento normal do useState) — sem este efeito, o router.refresh()
  // disparado após publicar (abaixo) re-buscaria os dados no servidor, mas
  // este componente cliente nunca veria o post novo, porque props mudarem
  // não reseta state sozinho no React. Este sync é o que fecha esse laço.
  useEffect(() => {
    setPosts(postsIniciais);
  }, [postsIniciais]);

  const handlePublicarPost = async (e: React.FormEvent) => {
    e.preventDefault();

    // Gate de login (Fase 4). O RLS de `comunidade_posts` já recusaria o
    // insert de um visitante; o que ele não faz é explicar por quê.
    if (!profile) {
      setAcaoExigindoLogin('publicar no mural');
      return;
    }

    const conteudo = novoPostTexto.trim();
    if (!conteudo || publicando) return;

    setPublicando(true);
    setErroPost(null);

    const supabase = createClient();
    const { error } = await supabase.from('comunidade_posts').insert({
      user_id: profile.id,
      conteudo,
      tag: tagSelecionada,
    });

    setPublicando(false);

    if (error) {
      setErroPost('Não foi possível publicar agora. Tente novamente.');
      console.error('Falha ao publicar post:', error.message);
      return;
    }

    setNovoPostTexto('');
    // Sem construção otimista do post aqui, de propósito: autor_nivel NUNCA é
    // coluna (A1, ver lib/queries/comunidade.ts) — é sempre calculado no
    // servidor a partir do XP atual do autor. Montar esse objeto no cliente
    // arriscaria exibir um nível inventado/desatualizado (a mesma classe de
    // bug que a arquitetura de comunidade foi desenhada para evitar).
    // router.refresh() reexecuta a Server Component da página, que busca os
    // posts reais (já incluindo o novo, com nível correto) via getPosts().
    router.refresh();
  };

  const handleToggleCurtida = async (post: PostComunidade) => {
    // Gate antes da atualização otimista: sem esta guarda, o visitante veria
    // o coração acender e apagar sozinho meio segundo depois, quando o RLS
    // recusasse a escrita e o rollback rodasse.
    if (!profile) {
      setAcaoExigindoLogin('curtir este post');
      return;
    }

    const curtidoAntes = post.curtido_pelo_usuario;
    const curtidasAntes = post.curtidas;

    // Optimistic UI Update: a curtida/descurtida aparece na tela antes da
    // resposta do Supabase; revertida abaixo se a escrita falhar.
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              curtido_pelo_usuario: !curtidoAntes,
              curtidas: curtidoAntes ? p.curtidas - 1 : p.curtidas + 1,
            }
          : p
      )
    );

    const supabase = createClient();
    const { error } = curtidoAntes
      ? await supabase.from('post_curtidas').delete().eq('post_id', post.id).eq('user_id', profile.id)
      : await supabase.from('post_curtidas').insert({ post_id: post.id, user_id: profile.id });

    if (error) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, curtido_pelo_usuario: curtidoAntes, curtidas: curtidasAntes } : p
        )
      );
      console.error('Falha ao curtir/descurtir post:', error.message);
    }
  };

  const handleCompartilhar = async (post: PostComunidade) => {
    const url = `${window.location.origin}/comunidade/post/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'GERMINA - Comunidade', text: post.conteudo, url });
        return;
      } catch {
        // usuário cancelou — cai no fallback abaixo
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiadoId(post.id);
      setTimeout(() => setCopiadoId(null), 2000);
    } catch {
      // clipboard indisponível — ignora silenciosamente
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Banner */}
      <div className="bg-blue-main text-white rounded-2xl p-5 shadow-card border border-blue-deep flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-300" />
            <h2 className="text-xl font-bold">Comunidade GERMINA</h2>
          </div>
          <p className="text-xs text-emerald-100/90 mt-1">
            "Onde os frutos se conectam" — Troca de saberes, sementes e relatos acadêmicos da Amazônia.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-blue-deep/60 px-3.5 py-2 rounded-xl text-xs font-bold border border-teal-500/30">
          <div>
            <p className="text-[10px] text-teal-300">Pesquisadores & Alunos</p>
            <p className="text-sm font-bold text-white">1,420 Ativos</p>
          </div>
          <div className="w-px h-6 bg-teal-800" />
          <div>
            <p className="text-[10px] text-emerald-300">Trocas de Sementes</p>
            <p className="text-sm font-bold text-white">380 Realizadas</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* New Post Publisher Form */}
          <div className="bg-card-bg rounded-2xl p-4 sm:p-5 border border-black/[0.04] shadow-card space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-soft text-green-deep font-bold flex items-center justify-center text-sm">
                {/* Visitante não tem nome para a inicial (Fase 4). */}
                {profile ? profile.nome_completo.charAt(0) : '?'}
              </div>
              <div>
                <p className="text-xs font-bold text-green-deep">
                  {profile ? profile.nome_completo : 'Visitante'}
                </p>
                {/* A linha de instituição saiu daqui na Fase 2 (achados #3/#4).
                    Este bloco é a prévia de como o post vai aparecer no Mural —
                    e o Mural não mostra mais instituição de ninguém. Mostrar o
                    campo só aqui daria a impressão errada de que ele acompanha
                    a publicação. Antes, além disso, esta linha caía no fallback
                    hardcoded 'UFAM' — ou seja, rotulava como UFAM todo usuário
                    que nunca preencheu o campo, que é 100% deles no primeiro
                    acesso, bem no instante anterior a publicar algo público. */}
                <p className="text-[10px] text-ink-muted">
                  {profile ? 'Publicando no Mural' : 'Entre para publicar'}
                </p>
              </div>
            </div>

            <form onSubmit={handlePublicarPost} className="space-y-3">
              <textarea
                value={novoPostTexto}
                onChange={(e) => setNovoPostTexto(e.target.value)}
                placeholder="Compartilhe uma descoberta botânica, dúvida ou relato de cultivo tradicional..."
                rows={3}
                className="w-full bg-surface-alt border border-black/10 rounded-xl p-3 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-green-main"
              />

              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-ink-muted font-bold text-[11px]">Tag:</span>
                  <select
                    value={tagSelecionada}
                    onChange={(e) => setTagSelecionada(e.target.value)}
                    className="bg-surface-alt border border-black/10 rounded-lg px-2 py-1 text-xs font-bold text-green-deep"
                  >
                    <option value="#PlantasMedicinais">#PlantasMedicinais</option>
                    <option value="#RENISUS">#RENISUS</option>
                    <option value="#TrocaDeSementes">#TrocaDeSementes</option>
                    <option value="#SaberesTradicionais">#SaberesTradicionais</option>
                    <option value="#UFAM">#UFAM</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!novoPostTexto.trim() || publicando}
                  className="bg-green-deep hover:bg-green-main text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{publicando ? 'Publicando...' : 'Publicar no Mural'}</span>
                </button>
              </div>
              {erroPost && <p className="text-[11px] text-red-600 font-semibold">{erroPost}</p>}
            </form>
          </div>

          {/* Posts Feed */}
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-card-bg rounded-2xl p-4 sm:p-5 border border-black/[0.04] shadow-card space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-green-deep text-emerald-300 font-bold flex items-center justify-center text-sm shadow">
                      {post.autor_nome.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-green-deep">
                          {post.autor_nome}
                        </h4>
                        <span className="text-[10px] bg-green-soft text-green-deep px-2 py-0.5 rounded font-bold">
                          {post.autor_nivel}
                        </span>
                      </div>
                      {/* Instituição do autor removida na Fase 2 (achados #3/#4):
                          era texto livre sem verificação nenhuma, exibido como
                          credencial. O nível continua — esse sim é derivado do
                          XP real, não autodeclarado. */}
                      <p className="text-[11px] text-ink-muted">
                        {new Date(post.criado_em).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold bg-blue-main/10 text-blue-main px-2 py-0.5 rounded-md">
                    {post.tag}
                  </span>
                </div>

                <Link href={`/comunidade/post/${post.id}`} className="block">
                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed hover:text-green-deep transition-colors">
                    {post.conteudo}
                  </p>
                </Link>

                <div className="pt-2 border-t border-black/[0.05] flex items-center justify-between text-xs text-ink-muted font-semibold">
                  <button
                    onClick={() => handleToggleCurtida(post)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                      post.curtido_pelo_usuario
                        ? 'text-red-600 bg-red-50 font-bold'
                        : 'hover:bg-surface-alt text-ink-muted'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.curtido_pelo_usuario ? 'fill-red-600' : ''}`} />
                    <span>{post.curtidas} Apoios</span>
                  </button>

                  <Link
                    href={`/comunidade/post/${post.id}`}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-surface-alt text-ink-muted"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.respostas_count} Respostas</span>
                  </Link>

                  <button
                    onClick={() => handleCompartilhar(post)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-surface-alt text-ink-muted"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">{copiadoId === post.id ? 'Link copiado!' : 'Compartilhar'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Intercâmbio Column */}
        <div className="space-y-4">
          <div className="bg-card-bg rounded-2xl p-4 sm:p-5 border border-black/[0.04] shadow-card space-y-3">
            <div className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-700" />
              <h3 className="text-sm font-bold text-green-deep">
                Painel de Intercâmbio
              </h3>
            </div>
            <p className="text-xs text-ink-muted">
              Troque sementes e mudas medicinais com outros membros da rede GERMINA.
            </p>

            <div className="space-y-2 text-xs">
              {trocas.map((item) => (
                <div key={item.id} className="p-3 bg-surface-alt rounded-xl border border-black/[0.04] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-green-deep">{item.item_nome}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      item.is_renisus ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.is_renisus ? 'RENISUS' : item.quantidade_disponivel}
                    </span>
                  </div>
                  <p className="text-ink-muted text-[11px]">Procura: {item.procura}</p>
                  <button
                    onClick={() =>
                      // Fase 4: o anúncio é público (o visitante vê o que a
                      // comunidade está trocando), propor não é.
                      profile
                        ? setTrocaSelecionada(item)
                        : setAcaoExigindoLogin('propor uma troca')
                    }
                    className="w-full mt-1 bg-green-deep text-white text-[11px] font-bold py-1 rounded-lg hover:bg-green-main transition-colors"
                  >
                    Propor Troca
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-900 text-emerald-100 rounded-2xl p-4 border border-emerald-700 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
              Agenda do Herbário UFAM
            </span>
            <h4 className="font-bold text-sm text-white">Workshop de Fitoterapia Amazônica</h4>
            <p className="text-xs opacity-90 leading-relaxed">
              Próximo encontro presencial e remoto na Faculdade de Ciências Agrárias da UFAM.
            </p>
            <span className="text-[11px] font-bold text-amber-300 block pt-1">
              Data: Quinta-feira, 15h
            </span>
          </div>
        </div>
      </div>

      {trocaSelecionada && (
        <TrocaModal
          item={trocaSelecionada}
          onFechar={() => setTrocaSelecionada(null)}
        />
      )}

      <ExigeLoginModal
        aberto={acaoExigindoLogin !== null}
        onFechar={() => setAcaoExigindoLogin(null)}
        acao={acaoExigindoLogin ?? ''}
      />
    </div>
  );
};
