import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPostPorId, getRespostas } from '../../../../../lib/queries/comunidade';
import { getPerfil } from '../../../../../lib/queries/perfil';
import { PostDetalheClient } from '../../../../../components/comunidade/PostDetalheClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostPorId(id);

  if (!post) {
    return { title: 'Post não encontrado | GERMINA' };
  }

  return {
    title: `${post.autor_nome} na Comunidade GERMINA`,
    description: post.conteudo,
  };
}

export default async function PostDetalhePage({ params }: PageProps) {
  const { id } = await params;
  const post = await getPostPorId(id);

  if (!post) {
    notFound();
  }

  const [respostas, profile] = await Promise.all([getRespostas(id), getPerfil()]);

  return <PostDetalheClient post={post} respostasIniciais={respostas} profile={profile} />;
}
