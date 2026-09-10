import { Atividade, DesafioDiario, Conquista } from '../types';
import { DESAFIOS_INICIAIS, CONQUISTAS_INICIAIS, PLANTAS_CATALOGO } from '../../data/plantasData';
import { createClient } from '../supabase/server';
import { diaLocal } from '../ofensiva';

async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Usuário não autenticado.');
  return { supabase, user };
}

export async function getAtividades(): Promise<Atividade[]> {
  const { supabase, user } = await getAuthUser();

  const { data, error } = await supabase
    .from('atividades')
    .select('id, user_id, icone, texto, xp_ganho, criado_em')
    .eq('user_id', user.id)
    .order('criado_em', { ascending: false })
    .limit(20); // usa o índice (user_id, criado_em desc) da migration C6

  if (error) throw new Error(`Falha ao buscar atividades: ${error.message}`);
  return data ?? [];
}

export async function getDesafios(): Promise<DesafioDiario[]> {
  const { supabase, user } = await getAuthUser();
  const hoje = diaLocal();

  const { data: concluidosHoje, error } = await supabase
    .from('desafios_diarios_concluidos')
    .select('desafio_id')
    .eq('user_id', user.id)
    .eq('data', hoje);

  if (error) throw new Error(`Falha ao buscar desafios_diarios_concluidos: ${error.message}`);

  const idsConcluidos = new Set((concluidosHoje ?? []).map((c) => c.desafio_id));

  // `concluido` não é coluna em lugar nenhum — é sempre "existe linha para
  // (user_id, desafio_id, hoje)?" (desenho da tabela, migration C7).
  // O catálogo de desafios (título, XP, planta-alvo) continua em código —
  // não existe tabela `desafios` no banco, mesma decisão G6 do catálogo de
  // plantas: conteúdo estático não precisa virar linha de banco.
  return DESAFIOS_INICIAIS.map((desafio) => ({
    ...desafio,
    concluido: idsConcluidos.has(desafio.id),
  }));
}

export async function getPlantasEstudadasCount(): Promise<number> {
  const { supabase, user } = await getAuthUser();

  const { count, error } = await supabase
    .from('user_colecao')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (error) throw new Error(`Falha ao contar user_colecao: ${error.message}`);
  return count ?? 0;
}

/**
 * G3 resolvido (Migration 7): c3 (Guardião da Horta) e c4 (Curador Atento) já
 * não são mais placeholder zerado — vêm de count() real sobre colheitas e
 * respostas_quiz. O texto (titulo/descricao/icone/total) continua vindo de
 * CONQUISTAS_INICIAIS: é conteúdo estático, só desbloqueada/progresso são
 * Estado Derivado.
 */
export async function getConquistas(): Promise<Conquista[]> {
  const { supabase, user } = await getAuthUser();

  const [
    { data: profile, error: profileError },
    { data: gameState, error: gameStateError },
    { data: colecao, error: colecaoError },
    { count: colheitasCount, error: colheitasError },
    { count: respostasQuizCount, error: respostasQuizError },
  ] = await Promise.all([
    supabase.from('profiles').select('tutorial_concluido').eq('id', user.id).single(),
    supabase.from('game_state').select('streak').eq('user_id', user.id).single(),
    supabase.from('user_colecao').select('planta_id').eq('user_id', user.id),
    supabase.from('colheitas').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase
      .from('respostas_quiz')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('eixo', 'Segurança e Contraindicação')
      .eq('correta', true),
  ]);

  if (profileError) throw new Error(`Falha ao buscar profile: ${profileError.message}`);
  if (gameStateError) throw new Error(`Falha ao buscar game_state: ${gameStateError.message}`);
  if (colecaoError) throw new Error(`Falha ao buscar user_colecao: ${colecaoError.message}`);
  if (colheitasError) throw new Error(`Falha ao contar colheitas: ${colheitasError.message}`);
  if (respostasQuizError) throw new Error(`Falha ao contar respostas_quiz: ${respostasQuizError.message}`);

  const plantasDesbloqueadasIds = new Set((colecao ?? []).map((c) => c.planta_id));
  const especiesRenisusEstudadas = PLANTAS_CATALOGO.filter(
    (p) => p.is_renisus && plantasDesbloqueadasIds.has(p.id)
  ).length;

  return CONQUISTAS_INICIAIS.map((c): Conquista => {
    switch (c.id) {
      case 'c1': {
        const progresso = profile?.tutorial_concluido ? 1 : 0;
        return { ...c, progresso, desbloqueada: progresso >= c.total };
      }
      case 'c2': {
        const progresso = Math.min(especiesRenisusEstudadas, c.total);
        return { ...c, progresso, desbloqueada: progresso >= c.total };
      }
      case 'c3': {
        const progresso = Math.min(colheitasCount ?? 0, c.total);
        return { ...c, progresso, desbloqueada: progresso >= c.total };
      }
      case 'c4': {
        const progresso = Math.min(respostasQuizCount ?? 0, c.total);
        return { ...c, progresso, desbloqueada: progresso >= c.total };
      }
      case 'c5': {
        const progresso = Math.min(gameState?.streak ?? 0, c.total);
        return { ...c, progresso, desbloqueada: progresso >= c.total };
      }
      default:
        return c;
    }
  });
}
