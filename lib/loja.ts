/* ============================================================================
   CATÁLOGO DA LOJA DO CONHECIMENTO  (QA-03)

   O BUG
   O modal anunciava "+3 adubos" e "+5 sementes", e a mensagem de sucesso
   confirmava "Você comprou 3 adubos orgânicos!". O handler creditava **1**. O
   usuário pagava 40 moedas e recebia um terço do prometido.

   A CAUSA
   A quantidade existia em três lugares independentes: o texto do card
   (`retorno`), o texto do toast (`mensagemSucesso`) e o `+ 1` chumbado dentro
   de `handleComprarItem`. Nada os obrigava a concordar — e não concordavam.

   A CORREÇÃO
   `quantidade` passa a ser um dado, e tanto os textos quanto o crédito são
   DERIVADOS dele. Não existe mais como anunciar 3 e creditar 1: seria preciso
   mudar o mesmo número.

   Mesmo princípio já aplicado em `nivel_atual` (QA-02) e na fase do cultivo
   (QA-01): um valor de verdade, o resto derivado.
   ========================================================================= */

/** Recurso do gameState que o item credita. */
export type RecursoLoja = 'adubo' | 'sementes' | 'tema';

export interface ItemLoja {
  id: string;
  nome: string;
  descricao: string;
  /** Preço em moedas. */
  custo: number;
  /** Quantidade creditada na compra. Para 'tema', sempre 1 (é desbloqueio). */
  quantidade: number;
  recurso: RecursoLoja;
  /** Nome no singular e no plural, para os textos derivados. */
  unidade: { singular: string; plural: string };
}

export const ITENS_LOJA: ItemLoja[] = [
  {
    id: 'adubo',
    nome: 'Pacote de Adubo Orgânico',
    descricao: 'Acelera o cultivo nos canteiros da horta.',
    custo: 40,
    quantidade: 3,
    recurso: 'adubo',
    unidade: { singular: 'adubo', plural: 'adubos' },
  },
  {
    id: 'semente',
    nome: 'Pacote de Sementes Nativas',
    descricao: 'Sementes de espécies medicinais da Amazônia.',
    custo: 50,
    quantidade: 5,
    recurso: 'sementes',
    unidade: { singular: 'semente', plural: 'sementes' },
  },
  {
    id: 'tema',
    nome: 'Tema Amazônia Profunda',
    descricao: 'Visual exclusivo inspirado na floresta tropical.',
    custo: 200,
    quantidade: 1,
    recurso: 'tema',
    unidade: { singular: 'tema', plural: 'temas' },
  },
];

export function buscarItemLoja(id: string): ItemLoja | undefined {
  return ITENS_LOJA.find((item) => item.id === id);
}

/** Texto do card: "+3 adubos". Derivado, nunca digitado. */
export function rotuloRetorno(item: ItemLoja): string {
  if (item.recurso === 'tema') return 'Desbloqueio permanente';
  const unidade = item.quantidade === 1 ? item.unidade.singular : item.unidade.plural;
  return `+${item.quantidade} ${unidade}`;
}

/** Texto do toast de sucesso. Derivado da mesma quantidade que é creditada. */
export function mensagemSucesso(item: ItemLoja): string {
  if (item.recurso === 'tema') return `${item.nome} desbloqueado!`;
  const unidade = item.quantidade === 1 ? item.unidade.singular : item.unidade.plural;
  return `Você comprou ${item.quantidade} ${unidade}!`;
}
