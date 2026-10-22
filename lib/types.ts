/**
 * GERMINA - Core TypeScript Interfaces
 * Reflects the Supabase database schema and application state.
 */

export interface Profile {
  id: string;
  nome_completo: string;
  nickname?: string;
  email: string;
  idade?: number;
  endereco?: string;
  telefone: string | null;
  instituicao: string | null;
  criado_em: string;
}

export interface GameState {
  user_id: string;
  xp: number;
  // nivel_atual REMOVIDO — Estado Derivado (QA-02). O nível é sempre
  // calcularNivel(xp).nivel, calculado no momento da leitura, nunca
  // persistido nem trafegado como se fosse dado bruto.
  streak: number; // Dias de ofensiva
  /**
   * Data (YYYY-MM-DD, local) do último Desafio Diário concluído (QA-05).
   * É o dado de verdade da ofensiva — `streak` é recalculado a partir dele.
   * Ausente = usuário nunca concluiu um desafio.
   */
  ultimo_desafio_em?: string;
  sementes: number; // Moeda para plantar no jardim
  adubo: number; // Item para acelerar crescimento
  moedas: number; // Moeda obtida ao estudar e colher
  tema_ativo: string; // 'Padrao', 'Amazonia Profunda', 'Floresta Encantada', 'Rio Negro'
}

export type NivelDificuldade = 'facil' | 'medio' | 'dificil';

/**
 * Eixos temáticos do Desafio Diário.
 * Os 4 eixos abaixo são todos ancorados em um campo nomeado da curadoria oficial
 * (Freitas, 2025) — nenhuma pergunta pode ser escrita sem esse lastro.
 * 'Curiosidade ODS' é o único eixo cuja fonte é o PROMPT do projeto, e não a
 * curadoria; por isso ficou fora do banco principal (ver PERGUNTAS_ODS_COMPLEMENTARES).
 */
export type EixoTematico =
  | 'Indicação Terapêutica'
  | 'Preparo Tradicional'
  | 'Segurança e Contraindicação'
  | 'Identificação Botânica'
  | 'Curiosidade ODS';

/** Campo da ficha de curadoria que sustenta a resposta correta da pergunta. */
export type CampoFonteCuradoria =
  | 'usos_tradicionais'
  | 'preparo'
  | 'contraindicacoes'
  | 'evidencias'
  | 'descricao'
  | 'familia'
  | 'nome_cientifico'
  | 'renisus'
  | 'nota_geral';

export interface AlternativasQuiz {
  A: string;
  B: string;
  C: string;
  D: string;
}

export interface PerguntaQuiz {
  nivel: NivelDificuldade;
  eixo: EixoTematico;
  pergunta: string;
  alternativas: AlternativasQuiz;
  resposta_correta: 'A' | 'B' | 'C' | 'D';
  feedback: string;
  /** Campo da ficha de onde a resposta correta foi extraída. */
  campo_fonte: CampoFonteCuradoria;
  /** Trecho/citação literal da curadoria que sustenta a resposta — usado na validação pelo Comitê Ad Hoc. */
  fonte: string;
}

export interface PlantaComQuiz {
  /** Referencia PLANTAS_CATALOGO[].id — evita pareamento por nome (acentos, grafia). */
  planta_id: string;
  /** Nome popular, idêntico ao do catálogo. Mantido por legibilidade do arquivo. */
  planta: string;
  desafios: PerguntaQuiz[];
}

export interface PlantaCatalogo {
  id: string;
  nome_popular: string;
  nome_cientifico: string; // Base: ficha da curadoria (Sarah B. Freitas, 2025). Grafia e autoridades corrigidas em 22/10/2026 a partir de POWO/IPNI/NYBG, registradas em claude/GERMINA_Especificacao_Sarah_Configuracao_e_Status.md para validação da autora e atualização do PDF fonte
  familia: string;
  familia_fonte: string; // Fonte da classificação taxonômica citada na curadoria, ex: 'Souza e Lorenzi, 2019'
  descricao: string; // Características morfológicas — texto literal (citação entre aspas na curadoria)
  morfologia_fonte: string; // Fonte citada pela curadoria para a descrição morfológica (ex: 'Jardim Botânico USP')
  usos_tradicionais: string[]; // "Uso popular na literatura" da curadoria, dividido por citação/grupo, citações preservadas
  is_renisus: boolean; // 7 plantas raras que rendem XP em dobro
  renisus_texto: string; // Texto literal do campo "RENISUS" da curadoria
  xp_recompensa: number; // Ex: 50 normal, 100 para RENISUS
  habitat: string; // Campo complementar do app (não consta na curadoria) — descrição de onde a planta é cultivada
  preparo: string; // Campo "Dados sobre o uso" da curadoria, texto literal com citações
  evidencias: string; // Campo "Composição fitoquímica" da curadoria, texto literal com citações
  seguranca: string; // Resumo em linguagem simples do app (não é citação literal da curadoria)
  contraindicacoes: string; // Campo "Contra indicações" da curadoria, texto literal — sempre exibido com aviso de automedicação
  imagem_url: string; // Foto principal (capa) — primeira foto de cada ficha da curadoria, extraída do PDF
  imagem_galeria: string[]; // Todas as fotos da ficha, na mesma ordem em que aparecem na curadoria (1 a 3 fotos)
  fotos_fonte: string; // Campo "Fotos — Fonte" da curadoria — vale para todas as fotos da galeria (a curadoria cita uma fonte só por ficha)
  ods_relacionados: number[]; // Ex: [3, 4, 9, 11, 12, 15]
  categoria: 'Digestiva' | 'Calmante' | 'Anti-inflamatória' | 'Respiratória' | 'Cicatrizante' | 'Geral';
}

