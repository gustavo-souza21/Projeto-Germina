'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound, Lock, Eye, EyeOff, Check, X, ArrowLeft, Sprout } from 'lucide-react';
import { createClient } from '../../../lib/supabase/client';
import { traduzErroAuth } from '../../../lib/auth-errors';
// "Mesmas regras usadas no Cadastro" agora é literal, não uma promessa em
// comentário: as duas telas importam a MESMA lista (Fase 3, achado #5).
// Antes eram duas cópias que só por sorte continuavam iguais — e esta aqui,
// se ficasse para trás, viraria o caminho para contornar um endurecimento
// feito no cadastro.
import { avaliarSenha } from '../../../lib/senha';

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={null}>
      <RedefinirSenhaConteudo />
    </Suspense>
  );
}

function RedefinirSenhaConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Veio da tela de Recuperar Senha via query string (mesmo padrão de
  // verificar-email?email=...). Sem ele não há como chamar verifyOtp — o
  // código de 6 dígitos sozinho não identifica QUAL conta está sendo
  // recuperada, o Supabase exige os dois juntos.
  const email = searchParams.get('email');

  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const validacoesSenha = useMemo(() => avaliarSenha(novaSenha), [novaSenha]);
  const senhaValida = validacoesSenha.every((r) => r.ok);
  const senhasConferem = novaSenha.length > 0 && novaSenha === confirmarSenha;
  const formValido = codigo.trim().length > 0 && senhaValida && senhasConferem;

  const handleRedefinir = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!email) {
      setErro('Não identificamos seu e-mail. Volte e solicite o código novamente.');
      return;
    }
    if (!codigo.trim()) {
      setErro('Informe o código de acesso enviado por e-mail.');
      return;
    }
    if (!senhaValida) {
      setErro('A nova senha ainda não atende a todos os requisitos.');
      return;
    }
    if (!senhasConferem) {
      setErro('As senhas não coincidem.');
      return;
    }

    setCarregando(true);
    const supabase = createClient();

    // Passo 1: o código de 6 dígitos prova posse do e-mail e, ao ser aceito,
    // já estabelece uma sessão válida (é o que permite o updateUser abaixo
    // funcionar sem o usuário logar de novo com a senha antiga).
    const { error: otpError } = await supabase.auth.verifyOtp({
      email,
      token: codigo,
      type: 'recovery',
    });
    if (otpError) {
      setErro(traduzErroAuth(otpError.message));
      setCarregando(false);
      return;
    }

    // Passo 2: com a sessão da recuperação já ativa, troca a senha de fato.
    const { error: updateError } = await supabase.auth.updateUser({ password: novaSenha });
    if (updateError) {
      setErro(traduzErroAuth(updateError.message));
      setCarregando(false);
      return;
    }

    setCarregando(false);
    setSucesso(true);
    setTimeout(() => router.push('/login'), 1500);
  };

  if (sucesso) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-[var(--color-bg-base)] text-center gap-3">
        <div className="w-16 h-16 rounded-full bg-[var(--color-green-soft)]/30 flex items-center justify-center">
          <Check className="w-8 h-8 text-[var(--color-green-main)]" />
        </div>
        <h1 className="text-xl font-bold text-[var(--color-green-deep)]">Senha redefinida!</h1>
        <p className="text-sm text-[var(--color-blue-deep)]/70">Redirecionando para o login...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col justify-center px-6 py-12 bg-[var(--color-bg-base)]">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6">
        <Link
          href="/recuperar-senha"
          className="flex items-center gap-1.5 text-sm text-[var(--color-blue-main)] font-medium -mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="flex flex-col items-center gap-2 mb-1">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-card-bg)] shadow-sm border border-[var(--color-green-soft)]/40 flex items-center justify-center">
            <Sprout className="w-7 h-7 text-[var(--color-green-main)]" strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-green-deep)]">Redefinir Senha</h1>
          <p className="text-sm text-center text-[var(--color-blue-deep)]/70 max-w-xs">
            Digite o código que enviamos para você e escolha uma nova senha.
          </p>
        </div>

        <form onSubmit={handleRedefinir} className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-blue-main)]/20 focus-within:border-[var(--color-blue-main)]">
            <KeyRound className="w-4 h-4 text-[var(--color-blue-main)]/60" />
            <input
              type="text"
              required
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Código de acesso"
              className="flex-1 bg-transparent outline-none text-sm tracking-widest text-[var(--color-blue-deep)] placeholder:text-[var(--color-blue-deep)]/40 placeholder:tracking-normal"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-blue-main)]/20 focus-within:border-[var(--color-blue-main)]">
              <Lock className="w-4 h-4 text-[var(--color-blue-main)]/60" />
              <input
                type={mostrarSenha ? 'text' : 'password'}
                required
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Nova senha"
                className="flex-1 bg-transparent outline-none text-sm text-[var(--color-blue-deep)] placeholder:text-[var(--color-blue-deep)]/40"
              />
              <button type="button" onClick={() => setMostrarSenha((v) => !v)} className="text-[var(--color-blue-main)]/60">
                {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {novaSenha.length > 0 && (
              <ul className="grid grid-cols-1 gap-1 mt-1 px-1">
                {validacoesSenha.map((r) => (
                  <li key={r.id} className="flex items-center gap-1.5 text-xs">
                    {r.ok ? (
                      <Check className="w-3.5 h-3.5 text-[var(--color-green-main)]" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-[var(--color-blue-deep)]/30" />
                    )}
                    <span className={r.ok ? 'text-[var(--color-green-deep)]' : 'text-[var(--color-blue-deep)]/50'}>
                      {r.label}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-blue-main)]/20 focus-within:border-[var(--color-blue-main)]">
            <Lock className="w-4 h-4 text-[var(--color-blue-main)]/60" />
            <input
              type={mostrarSenha ? 'text' : 'password'}
              required
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Confirmar nova senha"
              className="flex-1 bg-transparent outline-none text-sm text-[var(--color-blue-deep)] placeholder:text-[var(--color-blue-deep)]/40"
            />
          </div>
          {confirmarSenha.length > 0 && !senhasConferem && (
            <p className="text-xs text-red-600 -mt-2">As senhas não coincidem.</p>
          )}

          {erro && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{erro}</p>
          )}

          <button
            type="submit"
            disabled={carregando || !formValido}
            className="w-full py-3.5 rounded-2xl font-semibold text-white bg-[var(--color-green-main)] active:bg-[var(--color-green-deep)] transition-colors disabled:opacity-40"
          >
            {carregando ? 'Redefinindo...' : 'Redefinir senha'}
          </button>
        </form>
      </div>
    </main>
  );
}
