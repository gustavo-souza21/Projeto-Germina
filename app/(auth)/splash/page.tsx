'use client';

import Link from 'next/link';
import { Sprout } from 'lucide-react';

export default function SplashPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-between px-6 py-12 bg-[var(--color-bg-base)]">
      {/* Espaço superior vazio para centralizar o bloco principal */}
      <div />

      {/* Bloco central: logo, nome, slogan */}
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-24 h-24 rounded-3xl bg-[var(--color-card-bg)] shadow-sm border border-[var(--color-green-soft)]/40 flex items-center justify-center">
          <Sprout className="w-12 h-12 text-[var(--color-green-main)]" strokeWidth={1.75} />
        </div>

        <h1 className="text-3xl font-bold text-[var(--color-green-deep)]">
          Germina
        </h1>

        <p className="text-base text-[var(--color-blue-deep)]/80 max-w-xs">
          Aprenda sobre plantas medicinais da Amazônia jogando, colecionando e cultivando conhecimento.
        </p>
      </div>

      {/* Bloco inferior: ações + termos */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <Link
          href="/cadastro"
          className="w-full text-center py-3.5 rounded-2xl font-semibold text-white bg-[var(--color-green-main)] active:bg-[var(--color-green-deep)] transition-colors"
        >
          Criar Conta
        </Link>

        <Link
          href="/login"
          className="w-full text-center py-3.5 rounded-2xl font-semibold text-[var(--color-blue-deep)] bg-[var(--color-card-bg)] border border-[var(--color-blue-main)]/30 active:bg-[var(--color-bg-base)] transition-colors"
        >
          Entrar
        </Link>

        <p className="text-center text-xs text-[var(--color-blue-deep)]/60 mt-1">
          Ao continuar, você concorda com nossos{' '}
          <Link href="/termos" className="underline text-[var(--color-blue-main)]">
            Termos de Uso
          </Link>{' '}
          e{' '}
          <Link href="/privacidade" className="underline text-[var(--color-blue-main)]">
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
