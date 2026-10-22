import { createClient } from '../supabase/server';
import { Missao } from '../types';

/**
 * Missões e o progresso do usuário logado. O progresso é calculado no
 * servidor (listar_missoes, Migration 15) a partir das tabelas do jogo — a
 * mesma regra que resgatar_missao usa para decidir se paga. Assim o que a tela
 * mostra como "pronta para resgatar" é exatamente o que o servidor aceita.
 */
export async function getMissoes(): Promise<Missao[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('listar_missoes');
  if (error) throw new Error(`Falha ao buscar missões: ${error.message}`);
  return (data ?? []) as Missao[];
}
