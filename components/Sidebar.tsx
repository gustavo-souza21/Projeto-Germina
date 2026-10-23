'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GameState, Profile } from '../lib/types';
import { NIVEIS_EVOLUCAO, XP_MAXIMO, calcularNivel } from '../data/plantasData';
import { buttonClasses } from './ui/Button';
import { BarraXP } from './gamificacao/BarraXP';
import { BadgeHexagonal } from './gamificacao/BadgeHexagonal';
import { resolverIcone } from '../lib/icones';
import {
  LayoutDashboard,
  BookOpen,
  Sprout,
  Users,
  User,
  Leaf,
  BookMarked,
  Settings,
  Lock,
} from 'lucide-react';

/* ============================================================================
   GER-UI-03 — SIDEBAR DESKTOP

   O `Navigation.tsx` antigo tinha uma sidebar completa e NUNCA era importado —
   o layout usava só a bottom nav, então em desktop o app exibia a barra de
   celular esticada na largura toda.

   Esta é a extração daquele `<aside>`, com três mudanças estruturais:
     1. `<button onClick>` + `activeTab` → `<Link href>` + `usePathname()`.
        O padrão de abas com callback é do protótipo AI Studio (SPA de tela
        única) e não faz sentido no App Router: quebrava deep link, botão
        voltar e abrir em nova aba.
     2. Cores por token, não hex solto.
     3. Card "Seu progresso" e bloco de estatísticas, que existiam na
        referência e não no componente antigo.
   ========================================================================= */

/* `exigeConta` marca os destinos que não têm o que mostrar sem login (Fase 4).
   Para o visitante eles continuam LISTADOS, não escondidos: sumir com metade
   do menu esconderia do visitante o próprio motivo de criar conta. Eles
   ganham um cadeado e levam ao /login com `?next=`, então quem clica volta
   exatamente para onde tentou ir depois de entrar. */
const NAV_ITEMS = [
  { href: '/inicio', label: 'Início', icon: LayoutDashboard, exigeConta: true },
  { href: '/jardim', label: 'Jardim do Conhecimento', icon: Sprout, exigeConta: true },
  { href: '/biblioteca', label: 'Biblioteca', icon: BookOpen, exigeConta: false },
  { href: '/desafio-diario', label: 'Desafio Diário', icon: BookMarked, exigeConta: true },
  { href: '/comunidade', label: 'Comunidade', icon: Users, exigeConta: false },
  { href: '/perfil', label: 'Perfil', icon: User, exigeConta: true },
  { href: '/configuracoes', label: 'Configurações', icon: Settings, exigeConta: true },
];

interface SidebarProps {
  /** `null` = visitante navegando sem conta (Fase 4). */
  profile: Profile | null;
  /** `null` = visitante. Sem conta não existe XP nem nível para mostrar. */
  gameState: GameState | null;
  plantasEstudadas: number;
  totalEspecies: number;
  especiesRenisus: number;
}

