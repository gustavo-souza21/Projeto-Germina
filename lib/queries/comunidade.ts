import { createClient } from '../supabase/server';
import { PostComunidade, RespostaPost, ItemTroca } from '../types';
import { calcularNivel, PLANTAS_CATALOGO } from '../../data/plantasData';

/**
 * A1 (migration comunidade) proibiu de propósito qualquer coluna
 * autor_nome/autor_nivel/autor_instituicao — nenhuma tabela de comunidade
 * guarda esses dados, só `user_id`. Tudo aqui embaixo é reconstruído por
 * embed (JOIN automático do PostgREST) e por cálculo no momento da leitura:
 * autor_nivel em especial NUNCA pode vir de coluna, porque persistido ficaria
 * congelado no nível que o autor tinha ao publicar (mesma classe de bug do
 * QA-02, só que na Comunidade em vez do Jardim).
 */

// PostgREST embute relação 1:1 (FK com PK compartilhada, caso de
// game_state.user_id) como objeto único — mas o formato exato pode variar
// por versão da lib. Este helper deixa o código do lado de cá indiferente a
// isso, aceitando tanto o objeto quanto um array de 1 posição.
function unwrapToOne<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function rotuloNivel(xp: number): string {
  const info = calcularNivel(xp);
  return `Nível ${info.nivel} - ${info.nome}`;
}

type PostRow = {
  id: string;
  conteudo: string;
  tag: string;
  imagem: string | null;
  criado_em: string;
  profiles: {
    nome_completo: string;
    instituicao: string | null;
    game_state: { xp: number } | { xp: number }[] | null;
  } | null;
  post_curtidas: { user_id: string }[];
  respostas_post: { count: number }[];
};

export async function getPosts(): Promise<PostComunidade[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado.');

  const { data, error } = await supabase
    .from('comunidade_posts')
    .select(
      `
      id, conteudo, tag, imagem, criado_em,
      profiles!comunidade_posts_user_id_fkey ( nome_completo, instituicao, game_state ( xp ) ),
      post_curtidas ( user_id ),
      respostas_post ( count )
    `
    )
    .order('criado_em', { ascending: false })
    .returns<PostRow[]>();

  if (error) throw new Error(`Falha ao buscar comunidade_posts: ${error.message}`);

  return (data ?? []).map((post) => {
    const xpAutor = unwrapToOne(post.profiles?.game_state)?.xp ?? 0;

    return {
      id: post.id,
      autor_nome: post.profiles?.nome_completo ?? 'Usuário GERMINA',
      // Calculado agora, não lido de coluna — reflete o nível ATUAL do autor,
      // nunca o que ele tinha no instante da publicação.
      autor_nivel: rotuloNivel(xpAutor),
      autor_instituicao: post.profiles?.instituicao ?? '',
      conteudo: post.conteudo,
      tag: post.tag,
      curtidas: post.post_curtidas.length,
      curtido_pelo_usuario: post.post_curtidas.some((c) => c.user_id === user.id),
      respostas_count: post.respostas_post[0]?.count ?? 0,
      criado_em: post.criado_em,
      imagem: post.imagem ?? undefined,
    };
  });
}

export async function getPostPorId(id: string): Promise<PostComunidade | undefined> {
  // Volume baixo o suficiente pra reaproveitar getPosts() (mural inteiro cabe
  // numa query só hoje). Trocar por um .eq('id', id).single() dedicado se o
  // mural crescer a ponto de listar tudo só para achar um post ficar caro.
  const posts = await getPosts();
  return posts.find((p) => p.id === id);
}

type RespostaRow = {
  id: string;
  post_id: string;
  conteudo: string;
  criado_em: string;
  profiles: {
    nome_completo: string;
    game_state: { xp: number } | { xp: number }[] | null;
  } | null;
};

export async function getRespostas(postId: string): Promise<RespostaPost[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('respostas_post')
    .select(
      `
      id, post_id, conteudo, criado_em,
      profiles!respostas_post_user_id_fkey ( nome_completo, game_state ( xp ) )
    `
    )
    .eq('post_id', postId)
    .order('criado_em', { ascending: true })
    .returns<RespostaRow[]>();

  if (error) throw new Error(`Falha ao buscar respostas_post: ${error.message}`);

  return (data ?? []).map((r) => ({
    id: r.id,
    post_id: r.post_id,
    autor_nome: r.profiles?.nome_completo ?? 'Usuário GERMINA',
    autor_nivel: rotuloNivel(unwrapToOne(r.profiles?.game_state)?.xp ?? 0),
    conteudo: r.conteudo,
    criado_em: r.criado_em,
  }));
}

type ItemTrocaRow = {
  id: string;
  planta_id: string;
  quantidade_disponivel: number;
  procura: string;
  profiles: { nome_completo: string } | null;
};

export async function getTrocas(): Promise<ItemTroca[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('itens_troca')
    .select('id, planta_id, quantidade_disponivel, procura, profiles!itens_troca_user_id_fkey ( nome_completo )')
    .eq('ativo', true)
    .order('criado_em', { ascending: false })
    .returns<ItemTrocaRow[]>();

  if (error) throw new Error(`Falha ao buscar itens_troca: ${error.message}`);

  return (data ?? []).map((item) => {
    const planta = PLANTAS_CATALOGO.find((p) => p.id === item.planta_id);

    return {
      id: item.id,
      autor_nome: item.profiles?.nome_completo ?? 'Usuário GERMINA',
      // item_nome e is_renisus não são colunas (G6, migration A2) — vêm do
      // catálogo em código a partir de planta_id, na leitura.
      item_nome: planta?.nome_popular ?? 'Espécie desconhecida',
      is_renisus: planta?.is_renisus ?? false,
      // quantidade_disponivel no banco é int (G6); o tipo ItemTroca do
      // cliente ainda espera o texto pronto — reconstituído aqui para não
      // exigir mudar TrocaModal/ComunidadeMural neste mesmo lote (ver nota
      // no relatório de status sobre migrar isso para número + formatação
      // na UI, num lote de front-end à parte).
      quantidade_disponivel:
        item.quantidade_disponivel === 1 ? 'Muda única' : `${item.quantidade_disponivel} disponíveis`,
      procura: item.procura,
    };
  });
}
