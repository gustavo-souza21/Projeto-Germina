import {
  Bean, Sprout, Leaf, Network, Shrub, Flower, TreeDeciduous, Award,
  Wheat, ShieldAlert, Flame, Trophy, BookOpen, Users, Target,
  type LucideIcon,
} from 'lucide-react';

/**
 * Mapa nome → componente de ícone.
 *
 * Os dados de níveis e conquistas guardam o ícone como STRING (`icone: 'Sprout'`),
 * porque virão do banco. Este mapa é a ponte para o componente React.
 *
 * Existe também para resolver um bug real: `ConquistasTab` ignorava o campo
 * `icone` e renderizava o emoji de troféu para todas as conquistas — o dado estava lá e não
 * chegava à tela.
 *
 * Importar só o que é usado (em vez de `import * as Lucide`) mantém o
 * tree-shaking funcionando; o pacote inteiro tem mais de 1.500 ícones.
 */
export const ICONES: Record<string, LucideIcon> = {
  // Trilha de evolução (6 níveis: Bean, Sprout, Leaf, Shrub, Flower, TreeDeciduous)
  Bean, Sprout, Leaf, Network, Shrub, Flower, TreeDeciduous, Award,
  // Conquistas
  Wheat, ShieldAlert, Flame, Trophy, BookOpen, Users,
  // Histórico de atividades: missão resgatada (Migration 15)
  Target,
};

/** Resolve o ícone pelo nome, com fallback seguro caso o dado traga um nome desconhecido. */
export function resolverIcone(nome: string): LucideIcon {
  return ICONES[nome] ?? Sprout;
}
