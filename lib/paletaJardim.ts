/* ============================================================================
   PALETA DA CENA DO JARDIM

   Cores de ILUSTRAÇÃO, não de interface. Ficam fora do `@theme` de propósito:
   virar utilitário Tailwind as tornaria disponíveis para o resto do app, e
   `bg-grama-base` num botão seria um erro difícil de perceber em revisão.
   Mesma lógica dos acabamentos metálicos das medalhas.

   Centralizar aqui resolve o problema que motivou esta revisão: os hex estavam
   espalhados por três componentes, então reajustar a paleta exigia caçá-los um
   a um.

   PRINCÍPIO DE PROFUNDIDADE (perspectiva atmosférica)
   Quanto mais distante, mais AZUL, mais CLARO e menos SATURADO. Quanto mais
   próximo, mais QUENTE, mais ESCURO e mais saturado. A versão anterior falhava
   nisso: usava a mesma faixa de verde-oliva do fundo à frente, o que achatava
   a cena e produzia o aspecto de camuflagem.
   ========================================================================= */
export const PALETA_JARDIM = {
  // Céu e montanhas saíram em 22/10/2026 (pedido da Sarah): o cenário é um
  // chão verde contínuo, e a profundidade vem só dos tons de verde abaixo.

  /**
   * Linha de árvores. A sugestão original trazia um verde único (#428c5c);
   * aplicá-lo nas duas fileiras colapsaria a profundidade que elas criam, então
   * ele virou a fileira PRÓXIMA e a distante recebeu uma variante mais clara e
   * levemente azulada.
   */
  arvores: {
    distante: '#57a373',
    proxima: '#428c5c',
  },

  /** Gramado — a maior área da tela, e a principal responsável pela vivacidade. */
  grama: {
    fundo: '#7fb87a',
    meio: '#73b06f',
    frente: '#629f5d',
  },

  /** Arbustos espalhados: escurecem em direção ao observador. */
  arbusto: {
    distante: '#5faa62',
    meio: '#4f9a55',
    proximo: '#42874a',
  },

  /** Tufos de capim (traços de textura sobre o gramado). */
  capim: '#4f9a55',

  /** Caminhos de terra batida — terracota quente. */
  caminho: {
    claro: '#d4a373',
    escuro: '#c89f70',
  },

  /** Canteiro disponível: terra fértil escura + pedra limpa. */
  canteiro: {
    soloClaro: '#5d4037',
    soloEscuro: '#3e2723',
    pedraClara: '#b6bdca',
    pedraEscura: '#8b93a3',
  },

  /** Canteiro bloqueado: mesma estrutura, dessaturada e fria. */
  canteiroInerte: {
    soloClaro: '#4e4239',
    soloEscuro: '#322a24',
    pedraClara: '#9aa0a9',
    pedraEscura: '#6f757e',
  },

  /** Verdes da ilustração da planta. Mais profundos que o gramado, para que a
      planta se destaque tanto sobre a terra quanto sobre a grama ao transbordar. */
  planta: {
    folhaEscura: '#3f7a35',
    folhaClara: '#5ca046',
    caule: '#356328',
  },

  /** Terra revolvida da fase 'semente' (montinho sobre o canteiro). */
  terraRevolvida: {
    escura: '#6b4f37',
    clara: '#8a6746',
  },

  /** Miolo amarelo da flor. */
  miolo: '#f2c94c',

  /** Cor da flor/fruto por categoria terapêutica da espécie. */
  flor: {
    Calmante: '#b98fd6',
    Digestiva: '#f0a53a',
    'Anti-inflamatória': '#e05561',
    Respiratória: '#5cc0d6',
    Cicatrizante: '#ec6f95',
    Geral: '#fbfbef',
  },
} as const;
