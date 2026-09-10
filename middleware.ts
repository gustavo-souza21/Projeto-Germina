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

/* ----------------------------------------------------------------------------
   Fase 4 — MODO VISITANTE.

   Categoria nova, deliberadamente separada de ROTAS_PUBLICAS acima. As duas
   deixam passar sem sessão, mas significam coisas diferentes, e juntá-las
   numa lista só apagaria a distinção que importa:

     • ROTAS_PUBLICAS são telas de AUTENTICAÇÃO e institucionais (login,
       cadastro, termos). Não têm shell do app, e quem está logado é
       redirecionado para fora de algumas delas (ROTAS_SOMENTE_DESLOGADO).
     • ROTAS_PUBLICAS_LEITURA são telas DO APP que qualquer um pode ver, mas
       só ler: montam o shell completo, servem tanto visitante quanto usuário
       logado (para quem, aliás, não muda nada), e as ações de escrita dentro
       delas são barradas individualmente, pelo gate de login no cliente e
       pelo RLS no banco.

   O escopo é o confirmado com o Gustavo (seção 8.2 do relatório de
   auditoria): catálogo de plantas e mural da comunidade. `/scanner` fica
   FORA de propósito, mesmo sendo "só olhar" — é o único endpoint que gasta
   API paga por chamada (achado #6), e abri-lo ao anônimo transformaria uma
   dívida limitada a "qualquer usuário autenticado" em "qualquer pessoa na
   internet".
   ------------------------------------------------------------------------- */
const ROTAS_PUBLICAS_LEITURA = ['/biblioteca', '/comunidade'];

// Rotas de auth "reversas": só fazem sentido pra quem NÃO está logado. Um
// usuário já autenticado que aterrissa aqui (link antigo, aba esquecida) é
// mandado direto pro dashboard em vez de ver a tela de login de novo.
const ROTAS_SOMENTE_DESLOGADO = ['/splash', '/login', '/cadastro'];

function casaComAlguma(pathname: string, rotas: string[]): boolean {
  return rotas.some((rota) => pathname === rota || pathname.startsWith(`${rota}/`));
}

function ehRotaPublica(pathname: string): boolean {
  return casaComAlguma(pathname, ROTAS_PUBLICAS);
}

function ehRotaPublicaLeitura(pathname: string): boolean {
  return casaComAlguma(pathname, ROTAS_PUBLICAS_LEITURA);
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

  if (!user && !ehRotaPublica(pathname) && !ehRotaPublicaLeitura(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';

    /* `?next=` — Fase 4.

       Antes, o visitante que tentasse abrir /jardim era jogado em /login e,
       depois de entrar, caía em /inicio: o destino se perdia no caminho e ele
       tinha que navegar de novo até onde queria. Com o modo visitante isso
       deixa de ser um detalhe e vira o percurso NORMAL do app — a pessoa
       explora sem conta, esbarra numa tela que exige login, entra, e o certo
       é continuar de onde parou.

       Só o path e a query da própria requisição entram aqui (nunca uma URL
       recebida de fora), e /login valida o valor antes de usar — um `next`
       apontando para outro domínio seria um open redirect. */
    const destino = pathname + request.nextUrl.search;
    url.search = `next=${encodeURIComponent(destino)}`;

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
