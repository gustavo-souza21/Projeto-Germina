'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, Sprout } from 'lucide-react';
import { createClient } from '../../../lib/supabase/client';
import { traduzErroAuth } from '../../../lib/auth-errors';

export default function RecuperarSenhaPage() {
  const router = useRouter();
  const [emailOuUsuario, setEmailOuUsuario] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleEnviarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!emailOuUsuario.trim()) {
      setErro('Informe seu e-mail ou nome de usuário.');
      return;
    }

    // Supabase Auth só sabe recuperar senha por E-MAIL — não existe endpoint
    // de "resetar senha por nome de usuário". Se o valor digitado não parece
    // um e-mail, avisamos aqui em vez de deixar o Supabase rejeitar depois
    // com uma mensagem confusa. (O campo/rótulo aceitando "nome de usuário"
    // é uma pendência de produto: ou o app resolve nickname → e-mail antes
    // de chamar isto — uma lookup extra, fora do escopo desta tarefa — ou o
    // rótulo do campo muda para só "e-mail".)
    const email = emailOuUsuario.trim();
    if (!email.includes('@')) {
      setErro('Por enquanto, a recuperação de senha funciona apenas por e-mail.');
      return;
    }

    setCarregando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setErro(traduzErroAuth(error.message));
      setCarregando(false);
      return;
    }

    setCarregando(false);
    // O Supabase nunca informa se o e-mail existe ou não na base (proteção
    // contra enumeração de contas) — por isso este redirect acontece sempre
    // que a chamada não falhar por outro motivo, mesmo que o e-mail não
    // esteja cadastrado. A própria caixa de entrada é quem confirma.
    router.push(`/redefinir-senha?email=${encodeURIComponent(email)}`);
  };

  return (
    <main className="min-h-screen flex flex-col justify-center px-6 py-12 bg-[var(--color-bg-base)]">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6">
        <Link
          href="/login"
          className="flex items-center gap-1.5 text-sm text-[var(--color-blue-main)] font-medium -mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o login
        </Link>

        <div className="flex flex-col items-center gap-2 mb-1">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-card-bg)] shadow-sm border border-[var(--color-green-soft)]/40 flex items-center justify-center">
            <Sprout className="w-7 h-7 text-[var(--color-green-main)]" strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-green-deep)]">Recuperar Senha</h1>
          <p className="text-sm text-center text-[var(--color-blue-deep)]/70 max-w-xs">
            Informe seu e-mail ou nome de usuário cadastrado. Vamos enviar um código de acesso para você redefinir sua senha.
          </p>
        </div>

        <form onSubmit={handleEnviarCodigo} className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-blue-main)]/20 focus-within:border-[var(--color-blue-main)]">
            <Mail className="w-4 h-4 text-[var(--color-blue-main)]/60" />
            <input
              type="text"
              required
              value={emailOuUsuario}
              onChange={(e) => setEmailOuUsuario(e.target.value)}
              placeholder="E-mail ou nome de usuário"
              className="flex-1 bg-transparent outline-none text-sm text-[var(--color-blue-deep)] placeholder:text-[var(--color-blue-deep)]/40"
            />
          </div>

          {erro && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{erro}</p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full py-3.5 rounded-2xl font-semibold text-white bg-[var(--color-green-main)] active:bg-[var(--color-green-deep)] transition-colors disabled:opacity-60"
          >
            {carregando ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
        </form>
      </div>
    </main>
  );
}
