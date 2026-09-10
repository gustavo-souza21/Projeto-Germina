'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, Sprout } from 'lucide-react';
import { createClient } from '../../../lib/supabase/client';
import { traduzErroAuth } from '../../../lib/auth-errors';

export default function RecuperarSenhaPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  /* --------------------------------------------------------------------------
     Achado #8 da auditoria (Fase 3, 09/09/2026) — a tela pedia "e-mail ou nome
     de usuário", mas o Supabase Auth só recupera senha por e-mail: não existe
     endpoint de "resetar senha por nome de usuário". Quem digitasse o próprio
     nickname era barrado por uma validação escondida, depois de já ter
     preenchido e enviado o formulário.

     A pendência de produto que a versão anterior deixou anotada aqui era
     escolher entre resolver nickname → e-mail antes de chamar o Supabase (uma
     consulta a mais, e que abriria caminho para enumerar contas: daria pra
     descobrir quais nicknames existem pela resposta) ou ajustar o rótulo. A
     Fase 3 escolheu o rótulo — a tela agora pede o que o sistema de fato
     aceita, em vez de prometer mais e recusar depois.
     ----------------------------------------------------------------------- */
  const handleEnviarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const emailLimpo = email.trim();

    if (!emailLimpo) {
      setErro('Informe o e-mail cadastrado.');
      return;
    }

    // `type="email"` no input já cobre o caso normal; esta guarda pega o que
    // escapa dele (colar um valor, autofill esquisito) antes de gastar uma
    // chamada de rede.
    if (!emailLimpo.includes('@')) {
      setErro('Informe um e-mail válido.');
      return;
    }

    setCarregando(true);
    const supabase = createClient();
    // Dependência de configuração, não de código: a tela seguinte
    // (/redefinir-senha) valida um CÓDIGO de 6 dígitos via `verifyOtp`, então
    // o template de e-mail "Reset Password" no painel do Supabase precisa
    // enviar `{{ .Token }}`. No template padrão vai um LINK ({{ .ConfirmationURL }}),
    // e aí o usuário recebe uma coisa e a tela pede outra. Anotado no doc de
    // status junto dos demais passos de configuração do projeto real.
    const { error } = await supabase.auth.resetPasswordForEmail(emailLimpo);

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
    router.push(`/redefinir-senha?email=${encodeURIComponent(emailLimpo)}`);
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
            Informe o e-mail cadastrado. Vamos enviar um código de acesso para você redefinir sua
            senha.
          </p>
        </div>

        <form onSubmit={handleEnviarCodigo} className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-blue-main)]/20 focus-within:border-[var(--color-blue-main)]">
            <Mail className="w-4 h-4 text-[var(--color-blue-main)]/60" />
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail cadastrado"
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
            {/* Era "Enviar link de recuperação", mas o que chega é um código de
                6 dígitos, que a próxima tela pede em um campo — mesmo tipo de
                desencontro do achado #8, só que entre duas telas do app. */}
            {carregando ? 'Enviando...' : 'Enviar código de recuperação'}
          </button>
        </form>
      </div>
    </main>
  );
}