export function Sidebar({
  profile,
  gameState,
  plantasEstudadas,
  totalEspecies,
  especiesRenisus,
}: SidebarProps) {
  const pathname = usePathname();

  // Fase 4: `null` nos dois significa visitante — ninguém logado. O shell
  // continua montando (é ele que dá a navegação para explorar o app sem
  // conta), só troca a identidade e o progresso por um convite a entrar.
  const visitante = profile === null || gameState === null;

  // Estado Derivado: nível não é persistido, é sempre recalculado do XP corrente.
  const nivelAtualNumero = gameState ? calcularNivel(gameState.xp).nivel : 0;
  const nivelAtual =
    NIVEIS_EVOLUCAO.find((n) => n.nivel === nivelAtualNumero) ?? NIVEIS_EVOLUCAO[0];
  const proximoNivel = NIVEIS_EVOLUCAO.find((n) => n.nivel === nivelAtualNumero + 1);

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-card-bg border-r border-black/[0.06] h-screen sticky top-0 overflow-y-auto">
      {/* Marca */}
      <div className="px-5 h-14 flex items-center gap-2 border-b border-black/[0.06]">
        <Leaf className="w-5 h-5 text-green-main" strokeWidth={2} aria-hidden />
        <div className="leading-none">
          <p className="font-bold text-[15px] tracking-tight text-green-deep">GERMINA</p>
          <p className="text-[10px] text-ink-muted mt-0.5">Saberes da Amazônia</p>
        </div>
      </div>

      {/* Identidade + XP — ou o convite a entrar, para o visitante */}
      <div className="px-4 py-4 border-b border-black/[0.06]">
        {visitante ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-alt text-ink-muted flex items-center justify-center shrink-0">
                <User className="w-5 h-5" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-green-deep">Visitante</p>
                {/* Achado #10 tinha um rótulo estático que nunca correspondeu
                    ao que o app fazia ("Modo Demonstração Offline com
                    Sincronização Local"). Aqui o rótulo diz o estado REAL. */}
                <p className="text-[11px] text-ink-muted">Navegando sem conta</p>
              </div>
            </div>
            <Link
              href="/login"
              className={buttonClasses({ variant: 'primary', size: 'sm', fullWidth: true })}
            >
              Entrar
            </Link>
            <p className="text-[10px] text-ink-muted leading-snug">
              Entre para plantar no Jardim, estudar espécies e ganhar XP.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-deep text-white font-semibold flex items-center justify-center shrink-0">
                {profile.nome_completo.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-green-deep truncate">
                  {profile.nome_completo.split(' ').slice(0, 2).join(' ')}
                </p>
                <p className="text-[11px] text-ink-muted truncate">{nivelAtual.nome}</p>
              </div>
            </div>

            {/* GER-UI-11: extraído para <BarraXP>. A meta exibida é o XP_MAXIMO da
                trilha, como nos protótipos ("2.850 / 5.000 XP"). */}
            <BarraXP xp={gameState.xp} max={XP_MAXIMO} className="mt-3" />
          </>
        )}
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-3 space-y-0.5" aria-label="Navegação principal">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const ativo = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const bloqueado = visitante && item.exigeConta;

          // Para o visitante, o destino bloqueado aponta para o login já
          // carregando o `?next=`. Sem isso, o middleware redirecionaria do
          // mesmo jeito — mas o usuário perderia o destino no caminho e cairia
          // em /inicio depois de entrar, em vez de onde tentou ir.
          const destino = bloqueado
            ? `/login?next=${encodeURIComponent(item.href)}`
            : item.href;

          return (
            <Link
              key={item.href}
              href={destino}
              aria-current={ativo ? 'page' : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                ativo
                  ? 'bg-green-deep text-white font-semibold'
                  : 'text-ink-muted hover:bg-black/[0.04] hover:text-green-deep font-medium'
              }`}
            >
              <Icon
                className={`w-[18px] h-[18px] shrink-0 ${ativo ? 'text-white' : 'text-green-main'}`}
                strokeWidth={1.75}
                aria-hidden
              />
              <span className="truncate">{item.label}</span>
              {bloqueado && (
                <Lock
                  className="w-3.5 h-3.5 shrink-0 ml-auto text-locked"
                  strokeWidth={2}
                  aria-label="Exige conta"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Progresso + recompensas */}
      <div className="px-4 pb-4 space-y-4">
        {/* Sem conta não existe progresso — mostrar um card zerado com "Nível 1"
            inventaria um estado de jogo que ninguém tem. O card some inteiro; o
            convite a entrar já está no topo da barra. */}
        {!visitante && (
        <div className="bg-surface-alt rounded-xl p-3.5">
          <p className="text-[11px] font-semibold text-ink-muted">
            Seu progresso
          </p>
          <div className="flex items-center gap-3 mt-2">
            <BadgeHexagonal
              icone={resolverIcone(nivelAtual.icone)}
              tamanho="sm"
              rotulo={`Nível ${nivelAtual.nivel}: ${nivelAtual.nome}`}
            />
            <p className="text-sm font-bold text-green-deep leading-tight">{nivelAtual.nome}</p>
          </div>
          <p className="text-[11px] text-ink-muted mt-1.5">
            {proximoNivel
              ? `Próximo nível: ${proximoNivel.nome}`
              : 'Nível máximo alcançado'}
          </p>
          <Link
            href="/perfil"
            className={buttonClasses({
              variant: 'secondary',
              size: 'sm',
              fullWidth: true,
              className: 'mt-3',
            })}
          >
            Ver recompensas
          </Link>
        </div>
        )}

        {/* Estatísticas — presentes na referência, ausentes do componente antigo.
            Continuam para o visitante: "espécies estudadas" cai para 0 (é o
            número real dele), e os outros dois descrevem o acervo do app, não a
            conta de ninguém — é justamente o que dá noção do tamanho do
            herbário para quem está decidindo se cria conta. */}
        <div className="grid grid-cols-3 gap-1 text-center">
          {[
            { valor: plantasEstudadas, label: 'Espécies estudadas' },
            { valor: totalEspecies, label: 'Espécies no catálogo' },
            { valor: especiesRenisus, label: 'Espécies RENISUS' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-base font-bold text-green-deep tabular-nums">{stat.valor}</p>
              <p className="text-[10px] text-ink-muted leading-tight mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-black/[0.06] text-center">
          <p className="text-[10px] font-semibold text-green-deep">UFAM — PPGCTS/ICET</p>
          <p className="text-[10px] text-ink-muted mt-0.5">Projeto Sarah Batista de Freitas</p>
          <div className="flex items-center justify-center gap-1 mt-2 flex-wrap">
            {[3, 4, 15].map((ods) => (
              <span
                key={ods}
                className="text-[9px] font-bold text-green-deep bg-green-soft/50 px-1.5 py-0.5 rounded"
              >
                ODS {ods}
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
