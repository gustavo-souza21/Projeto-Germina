import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * GERMINA — Middleware de sessão + proteção de rotas (Kanban A8).
 *
 * Duas responsabilidades, nesta ordem:
 *   1. Refrescar o token de sessão do Supabase a cada request (é isso que
 *      mantém o usuário logado por mais que os ~1h de vida do access token —
 *      sem isto, o cookie expira em silêncio e a sessão "cai" no meio do uso).
 *   2. Decidir, com o resultado desse refresh, se a rota pedida pode ser
 *      servida ou se precisa redirecionar (usuário deslogado tentando entrar
 *      em rota protegida, ou usuário logado tentando ver tela de login).
 *
 * Não existe app/page.tsx (raiz "/") neste projeto — a raiz é resolvida aqui
 * mesmo, redirecionando para /inicio (logado) ou /splash (deslogado), em vez
 * de criar uma página raiz cujo único trabalho seria redirecionar.
 */

const ROTAS_PUBLICAS = [
  '/splash',
  '/login',
  '/cadastro',
  '/recuperar-senha',
  '/redefinir-senha',
  '/verificar-email',
  '/termos',
  '/privacidade',
];

// Rotas de auth "reversas": só fazem sentido pra quem NÃO está logado. Um
// usuário já autenticado que aterrissa aqui (link antigo, aba esquecida) é
// mandado direto pro dashboard em vez de ver a tela de login de novo.
const ROTAS_SOMENTE_DESLOGADO = ['/splash', '/login', '/cadastro'];

function ehRotaPublica(pathname: string): boolean {
  return ROTAS_PUBLICAS.some((rota) => pathname === rota || pathname.startsWith(`${rota}/`));
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Precisa ser escrito nos dois lados: no `request` para que o
          // restante deste middleware (e o Server Component que vier a
          // seguir) já veja o cookie atualizado, e no `response` para que o
          // navegador de fato receba o cookie novo.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() (não getSession()) de propósito: getSession() só lê o cookie
  // local, que pode estar com um token já expirado. getUser() valida contra
  // o servidor do Supabase Auth — é a única chamada seguindo confiar aqui.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = user ? '/inicio' : '/splash';
    return NextResponse.redirect(url);
  }

  if (!user && !ehRotaPublica(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && ROTAS_SOMENTE_DESLOGADO.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/inicio';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Roda em toda rota, exceto:
     *   - arquivos internos do Next (_next/static, _next/image)
     *   - favicon.ico
     *   - a própria rota de callback OAuth (precisa rodar sem sessão ainda
     *     válida — é ela quem cria a sessão)
     *   - arquivos estáticos por extensão (imagens, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
