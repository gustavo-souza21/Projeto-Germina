import { createClient } from '../supabase/server';
import { Profile, GameState } from '../types';
import { mapGameStateRow } from '../gamificacao';

/**
 * Camada de acesso a dados — lê direto do Supabase, sempre do usuário
 * autenticado da sessão (nunca recebe um id por parâmetro: RLS já garante
 * que só é possível ler a própria linha, e as Server Components que chamam
 * estas funções nunca sabem o id de outro usuário).
 */

async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Usuário não autenticado.');
  return { supabase, user };
}

export async function getPerfil(): Promise<Profile> {
  const { supabase, user } = await getAuthUser();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, nome_completo, nickname, idade, endereco, telefone, instituicao, criado_em')
    .eq('id', user.id)
    .single();

  if (error) throw new Error(`Falha ao buscar profile: ${error.message}`);

  return {
    id: data.id,
    nome_completo: data.nome_completo,
    nickname: data.nickname ?? undefined,
    // email não é coluna de profiles (decisão do Relatório de Mapeamento) —
    // vem direto do usuário autenticado, nunca duplicado em tabela.
    email: user.email ?? '',
    idade: data.idade ?? undefined,
    endereco: data.endereco ?? undefined,
    telefone: data.telefone,
    instituicao: data.instituicao,
    criado_em: data.criado_em,
  };
}

export async function getGameState(): Promise<GameState> {
  const { supabase, user } = await getAuthUser();

  const { data, error } = await supabase
    .from('game_state')
    .select('user_id, xp, streak, ultimo_desafio_em, sementes, adubo, moedas, tema_ativo')
    .eq('user_id', user.id)
    .single();

  if (error) throw new Error(`Falha ao buscar game_state: ${error.message}`);

  // GameState não tem campo nivel_atual (Estado Derivado) — quem precisar do
  // nível chama calcularNivel(gameState.xp).nivel no ponto de leitura, nunca
  // aqui. mapGameStateRow é o MESMO conversor snake_case → GameState usado
  // pelos handlers client-side que chamam as RPCs de economia (Migration 8)
  // — um ponto só de tradução evita que os dois lados decidam de formas
  // diferentes o que fazer com `ultimo_desafio_em: null`.
  return mapGameStateRow(data);
}
