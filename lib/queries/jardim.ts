import { createClient } from '../supabase/server';
import { TerrenoJardim } from '../types';
import { TOTAL_CANTEIROS, nivelParaCanteiro } from '../../data/plantasData';

/**
 * REGRA DE NEGÓCIO: 8 canteiros, liberados pelos 6 níveis da trilha.
 *
 * Desde a Migration 15 os níveis 4 e 6 liberam dois canteiros de uma vez, então
 * `nivel_necessario` vem de `nivelParaCanteiro(id)` (que lê `canteiros` em
 * NIVEIS_EVOLUCAO) — e o servidor aplica a MESMA regra a partir de
 * catalogo_niveis.canteiros. Nunca é coluna de terrenos_jardim. `terrenos_jardim` guarda armazenamento
 * ESPARSO: só existe linha para canteiro já plantado alguma vez. Os 8
 * canteiros da UI vêm sempre de NIVEIS_EVOLUCAO; o banco só diz QUAIS estão
 * ocupados agora — mesma reconciliação que o antigo mock SEMEADO_HA já fazia.
 */
export async function getTerrenos(): Promise<TerrenoJardim[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado.');

  const { data, error } = await supabase
    .from('terrenos_jardim')
    .select('id, planta_id, plantado_em, bonus_adubo_ms, adubado')
    .eq('user_id', user.id);

  if (error) throw new Error(`Falha ao buscar terrenos_jardim: ${error.message}`);

  const porId = new Map((data ?? []).map((t) => [t.id, t]));

  return Array.from({ length: TOTAL_CANTEIROS }, (_, i) => i + 1).map((id) => {
    const linha = porId.get(id);

    return {
      id,
      nivel_necessario: nivelParaCanteiro(id),
      planta_id: linha?.planta_id ?? undefined,
      // ATENÇÃO: timestamptz do Postgres chega como string ISO. TerrenoJardim
      // espera epoch ms (número) — calcularProgresso() faz aritmética direta
      // com esse valor. Esquecer esta conversão quebra o cálculo de fase
      // silenciosamente (NaN em toda comparação de tempo).
      plantado_em: linha?.plantado_em ? new Date(linha.plantado_em).getTime() : undefined,
      bonus_adubo_ms: linha?.bonus_adubo_ms ?? 0,
      adubado: linha?.adubado ?? false,
    };
  });
}
