'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Sprout } from 'lucide-react';
import { createClient } from '../../../lib/supabase/client';
import { traduzErroAuth } from '../../../lib/auth-errors';
import { rotaInternaSegura } from '../../../lib/rota-retorno';

// useSearchParams() exige fronteira de Suspense (mesmo padrão já usado em
// /redefinir-senha) — sem ela o build de produção falha nesta página.
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginConteudo />
    </Suspense>
  );
}

function LoginConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* Fase 4: para onde voltar depois de entrar.
     Chega de duas origens — do middleware, quando o visitante tenta abrir uma
     rota protegida, e dos links de "Entrar" que o próprio app monta com o
     destino embutido. Sempre validado antes de usar (ver lib/rota-retorno.ts):
     um `next` apontando para fora do domínio seria um open redirect, e esta
     tela é justamente a que recebe o valor vindo da URL. */
  const destinoAposLogin = rotaInternaSegura(searchParams.get('next'));

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const irParaProximaTela = async (userId: string) => {
    // Primeiro acesso (tutorial_concluido = false) cai no walkthrough do core
    // loop; quem já concluiu vai direto pro Dashboard. Fonte de verdade é
    // sempre profiles.tutorial_concluido — nunca localStorage (não
    // sincroniza entre dispositivos, e um "Limpar dados do navegador"
    // reabriria o tutorial pra sempre num usuário que já passou por ele).
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('tutorial_concluido')
      .eq('id', userId)
      .single();

    if (error) {
      // Falha na consulta não deve travar o login. Cai no caminho mais
      // seguro: mostrar o tutorial de novo pra quem já viu é inofensivo;
      // pular um tutorial pendente por engano seria pior.
      console.error('Falha ao verificar tutorial_concluido:', error.message);
      router.push(
        destinoAposLogin
          ? `/tutorial?next=${encodeURIComponent(destinoAposLogin)}`
          : '/tutorial'
      );
      return;
    }

    // O tutorial tem precedência sobre o `?next=`: quem nunca viu o
    // walkthrough do core loop passa por ele antes, mesmo tendo pedido uma
    // tela específica. Só depois o destino guardado vale — e para quem já
    // concluiu, ele leva direto aonde a pessoa tentou ir.
    if (!data.tutorial_concluido) {
      // O destino viaja junto: o tutorial o reaplica no fim (ver
      // app/(auth)/tutorial/page.tsx). Sem isto, quem veio do modo visitante
      // com um destino em mãos o perderia ao passar pelo walkthrough.
      router.push(
        destinoAposLogin
          ? `/tutorial?next=${encodeURIComponent(destinoAposLogin)}`
          : '/tutorial'
      );
      return;
    }

    router.push(destinoAposLogin ?? '/inicio');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });

    if (error || !data.user) {
      setErro(error ? traduzErroAuth(error.message) : 'Não foi possível entrar. Tente novamente.');
      setCarregando(false);
      return;
    }

    // Não precisa de setCarregando(false) aqui: a navegação a seguir
    // desmonta esta tela, então "travar" o botão em carregando até lá evita
    // um segundo clique acidental durante o redirect (e durante a consulta a
    // profiles.tutorial_concluido, que agora acontece antes de navegar).
    await irParaProximaTela(data.user.id);
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    // signInWithOAuth já faz o navegador sair da SPA e ir pro Google — não há
    // resultado síncrono pra tratar aqui. O retorno do Google cai em
    // /auth/callback, que troca o code pela sessão e só então navega pra
    // /inicio (ver app/auth/callback/route.ts).
    // O destino do modo visitante também atravessa o login por Google: sem
    // isto, entrar com Google a partir de um gate ("entre para curtir") jogaria
    // a pessoa em /inicio, e só o login por e-mail respeitaria o `?next=`.
    const destinoOAuth = destinoAposLogin ?? '/inicio';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(destinoOAuth)}`,
      },
    });
    if (error) setErro(traduzErroAuth(error.message));
  };

  /* ACHADO #7 — de botão órfão a porta de entrada.

     Este botão era "Modo demonstração (offline)" e levava a `/tutorial`, de
     onde o middleware devolvia a pessoa para `/login` no primeiro passo:
     um caminho que prometia entrar sem conta e não entregava. A auditoria o
     classificou como 🟡 e o Gustavo pediu explicitamente para REAPROVEITÁ-LO
     em vez de removê-lo — a intenção original (deixar olhar sem cadastro)
     estava certa, faltava o app suportá-la.

     Agora ele faz exatamente o que anunciava, e sem "modo demonstração": não
     há dado falso nem sincronização local nenhuma — é o app real, lendo o
     banco real, com as duas rotas que fazem sentido sem conta. Vai para a
     Biblioteca porque é a que se explica sozinha: 15 fichas de curadoria,
     sem depender de haver movimento na comunidade. */
  const handleExplorarSemConta = () => {
    router.push('/biblioteca');
  };

  return (
    <main className="min-h-screen flex flex-col justify-center px-6 py-12 bg-[var(--color-bg-base)]">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-card-bg)] shadow-sm border border-[var(--color-green-soft)]/40 flex items-center justify-center">
            <Sprout className="w-7 h-7 text-[var(--color-green-main)]" strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-green-deep)]">Entrar</h1>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-blue-deep)]">E-mail</label>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-blue-main)]/20 focus-within:border-[var(--color-blue-main)]">
              <Mail className="w-4 h-4 text-[var(--color-blue-main)]/60" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="flex-1 bg-transparent outline-none text-sm text-[var(--color-blue-deep)] placeholder:text-[var(--color-blue-deep)]/40"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-blue-deep)]">Senha</label>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-blue-main)]/20 focus-within:border-[var(--color-blue-main)]">
              <Lock className="w-4 h-4 text-[var(--color-blue-main)]/60" />
              <input
                type={mostrarSenha ? 'text' : 'password'}
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Sua senha"
                className="flex-1 bg-transparent outline-none text-sm text-[var(--color-blue-deep)] placeholder:text-[var(--color-blue-deep)]/40"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                className="text-[var(--color-blue-main)]/60"
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end -mt-1">
            <Link href="/recuperar-senha" className="text-sm text-[var(--color-blue-main)] font-medium">
              Esqueci a senha
            </Link>
          </div>

          {erro && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full py-3.5 rounded-2xl font-semibold text-white bg-[var(--color-green-main)] active:bg-[var(--color-green-deep)] transition-colors disabled:opacity-60"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3.5 rounded-2xl font-semibold text-[var(--color-blue-deep)] bg-[var(--color-card-bg)] border border-[var(--color-blue-main)]/30"
          >
            Entrar com Google
          </button>
        </form>

        <div className="flex flex-col items-center gap-3 mt-1">
          <p className="text-sm text-[var(--color-blue-deep)]/70">
            Não tem conta?{' '}
            <Link href="/cadastro" className="text-[var(--color-green-main)] font-semibold">
              Criar conta
            </Link>
          </p>

          <button
            type="button"
            onClick={handleExplorarSemConta}
            className="text-sm font-semibold text-[var(--color-green-main)] underline underline-offset-2"
          >
            Explorar sem criar conta
          </button>
          <p className="text-[11px] text-center text-[var(--color-blue-deep)]/50 -mt-1 max-w-[16rem]">
            Você pode ver o catálogo de plantas e o mural da comunidade. Plantar, estudar e
            publicar precisam de conta.
          </p>
        </div>
      </div>
    </main>
  );
}