export interface Atividade {
  id: string;
  user_id: string;
  icone: string; // Nome do ícone lucide
  texto: string;
  xp_ganho: number;
  /** Moedas ganhas (positivo) ou gastas (negativo) neste evento — Migration 14. */
  moedas_delta: number;
  criado_em: string;
}

export interface Colheita {
  id: string;
  user_id: string;
  planta_id: string;
  terreno_id: number;
  xp_ganho: number;
  moedas_ganho: number;
  sementes_ganho: number;
  colhido_em: string;
}

export interface RespostaQuiz {
  id: string;
  user_id: string;
  planta_id: string;
  eixo: EixoTematico;
  correta: boolean;
  respondido_em: string;
}

export interface UserColecao {
  user_id: string;
  planta_id: string;
  status_crescimento: 'semente' | 'broto' | 'muda' | 'flores' | 'colhida';
  desbloqueada_em?: string;
  /** Sementes disponíveis DESTA espécie (Migration 14). A primeira vem de concluir o estudo. */
  sementes: number;
  /** Último dia (America/Manaus) em que a revisão desta espécie rendeu moedas. */
  ultima_revisao_em?: string;
}

export interface DesafioDiario {
  id: string;
  titulo: string;
  descricao: string;
  xp_recompensa: number;
  moedas_recompensa: number;
  expiracao: string; // ISO date string
  concluido: boolean;
  planta_alvo_id?: string;
  tipo?: 'quiz' | 'acao'; // 'quiz' abre o QuizDesafioModal; 'acao' (ou ausente) usa o botão simples de concluir
}

export interface PostComunidade {
  id: string;
  autor_nome: string;
  autor_nivel: string;
  /**
   * `autor_instituicao` foi REMOVIDO daqui na Fase 2 da correção de
   * autenticação/autorização (achados #3 e #4 da auditoria de 09/09/2026).
   *
   * O motivo não é técnico, é de veracidade: `profiles.instituicao` é texto
   * livre, nunca coletado no cadastro e sem nenhuma verificação de domínio ou
   * afiliação — qualquer pessoa podia digitar "UFAM" (ou "Harvard") e o Mural
   * exibia isso ao lado do nome como se fosse credencial acadêmica conferida.
   * A decisão de produto foi tirar o campo da exibição pública em vez de
   * inventar um selo de verificação que o app não tem como sustentar: a
   * instituição continua existindo em `profiles` (perfil privado do próprio
   * usuário + dado de pesquisa da dissertação), só não é mais apresentada a
   * terceiros. Se algum dia houver verificação real por e-mail institucional,
   * este campo volta — junto com o selo que o justifique, nunca sozinho.
   */
  conteudo: string;
  tag: string;
  curtidas: number;
  curtido_pelo_usuario: boolean;
  respostas_count: number;
  criado_em: string;
  imagem?: string;
}

export interface RespostaPost {
  id: string;
  post_id: string;
  autor_nome: string;
  autor_nivel: string;
  conteudo: string;
  criado_em: string;
}

export interface ItemTroca {
  id: string;
  autor_nome: string;
  item_nome: string;
  is_renisus: boolean;
  quantidade_disponivel: string; // ex: "3 disponíveis" ou "Muda única"
  procura: string; // ex: "Sementes de Cumaru"
}

export interface Preferencias {
  lembreteDesafioDiario: boolean;
  alertasMural: boolean;
  solicitacoesTroca: boolean;
  herbarioPublico: boolean;
  disponivelParaTrocas: boolean;
  unidades: 'Métrico (cm)' | 'Imperial (pol)';
}

export interface Conquista {
  id: string;
  titulo: string;
  descricao: string;
  icone: string;
  desbloqueada: boolean;
  progresso: number;
  total: number;
}

/**
 * Fases de cultivo de um canteiro, como persistidas no banco.
 * Extraído da união inline de TerrenoJardim para poder ser referenciado por
 * `Exclude<>` na união discriminada do <Canteiro> (GER-UI-14).
 */
export type FaseCultivo = 'vazio' | 'semente' | 'broto' | 'muda' | 'flor' | 'pronto';

/** Fases em que existe planta no canteiro — 'vazio' é excluído no nível do tipo. */
export type FaseCultivada = Exclude<FaseCultivo, 'vazio'>;

export interface TerrenoJardim {
  id: number;
  /** Presente = canteiro ocupado. Ausente = espaço livre. */
  planta_id?: string;
  nivel_necessario: number;
  /**
   * Momento do plantio, em epoch ms (QA-01).
   *
   * A FASE NÃO É ARMAZENADA — é derivada deste timestamp por `calcularFase()`.
   * Guardar as duas coisas recriaria a classe de bug do QA-02: dois dados que
   * precisam concordar e vários lugares livres para alterar um sem o outro.
   *
   * Timestamp absoluto, não contador regressivo: um contador pausaria quando o
   * usuário minimiza a aba ou fecha o app, e a planta não cresceria enquanto
   * ele não estivesse olhando — exatamente o oposto do que uma horta faz.
   */
  plantado_em?: number;
  /** Tempo adiantado pelo adubo, em ms. Somado ao decorrido. */
  bonus_adubo_ms: number;
  adubado: boolean;
}

/** Missão com o progresso do usuário (RPC listar_missoes, Migration 15). */
export interface Missao {
  missao_id: string;
  ordem: number;
  titulo: string;
  descricao: string;
  meta: number;
  moedas: number;
  /** Já limitado à meta pelo servidor. */
  progresso: number;
  resgatada: boolean;
}
