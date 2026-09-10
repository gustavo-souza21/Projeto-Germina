import { createClient } from '../supabase/server';
import { PlantaCatalogo, UserColecao } from '../types';
import { PLANTAS_CATALOGO } from '../../data/plantasData';

// Catálogo continua em código (G6) — nenhuma tabela de banco espelha isto.
export async function getPlantasCatalogo(): Promise<PlantaCatalogo[]> {
  return PLANTAS_CATALOGO;
}

export async function getColecao(): Promise<UserColecao[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado.');

  const { data, error } = await supabase
    .from('user_colecao')
    .select('user_id, planta_id, status_crescimento, desbloqueada_em')
    .eq('user_id', user.id);

  if (error) throw new Error(`Falha ao buscar user_colecao: ${error.message}`);

  return (data ?? []).map((c) => ({
    user_id: c.user_id,
    planta_id: c.planta_id,
    // A coluna é `text` com CHECK no banco (migration C4/C5), não um enum
    // nativo do Postgres — o gerador de tipos não sabe reduzir isso para a
    // união de 5 valores, então chega como `string` solto. O cast é seguro
    // porque a CHECK constraint já impede qualquer outro valor de existir.
    status_crescimento: c.status_crescimento as UserColecao['status_crescimento'],
    desbloqueada_em: c.desbloqueada_em ?? undefined,
  }));
}
