import { createClient } from '../supabase/server';
import { Preferencias } from '../types';

export async function getPreferencias(): Promise<Preferencias> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado.');

  const { data, error } = await supabase
    .from('preferencias')
    .select(
      'lembrete_desafio_diario, alertas_mural, solicitacoes_troca, herbario_publico, disponivel_para_trocas, unidades'
    )
    .eq('user_id', user.id)
    .single();

  if (error) throw new Error(`Falha ao buscar preferencias: ${error.message}`);

  return {
    lembreteDesafioDiario: data.lembrete_desafio_diario,
    alertasMural: data.alertas_mural,
    solicitacoesTroca: data.solicitacoes_troca,
    herbarioPublico: data.herbario_publico,
    disponivelParaTrocas: data.disponivel_para_trocas,
    // Banco guarda 'metrico'/'imperial' (CHECK da migration C7); o tipo do
    // cliente usa os rótulos de exibição completos — tradução na borda, como
    // em todo o resto da camada de queries.
    unidades: data.unidades === 'imperial' ? 'Imperial (pol)' : 'Métrico (cm)',
  };
}
