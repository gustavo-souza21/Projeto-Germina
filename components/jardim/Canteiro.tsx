import { EstadoCanteiro } from '../../lib/jardim';
import { PlantaCatalogo } from '../../lib/types';
import { CanteiroBloqueado } from './CanteiroBloqueado';
import { CanteiroVazio } from './CanteiroVazio';
import { CanteiroCultivado } from './CanteiroCultivado';

/* ============================================================================
   GER-UI-14 — CANTEIRO

   Substitui o ternário aninhado de ~120 linhas que vivia dentro do `.map()` do
   JardimConhecimento e misturava, no mesmo bloco, a marcação dos três estados
   com as regras de negócio dos botões.

   O `switch` sobre `estado.tipo` é exaustivo: o `never` no default faz o
   TypeScript falhar em tempo de compilação se um novo estado for adicionado à
   união e esquecido aqui. É a garantia que o ternário não dava.
   ========================================================================= */

export interface CanteiroProps {
  estado: EstadoCanteiro;
  /** Rótulo acessível do canteiro (ex.: "Canteiro 3"). */
  identificacao: string;
  /**
   * Chave de destaque do guia da Sarah (`data-guia`). Só o primeiro canteiro
   * recebe hoje, para ela ter onde apontar ao apresentar o Jardim — ver
   * components/guia/BalaoSarah.tsx.
   */
  chaveGuia?: string;

  // --- Estado vazio ---
  /** Espécies já estudadas — a escolha acontece dentro do próprio canteiro. */
  especiesDisponiveis?: PlantaCatalogo[];
  podePlantar?: boolean;
  motivoPlantarBloqueado?: string;
  onPlantar?: (plantaId: string) => void;

  // --- Estado cultivado ---
  podeAdubar?: boolean;
  motivoAdubarBloqueado?: string;
  onAdubar?: () => void;
  onColher?: () => void;
}

export function Canteiro({
  estado,
  identificacao,
  chaveGuia,
  especiesDisponiveis = [],
  podePlantar = false,
  motivoPlantarBloqueado,
  onPlantar,
  podeAdubar = false,
  motivoAdubarBloqueado,
  onAdubar,
  onColher,
}: CanteiroProps) {
  // Sem moldura de card: na cena, o canteiro É a elipse de pedras sobre o
  // campo. A antiga <li> com fundo branco e borda era herança do grid de cards
  // e destruía a ilusão de horta contínua.
  return (
    <li className="relative w-full" aria-label={identificacao} data-guia={chaveGuia}>
      {conteudo()}
    </li>
  );

  function conteudo() {
    switch (estado.tipo) {
      case 'bloqueado':
        return <CanteiroBloqueado nivelNecessario={estado.nivelNecessario} />;

      case 'vazio':
        return (
          <CanteiroVazio
            especiesDisponiveis={especiesDisponiveis}
            podePlantar={podePlantar}
            motivoBloqueio={motivoPlantarBloqueado}
            onPlantar={(plantaId) => onPlantar?.(plantaId)}
          />
        );

      case 'cultivado':
        return (
          <CanteiroCultivado
            planta={estado.planta}
            fase={estado.fase}
            adubado={estado.adubado}
            pronto={estado.pronto}
            msParaProxima={estado.msParaProxima}
            podeAdubar={podeAdubar}
            motivoAdubarBloqueado={motivoAdubarBloqueado}
            onAdubar={() => onAdubar?.()}
            onColher={() => onColher?.()}
          />
        );

      default: {
        // Exaustividade verificada em tempo de compilação.
        const _exaustivo: never = estado;
        return _exaustivo;
      }
    }
  }
}
