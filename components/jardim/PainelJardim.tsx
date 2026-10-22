import Link from 'next/link';
import { Card, CardHeader } from '../ui/Card';
import { buttonClasses } from '../ui/Button';
import { BarraXP } from '../gamificacao/BarraXP';
import { BookMarked, Target, Sprout, BookOpen, Users } from 'lucide-react';
import { GameState, TerrenoJardim } from '../../lib/types';
import { calcularNivel } from '../../data/plantasData';
import { diaLocal, ofensivaVigente } from '../../lib/ofensiva';

/* ============================================================================
   GER-UI-16 — PAINEL LATERAL DO JARDIM

   Ocupa o espaço que a Loja monopolizava. Na referência esse lugar é do
   Desafio Diário e das Missões em andamento — conteúdo que PUXA o usuário de
   volta ao loop de estudo, em vez de pedir que ele gaste moedas.

   As missões são derivadas do estado real (canteiros ocupados, espécies
   estudadas), não de um mock separado: números inventados aqui divergiriam do
   que a tela ao lado mostra.
   ========================================================================= */

export function PainelJardim({
  gameState,
  agora,
  terrenos,
  especiesEstudadas,
  totalEspecies,
}: {
  gameState: GameState;
  /** Mesmo instante que o Jardim usa para as fases (vem do servidor no 1º render). */
  agora: number;
  terrenos: TerrenoJardim[];
  especiesEstudadas: number;
  totalEspecies: number;
}) {
  // Estado Derivado: nível não é persistido, é sempre recalculado do XP corrente.
  const nivelAtual = calcularNivel(gameState.xp).nivel;
  const canteirosOcupados = terrenos.filter((t) => Boolean(t.planta_id)).length;
  const canteirosLiberados = terrenos.filter(
    (t) => nivelAtual >= t.nivel_necessario
  ).length;

  const missoes = [
    {
      icone: BookOpen,
      titulo: 'Estude espécies na Biblioteca',
      atual: especiesEstudadas,
      meta: totalEspecies,
      xp: 50,
    },
    {
      icone: Sprout,
      titulo: 'Ocupe seus canteiros liberados',
      atual: canteirosOcupados,
      meta: canteirosLiberados,
      xp: 30,
    },
    {
      icone: Users,
      titulo: 'Mantenha sua ofensiva de estudos',
      atual: Math.min(ofensivaVigente(gameState, diaLocal(new Date(agora))), 7),
      meta: 7,
      xp: 40,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Desafio Diário — o gancho de volta ao estudo */}
      <Card padding="md">
        <CardHeader
          titulo="Desafio Diário"
          descricao="Perguntas baseadas nas plantas do seu jardim"
          icone={BookMarked}
        />

        <div className="flex items-center gap-3 bg-surface-alt rounded-xl p-3">
          <div className="text-center px-1">
            <p className="text-lg font-bold text-green-deep leading-none tabular-nums">4</p>
            <p className="text-[10px] text-ink-muted mt-0.5">perguntas</p>
          </div>
          <div className="w-px h-8 bg-black/[0.08]" aria-hidden />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-ink-muted leading-snug">
              Indicação, preparo, segurança e identificação botânica.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mt-3">
          <p className="text-[11px] font-semibold text-green-deep">
            Recompensa: até 200 XP
          </p>
          <Link
            href="/desafio-diario"
            className={buttonClasses({ variant: 'primary', size: 'sm' })}
          >
            Responder
          </Link>
        </div>
      </Card>

      {/* Missões em andamento */}
      <Card padding="md">
        <CardHeader titulo="Missões em andamento" icone={Target} />

        <ul className="space-y-3.5">
          {missoes.map((missao) => {
            const Icone = missao.icone;
            const concluida = missao.atual >= missao.meta;

            return (
              <li key={missao.titulo}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Icone
                    className="w-3.5 h-3.5 text-green-main shrink-0"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <p className="text-[11px] font-medium text-green-deep flex-1 leading-snug">
                    {missao.titulo}
                  </p>
                  <span className="text-[10px] font-semibold text-ink-muted tabular-nums shrink-0">
                    {concluida ? 'Concluída' : `${missao.atual}/${missao.meta}`}
                  </span>
                </div>
                <BarraXP
                  xp={missao.atual}
                  max={missao.meta}
                  rotulo={false}
                  tamanho="sm"
                  // Missão não é nível: nunca deve exibir "Nível máximo".
                  textoMaximo={null}
                />
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
