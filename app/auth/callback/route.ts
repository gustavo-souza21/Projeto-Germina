import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { destinoPosLogin } from '../../../lib/rota-retorno';

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
  /* 'next' permite reaproveitar esta mesma rota de callback pra outros fluxos
     (ex.: o modo visitante da Fase 4, que manda a pessoa de volta pra tela
     onde ela esbarrou no login).

     OPEN REDIRECT CORRIGIDO (revisão da Fase 4): este valor era usado cru, e
     o destino final é montado por concatenação (`${origin}${destino}`, mais
     abaixo). Como `next` não precisava começar com barra, bastava
     `?next=@site-falso.exemplo` para o resultado virar
     `https://germina.app@site-falso.exemplo` — em que o domínio do GERMINA é
     lido como userinfo e o host real é o do atacante. `?next=.site-falso.exemplo`
     tem o mesmo efeito por outro caminho (`https://germina.app.site-falso.exemplo`).

     É a rota MAIS sensível do app para esse tipo de falha: ela roda no
     instante seguinte ao login, quando o usuário mais confia na tela, e está
     fora do matcher do middleware de propósito. A validação já existia no
     repositório (lib/rota-retorno.ts, escrita para a tela de login) e
     simplesmente não estava sendo aplicada aqui — agora está, e é a mesma
     função nos dois lugares, não uma segunda cópia da regra. */
  const next = destinoPosLogin(searchParams.get('next'));

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

      // Mesmo repasse do login por e-mail/senha: se o tutorial vier antes,
      // o destino vai junto e é reaplicado no fim dele.
      const destino =
        !perfilError && perfil.tutorial_concluido
          ? next
          : `/tutorial?next=${encodeURIComponent(next)}`;
      return NextResponse.redirect(`${origin}${destino}`);
    }
  }

  // Sem `code` ou troca falhou: volta pro login com um indicador de erro em
  // vez de deixar o usuário preso numa rota de callback que não renderiza nada.
  return NextResponse.redirect(`${origin}/login?erro=oauth`);
}
