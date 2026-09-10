import { Sparkles, FlaskConical } from 'lucide-react';
import { Button } from '../ui/Button';
import { FaseCultivada, PlantaCatalogo } from '../../lib/types';
import { ROTULO_FASE, formatarTempoRestante } from '../../lib/jardim';
import { AneisCanteiro } from './AneisCanteiro';
import { IlustracaoPlanta } from './IlustracaoPlanta';

/**
 * ESTADO 3 — CULTIVADO
 *
 * A planta TRANSBORDA o anel — é o que dá volume à cena na referência. Por
 * isso a ilustração fica em `absolute` acima do topo da elipse, e os SVGs
 * usam `overflow: visible`.
 *
 * Rótulo em dois níveis, como no protótipo: pílula verde-escura com o nome da
 * espécie e, abaixo, a tag verde-lima com o estado (GER-UI-15 — nunca o enum).
 *
 * As ações ficam num overlay que só aparece no hover/foco: na cena cheia, oito
 * pares de botões competiriam com as plantas. `focus-within` garante que quem
 * navega por teclado também alcance.
 */
export function CanteiroCultivado({
  planta,
  fase,
  adubado,
  pronto,
  msParaProxima,
  podeAdubar,
  motivoAdubarBloqueado,
  onAdubar,
  onColher,
}: {
  planta: PlantaCatalogo | null;
  fase: FaseCultivada;
  adubado: boolean;
  pronto: boolean;
  /** ms até a próxima fase; `null` quando já está pronta. */
  msParaProxima: number | null;
  podeAdubar: boolean;
  motivoAdubarBloqueado?: string;
  onAdubar: () => void;
  onColher: () => void;
}) {
  return (
    <div className="relative w-full group">
      <AneisCanteiro variante="ativo" className="w-full h-auto" />

      {/* Planta: ancorada no centro da elipse e crescendo para cima */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[34%] w-[78%] pointer-events-none">
        <IlustracaoPlanta
          fase={fase}
          categoria={planta?.categoria}
          className="w-full h-auto drop-shadow-none"
        />
      </div>

      {/* Rótulos */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-[30%] w-[118%] flex flex-col items-center gap-1">
        <span className="text-[10px] sm:text-[11px] font-semibold text-white bg-green-deep rounded-full px-2.5 py-0.5 leading-tight max-w-full truncate">
          {planta?.nome_popular ?? 'Espécie desconhecida'}
        </span>
        <span className="text-[9px] sm:text-[10px] font-semibold text-green-deep bg-green-soft rounded-full px-2 py-0.5 leading-tight">
          {ROTULO_FASE[fase]}
        </span>

        {/* QA-01: sem contador, o crescimento era invisível e a horta parecia
            travada mesmo quando estava evoluindo. */}
        {msParaProxima !== null && (
          <span className="text-[9px] text-white/90 bg-blue-deep/70 rounded-full px-2 py-0.5 leading-tight tabular-nums">
            {formatarTempoRestante(msParaProxima)}
          </span>
        )}
      </div>

      {/* Ações — reveladas no hover ou no foco por teclado */}
      <div className="absolute inset-x-0 top-0 flex justify-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        {pronto ? (
          <Button variant="secondary" size="sm" icone={Sparkles} onClick={onColher}>
            Colher
          </Button>
        ) : adubado ? (
          <span className="text-[10px] font-semibold text-white bg-green-main/90 rounded-full px-2.5 py-1">
            Adubada
          </span>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            icone={FlaskConical}
            onClick={onAdubar}
            disabled={!podeAdubar}
            title={motivoAdubarBloqueado}
          >
            Adubar
          </Button>
        )}
      </div>
    </div>
  );
}
