import { createClient } from './supabase/client';
import type { Database } from './supabase/database.types';

/**
 * Portabilidade de dados (G5 do Kanban, decisão de escopo tomada aqui):
 * exporta tudo que o Postgres guarda diretamente sobre o usuário — não
 * inclui dados derivados/calculados em runtime (nível, fase de cultivo etc.)
 * porque esses não são "dados do usuário", são sempre recomputáveis a partir
 * do que já está no JSON exportado (mesmo princípio de Estado Derivado do
 * resto do app).
 */
export interface DadosExportados {
  exportado_em: string;
  perfil: Database['public']['Tables']['profiles']['Row'] | null;
  progresso: Database['public']['Tables']['game_state']['Row'] | null;
  herbario: Database['public']['Tables']['user_colecao']['Row'][];
  atividades: Database['public']['Tables']['atividades']['Row'][];
  desafios_concluidos: Database['public']['Tables']['desafios_diarios_concluidos']['Row'][];
}

async function coletarDadosUsuario(): Promise<DadosExportados> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Usuário não autenticado.');

  // Em paralelo: são 5 leituras independentes do mesmo user_id, cada uma já
  // isolada por RLS — não há motivo pra serializar.
  const [perfilRes, progressoRes, herbarioRes, atividadesRes, desafiosRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('game_state').select('*').eq('user_id', user.id).single(),
    supabase.from('user_colecao').select('*').eq('user_id', user.id),
    supabase.from('atividades').select('*').eq('user_id', user.id).order('criado_em', { ascending: false }),
    supabase
      .from('desafios_diarios_concluidos')
      .select('*')
      .eq('user_id', user.id)
      .order('data', { ascending: false }),
  ]);

  const erros = [perfilRes.error, progressoRes.error, herbarioRes.error, atividadesRes.error, desafiosRes.error];
  const primeiroErro = erros.find((e): e is NonNullable<typeof e> => e !== null);
  if (primeiroErro) {
    throw new Error(`Falha ao buscar dados para exportação: ${primeiroErro.message}`);
  }

  return {
    exportado_em: new Date().toISOString(),
    perfil: perfilRes.data,
    progresso: progressoRes.data,
    herbario: herbarioRes.data ?? [],
    atividades: atividadesRes.data ?? [],
    desafios_concluidos: desafiosRes.data ?? [],
  };
}

/**
 * Busca os dados do usuário logado, monta um JSON único e aciona o download
 * nativo do navegador (`dados_germina_AAAA-MM-DD.json`). Roda inteiramente no
 * cliente — o Blob nunca passa por um servidor, então não precisa de rota
 * própria (diferente da exclusão de conta, que exige service_role).
 *
 * Lança em caso de falha (autenticação ou qualquer `select`); quem chama
 * decide como comunicar isso na UI (ver ExportarDadosModal).
 */
export async function exportarDadosUsuario(): Promise<void> {
  const dados = await coletarDadosUsuario();

  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const dataArquivo = dados.exportado_em.slice(0, 10); // AAAA-MM-DD, do mesmo timestamp gravado no JSON

  const link = document.createElement('a');
  link.href = url;
  link.download = `dados_germina_${dataArquivo}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
