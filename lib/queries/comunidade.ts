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
 *
 * Fase 2 da correção de autenticação/autorização (09/09/2026): `instituicao`
 * saiu do embed. Não basta parar de RENDERIZAR o campo — enquanto ele viesse
 * no SELECT, a instituição autodeclarada de todo autor continuaria trafegando
 * para o navegador de qualquer usuário logado (visível no payload da
 * requisição, mesmo sem aparecer na tela). Como a decisão foi que o dado é
 * privado do dono, ele para de sair do banco aqui, não na camada de exibição.
 */

// `unwrapToOne` vivia aqui para normalizar o formato do embed 1:1 do
// PostgREST (objeto vs. array de 1 posição, que varia por versão da lib).
// Removido na Migration 9: não há mais embed de profiles/game_state neste
// arquivo — a identidade do autor vem da view `perfis_publicos`, em query
// própria e já no formato final.

function rotuloNivel(xp: number): string {
  const info = calcularNivel(xp);
  return `Nível ${info.nivel} - ${info.nome}`;
}

/**
 * Identidade pública dos autores de um conjunto de posts/respostas/trocas.
 *
 * POR QUE ISTO NÃO É MAIS UM EMBED (Migration 9, 09/09/2026)
 *
 * Até aqui, autor_nome/autor_nivel vinham de
 * `profiles ( nome_completo, game_state ( xp ) )` — embed do PostgREST, que no
 * banco vira LEFT JOIN. Só que RLS se aplica a CADA tabela do JOIN, e tanto
 * `profiles` (`profiles_leitura_propria`) quanto `game_state`
 * (`game_state_isolamento_total`) liberam exatamente uma linha por usuário: a
 * dele. Reproduzido num Postgres 16 local: todo post de outra pessoa voltava
 * com o embed `null` e caía nos fallbacks — o Mural inteiro apareceria como
 * "Usuário GERMINA — Nível 1 - Semente" para qualquer post que não fosse do
 * próprio usuário logado. Nunca tinha aparecido porque ainda não há Supabase
 * real conectado.
 *
 * A view `perfis_publicos` é o recorte do que é público sobre um autor (id,
 * nome, xp — nada de telefone/endereco/idade/instituicao). Busca em duas
 * etapas em vez de embed: a resolução de relacionamento do PostgREST sobre
 * VIEW depende de inferência que não dá para testar sem o Supabase de
 * verdade, e aqui não vale trocar previsibilidade por uma ida a menos ao
 * banco — o mural cabe numa página só hoje.
 */
async function buscarAutores(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userIds: string[]
): Promise<Map<string, { nome: string; xp: number }>> {
  const unicos = [...new Set(userIds)];
  if (unicos.length === 0) return new Map();

  const { data, error } = await supabase
    .from('perfis_publicos')
    .select('id, nome_completo, xp')
    .in('id', unicos);

  if (error) throw new Error(`Falha ao buscar perfis_publicos: ${error.message}`);

  return new Map((data ?? []).map((a) => [a.id, { nome: a.nome_completo, xp: a.xp }]));
}

type PostRow = {
  id: string;
  user_id: string;
  conteudo: string;
  tag: string;
  imagem: string | null;
  criado_em: string;
  post_curtidas: { user_id: string }[];
  respostas_post: { count: number }[];
};

export async function getPosts(): Promise<PostComunidade[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /* Fase 4 (modo visitante): a ausência de sessão deixou de ser erro.
     O `throw new Error('Usuário não autenticado.')` que ficava aqui barrava
     cedo demais — o mural inteiro (posts, autores, contagens) é informação
     pública desde a Migration 11; o ÚNICO campo desta função que depende de
     identidade é `curtido_pelo_usuario`, e para quem não tem conta ele é
     `false` por definição, não indeterminado.

     A leitura em si é garantida pelo banco, não por esta função: sem sessão,
     a requisição chega ao Supabase como role `anon`, que só alcança as
     tabelas liberadas na Migration 11. Se um dia alguém apontar esta query
     para uma tabela sem policy de `anon`, ela volta vazia — não vaza. */
  const usuarioId = user?.id ?? null;

  const { data, error } = await supabase
    .from('comunidade_posts')
    .select(
      `
      id, user_id, conteudo, tag, imagem, criado_em,
      post_curtidas ( user_id ),
      respostas_post ( count )
    `
    )
    .order('criado_em', { ascending: false })
    .returns<PostRow[]>();

  if (error) throw new Error(`Falha ao buscar comunidade_posts: ${error.message}`);

  const autores = await buscarAutores(
    supabase,
    (data ?? []).map((p) => p.user_id)
  );

  return (data ?? []).map((post) => {
    const autor = autores.get(post.user_id);

    return {
      id: post.id,
      autor_nome: autor?.nome ?? 'Usuário GERMINA',
      // Calculado agora, não lido de coluna — reflete o nível ATUAL do autor,
      // nunca o que ele tinha no instante da publicação.
      autor_nivel: rotuloNivel(autor?.xp ?? 0),
      conteudo: post.conteudo,
      tag: post.tag,
      curtidas: post.post_curtidas.length,
      // Visitante nunca curtiu nada — `false`, não indeterminado.
      curtido_pelo_usuario:
        usuarioId !== null && post.post_curtidas.some((c) => c.user_id === usuarioId),
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
  user_id: string;
  conteudo: string;
  criado_em: string;
};

export async function getRespostas(postId: string): Promise<RespostaPost[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('respostas_post')
    .select('id, post_id, user_id, conteudo, criado_em')
    .eq('post_id', postId)
    .order('criado_em', { ascending: true })
    .returns<RespostaRow[]>();

  if (error) throw new Error(`Falha ao buscar respostas_post: ${error.message}`);

  const autores = await buscarAutores(
    supabase,
    (data ?? []).map((r) => r.user_id)
  );

  return (data ?? []).map((r) => {
    const autor = autores.get(r.user_id);
    return {
      id: r.id,
      post_id: r.post_id,
      autor_nome: autor?.nome ?? 'Usuário GERMINA',
      autor_nivel: rotuloNivel(autor?.xp ?? 0),
      conteudo: r.conteudo,
      criado_em: r.criado_em,
    };
  });
}

type ItemTrocaRow = {
  id: string;
  user_id: string;
  planta_id: string;
  quantidade_disponivel: number;
  procura: string;
};

export async function getTrocas(): Promise<ItemTroca[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('itens_troca')
    .select('id, user_id, planta_id, quantidade_disponivel, procura')
    .eq('ativo', true)
    .order('criado_em', { ascending: false })
    .returns<ItemTrocaRow[]>();

  if (error) throw new Error(`Falha ao buscar itens_troca: ${error.message}`);

  // Mesmo motivo do getPosts: o embed em profiles não sobrevive ao RLS para
  // itens de outras pessoas — e um mural de trocas onde todo anúncio é de
  // "Usuário GERMINA" não serve pra nada.
  const autores = await buscarAutores(
    supabase,
    (data ?? []).map((i) => i.user_id)
  );

  return (data ?? []).map((item) => {
    const planta = PLANTAS_CATALOGO.find((p) => p.id === item.planta_id);

    return {
      id: item.id,
      autor_nome: autores.get(item.user_id)?.nome ?? 'Usuário GERMINA',
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
