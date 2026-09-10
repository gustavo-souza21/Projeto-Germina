'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Sprout, Users, User } from 'lucide-react';

/* ============================================================================
   GER-UI-02 — BOTTOM NAVIGATION (mobile)

   DECISÃO DE PRODUTO: o botão central flutuante (+) foi REMOVIDO do escopo.
   Ele aparece em todas as telas mobile dos protótipos, mas nenhuma delas
   define o que ele abre — e um alvo de toque proeminente sem função clara
   custa mais em confusão do que entrega em acesso. Com o (+) fora, os cinco
   slots ficam livres para destinos reais, incluindo o Jardim, que na
   referência não tinha lugar na barra.

   Se a feature voltar, o ponto de mudança é só este arquivo: reservar o slot
   central e renderizar o FAB entre o 2º e o 3º item.

   `md:hidden` é o par do `hidden md:flex` da Sidebar — juntos garantem que
   exatamente uma navegação esteja visível em cada breakpoint.
   ========================================================================= */

const NAV_ITEMS = [
  { href: '/inicio', label: 'Início', icon: LayoutDashboard },
  { href: '/biblioteca', label: 'Biblioteca', icon: BookOpen },
  { href: '/jardim', label: 'Jardim', icon: Sprout },
  { href: '/comunidade', label: 'Comunidade', icon: Users },
  { href: '/perfil', label: 'Perfil', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card-bg/95 backdrop-blur-md border-t border-black/[0.06] pb-[env(safe-area-inset-bottom)]"
      aria-label="Navegação principal"
    >
      <div className="flex items-stretch justify-around max-w-lg mx-auto px-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const ativo = pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={ativo ? 'page' : undefined}
              // min-h-14: alvo de toque acessível (>=44px) mesmo com rótulo curto
              className={`flex flex-col items-center justify-center gap-1 flex-1 min-h-14 py-2 rounded-xl transition-colors ${
                ativo ? 'text-green-deep' : 'text-ink-muted'
              }`}
            >
              <Icon
                className="w-[22px] h-[22px]"
                strokeWidth={ativo ? 2.25 : 1.75}
                aria-hidden
              />
              <span className={`text-[10px] leading-none ${ativo ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
