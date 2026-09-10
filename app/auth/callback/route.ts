import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

/**
 * Route Handler que fecha o fluxo de OAuth (login/cadastro com Google).
 *
 * O botão "Entrar com Google" manda o navegador pro Google e depois pra cá,
 * com um `code` de troca na URL — é o passo que `signInWithOAuth` não faz
 * sozinho, porque ele só inicia o redirect; alguém do lado do servidor
 * precisa trocar esse código pela sessão de verdade.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // 'next' permite reaproveitar esta mesma rota de callback pra outros fluxos
  // no futuro (ex.: um convite que devolve pra uma tela específica) sem
  // precisar de uma segunda rota — hoje só login/cadastro via Google usam,
  // sempre com o destino padrão.
  const next = searchParams.get('next') ?? '/inicio';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Mesmo gate de app/(auth)/login/page.tsx (irParaProximaTela): nunca
      // pular o tutorial no primeiro acesso, mesmo que `next` (hoje sempre
      // fixo em /inicio pelos dois chamadores — login e cadastro via Google)
      // diga o contrário. Sem isto, um cadastro por Google nunca via o
      // tutorial — pulava direto pro Dashboard, diferente de quem se
      // cadastra por e-mail/senha. Falha na consulta cai no caminho mais
      // seguro (mostrar o tutorial de novo é inofensivo).
      const { data: perfil, error: perfilError } = await supabase
        .from('profiles')
        .select('tutorial_concluido')
        .eq('id', data.user.id)
        .single();

      const destino = !perfilError && perfil.tutorial_concluido ? next : '/tutorial';
      return NextResponse.redirect(`${origin}${destino}`);
    }
  }

  // Sem `code` ou troca falhou: volta pro login com um indicador de erro em
  // vez de deixar o usuário preso numa rota de callback que não renderiza nada.
  return NextResponse.redirect(`${origin}/login?erro=oauth`);
}
