import { UserColecao } from './types';

/**
 * Total de sementes somando todas as espécies estudadas.
 *
 * Desde a Migration 14 não existe mais um contador único de sementes: cada
 * espécie tem as suas (user_colecao.sementes). Onde a tela mostra "Sementes"
 * como um número só, é esta soma.
 */
export function totalSementes(colecao: Pick<UserColecao, 'sementes'>[]): number {
  return colecao.reduce((soma, c) => soma + (c.sementes ?? 0), 0);
}
