import { createClient } from '../supabase/server';

/**
 * Dados que o guia da Sarah precisa para decidir o que falar.
 *
 * Lido no servidor, no layout de `(app)`, e passado pronto para o componente
 * cliente — mesmo padrão de `getPerfil()`/`getGameState()`. O guia não faz
 * consulta própria ao montar: isso adiaria a fala para depois da hidratação,
 * e a saudação de boas-vindas chegaria atrasada, depois da tela já montada.
 *
 * Tolerante a visitante por construção (Fase 4): sem sessão devolve o estado
 * vazio, sem consultar o banco — `guia_falas_vistas` não concede nada ao role
 * `anon`, e uma consulta que só poderia voltar vazia é ida de rede jogada
 * fora.
 */
export interface EstadoGuia {
  logado: boolean;
  falasVistas: string[];
  /** Dias desde a última ação registrada. `null` = conta nova ou visitante. */
  diasSemAtividade: number | null;
}

const MS_POR_DIA = 86_400_000;

export async function getEstadoGuia(): Promise<EstadoGuia> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { logado: false, falasVistas: [], diasSemAtividade: null };
  }

  // Em paralelo: as duas leituras são independentes.
  const [vistasRes, atividadeRes] = await Promise.all([
    supabase.from('guia_falas_vistas').select('fala_id').eq('user_id', user.id),
    supabase
      .from('atividades')
      .select('criado_em')
      .eq('user_id', user.id)
      .order('criado_em', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (vistasRes.error) {
    // O guia é acessório: um erro aqui não deve derrubar o layout inteiro do
    // app. Pior caso, a Sarah repete uma dica que a pessoa já viu.
    console.error('Falha ao buscar falas vistas do guia:', vistasRes.error.message);
    return { logado: true, falasVistas: [], diasSemAtividade: null };
  }

  const ultima = atividadeRes.data?.criado_em;
  const diasSemAtividade = ultima
    ? Math.floor((Date.now() - new Date(ultima).getTime()) / MS_POR_DIA)
    : null;

  return {
    logado: true,
    falasVistas: (vistasRes.data ?? []).map((v) => v.fala_id),
    diasSemAtividade,
  };
}
