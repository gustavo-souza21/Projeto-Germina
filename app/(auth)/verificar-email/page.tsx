'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MailCheck, Sprout } from 'lucide-react';
import { createClient } from '../../../lib/supabase/client';

export default function VerificarEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerificarEmailConteudo />
    </Suspense>
  );
}

function VerificarEmailConteudo() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');
  const email = emailParam || 'seu e-mail cadastrado';
  const [reenviado, setReenviado] = useState(false);
  const [carregandoReenvio, setCarregandoReenvio] = useState(false);
  const [erroReenvio, setErroReenvio] = useState<string | null>(null);

  const handleReenviar = async () => {
    // Sem e-mail na URL (usuário abriu esta tela direto, sem vir do
    // Cadastro) não há pra quem reenviar — o botão não some, mas também não
    // finge sucesso.
    if (!emailParam) {
      setErroReenvio('Não identificamos seu e-mail. Volte para a tela de Cadastro.');
      return;
    }

    setErroReenvio(null);
    setCarregandoReenvio(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: 'signup', email: emailParam });

    setCarregandoReenvio(false);
    if (error) {
      setErroReenvio(error.message);
      return;
    }
    setReenviado(true);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-[var(--color-bg-base)] text-center">
      <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-card-bg)] shadow-sm border border-[var(--color-green-soft)]/40 flex items-center justify-center">
          <MailCheck className="w-8 h-8 text-[var(--color-green-main)]" strokeWidth={1.75} />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-[var(--color-green-deep)]">Quase lá!</h1>
          <p className="text-sm text-[var(--color-blue-deep)]/70">
            Enviamos um link de confirmação para{' '}
            <span className="font-semibold text-[var(--color-blue-deep)]">{email}</span>.
            Clique no link para ativar sua conta antes de entrar.
          </p>
        </div>

        <div className="w-full flex flex-col gap-3 mt-2">
          <Link
            href="/login"
            className="w-full text-center py-3.5 rounded-2xl font-semibold text-white bg-[var(--color-green-main)] active:bg-[var(--color-green-deep)] transition-colors"
          >
            Já confirmei, ir para o login
          </Link>

          <button
            onClick={handleReenviar}
            disabled={carregandoReenvio}
            className="w-full py-3.5 rounded-2xl font-semibold text-[var(--color-blue-deep)] bg-[var(--color-card-bg)] border border-[var(--color-blue-main)]/30 disabled:opacity-60"
          >
            {carregandoReenvio ? 'Reenviando...' : reenviado ? 'E-mail reenviado' : 'Reenviar e-mail'}
          </button>

          {erroReenvio && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {erroReenvio}
            </p>
          )}
        </div>

        <p className="text-xs text-[var(--color-blue-deep)]/50 mt-1">
          Não encontrou o e-mail? Verifique a caixa de spam ou lixo eletrônico.
        </p>
      </div>
    </main>
  );
}
