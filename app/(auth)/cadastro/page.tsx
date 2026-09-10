'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Lock, Eye, EyeOff, Check, X, Sprout } from 'lucide-react';
import { createClient } from '../../../lib/supabase/client';
import { traduzErroAuth } from '../../../lib/auth-errors';

// Regras de senha combinadas: 1 maiúscula, 1 minúscula, 1 número, 1 caractere especial, mín. 8
const REGRAS_SENHA = [
  { id: 'tamanho', label: 'Mínimo de 8 caracteres', teste: (s: string) => s.length >= 8 },
  { id: 'maiuscula', label: 'Uma letra maiúscula', teste: (s: string) => /[A-Z]/.test(s) },
  { id: 'minuscula', label: 'Uma letra minúscula', teste: (s: string) => /[a-z]/.test(s) },
  { id: 'numero', label: 'Um número', teste: (s: string) => /[0-9]/.test(s) },
  { id: 'especial', label: 'Um caractere especial (!@#$...)', teste: (s: string) => /[^A-Za-z0-9]/.test(s) },
];

export default function CadastroPage() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const validacoesSenha = useMemo(
    () => REGRAS_SENHA.map((r) => ({ ...r, ok: r.teste(senha) })),
    [senha]
  );
  const senhaValida = validacoesSenha.every((r) => r.ok);
  const senhasConferem = senha.length > 0 && senha === confirmarSenha;
  const formValido =
    nome.trim() && sobrenome.trim() && telefone.trim() && email.trim() &&
    senhaValida && senhasConferem && aceitouTermos;

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!senhaValida) {
      setErro('A senha ainda não atende a todos os requisitos.');
      return;
    }
    if (!senhasConferem) {
      setErro('As senhas não coincidem.');
      return;
    }
    if (!aceitouTermos) {
      setErro('É necessário aceitar os Termos de Uso para continuar.');
      return;
    }

    setCarregando(true);

    // As chaves em `data` precisam bater com o que handle_new_user() lê de
    // raw_user_meta_data (migration C2): nome_completo e telefone. idade e
    // endereco não são coletados neste formulário — ficam null em profiles
    // até o usuário preencher em Perfil/Configurações.
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome_completo: `${nome} ${sobrenome}`.trim(), telefone },
      },
    });

    if (error) {
      setErro(traduzErroAuth(error.message));
      setCarregando(false);
      return;
    }

    setCarregando(false);
    router.push(`/verificar-email?email=${encodeURIComponent(email)}`);
  };

  const handleGoogleCadastro = async () => {
    // Login via Google já vem com e-mail verificado pelo provedor, então pula
    // a etapa de verificação e vai direto pro tutorial/onboarding — mesmo
    // fluxo e mesmo /auth/callback usados pelo login com Google.
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/inicio` },
    });
    if (error) setErro(traduzErroAuth(error.message));
  };

  return (
    <main className="min-h-screen flex flex-col justify-center px-6 py-10 bg-[var(--color-bg-base)]">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 mb-1">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-card-bg)] shadow-sm border border-[var(--color-green-soft)]/40 flex items-center justify-center">
            <Sprout className="w-7 h-7 text-[var(--color-green-main)]" strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-green-deep)]">Criar Conta</h1>
        </div>

        <form onSubmit={handleCadastro} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Campo icon={<User className="w-4 h-4" />} placeholder="Nome" value={nome} onChange={setNome} />
            <Campo icon={<User className="w-4 h-4" />} placeholder="Sobrenome" value={sobrenome} onChange={setSobrenome} />
          </div>

          <Campo icon={<Phone className="w-4 h-4" />} placeholder="Telefone" type="tel" value={telefone} onChange={setTelefone} />
          <Campo icon={<Mail className="w-4 h-4" />} placeholder="seuemail@exemplo.com" type="email" value={email} onChange={setEmail} />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-blue-main)]/20 focus-within:border-[var(--color-blue-main)]">
              <Lock className="w-4 h-4 text-[var(--color-blue-main)]/60" />
              <input
                type={mostrarSenha ? 'text' : 'password'}
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Senha"
                className="flex-1 bg-transparent outline-none text-sm text-[var(--color-blue-deep)] placeholder:text-[var(--color-blue-deep)]/40"
              />
              <button type="button" onClick={() => setMostrarSenha((v) => !v)} className="text-[var(--color-blue-main)]/60">
                {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Checklist de regras em tempo real */}
            {senha.length > 0 && (
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

          <Campo
            icon={<Lock className="w-4 h-4" />}
            placeholder="Confirmar senha"
            type={mostrarSenha ? 'text' : 'password'}
            value={confirmarSenha}
            onChange={setConfirmarSenha}
          />
          {confirmarSenha.length > 0 && !senhasConferem && (
            <p className="text-xs text-red-600 -mt-2">As senhas não coincidem.</p>
          )}

          <label className="flex items-start gap-2.5 mt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={aceitouTermos}
              onChange={(e) => setAceitouTermos(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[var(--color-green-main)]"
            />
            <span className="text-xs text-[var(--color-blue-deep)]/70">
              Li e concordo com os{' '}
              <Link href="/termos" className="underline text-[var(--color-blue-main)]">Termos de Uso</Link>{' '}
              e a{' '}
              <Link href="/privacidade" className="underline text-[var(--color-blue-main)]">Política de Privacidade</Link>.
            </span>
          </label>

          {erro && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{erro}</p>
          )}

          <button
            type="submit"
            disabled={carregando || !formValido}
            className="w-full py-3.5 rounded-2xl font-semibold text-white bg-[var(--color-green-main)] active:bg-[var(--color-green-deep)] transition-colors disabled:opacity-40"
          >
            {carregando ? 'Criando conta...' : 'Criar Conta'}
          </button>

          <button
            type="button"
            onClick={handleGoogleCadastro}
            className="w-full py-3.5 rounded-2xl font-semibold text-[var(--color-blue-deep)] bg-[var(--color-card-bg)] border border-[var(--color-blue-main)]/30"
          >
            Entrar com o Google
          </button>
        </form>

        <p className="text-center text-sm text-[var(--color-blue-deep)]/70">
          Já tem conta?{' '}
          <Link href="/login" className="text-[var(--color-green-main)] font-semibold">Entrar</Link>
        </p>
      </div>
    </main>
  );
}

function Campo({
  icon, placeholder, value, onChange, type = 'text',
}: {
  icon: React.ReactNode; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-blue-main)]/20 focus-within:border-[var(--color-blue-main)]">
      <span className="text-[var(--color-blue-main)]/60">{icon}</span>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-0 bg-transparent outline-none text-sm text-[var(--color-blue-deep)] placeholder:text-[var(--color-blue-deep)]/40"
      />
    </div>
  );
}
