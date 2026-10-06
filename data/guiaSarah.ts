/* ============================================================================
   A SARAH — ROTEIRO DO GUIA

   O QUE É ISTO

   A Sarah é a personagem-guia do GERMINA, no mesmo papel que a conselheira
   da vila cumpre no Clash of Clans: ela aparece num canto da tela, diz uma
   frase curta, aponta para o que importa e some. Não é um tutorial que
   bloqueia o app — é alguém que acompanha.

   A personagem é inspirada na pesquisadora real que fez a curadoria das 15
   espécies (Sarah Batista de Freitas, PPGCTS/ICET/UFAM). Isso é deliberado e
   resolve, de brinde, o risco que o documento de proposta levantou sobre
   personagens: ela fala do lugar de quem de fato reuniu aquele acervo, e não
   representa comunidade tradicional nenhuma — o conhecimento ribeirinho
   continua aparecendo nas fichas, com atribuição, sem virar fantasia de jogo.

   POR QUE O ROTEIRO VIVE AQUI, SEPARADO DO COMPONENTE

   Mesmo princípio do catálogo de plantas e da loja: texto é dado, não código.
   Quem for revisar o que a Sarah diz — ela própria, a Leitura Sensível, o
   Comitê Ad Hoc — abre este arquivo e lê de cima a baixo, sem precisar
   entender React. Trocar uma fala não é mexer em componente.

   COMO O USUÁRIO É TRATADO

   "Curador(a)" — decisão de 05/10/2026. Amarra no enredo proposto (Curadoria
   do Horto) e no nível máximo da trilha, que já se chama Curador Botânico: o
   usuário começa sendo chamado pelo título que ainda vai conquistar.

   REGRA DE ESCRITA, para quem for acrescentar falas depois:
   - Uma ideia por balão. Se precisa de vírgula e "além disso", são dois balões.
   - No máximo ~140 caracteres. O balão é pequeno em celular.
   - Nunca prometer mecânica que não existe (o app já teve esse problema:
     texto anunciando "3 adubos" e creditando 1 — ver QA-03).
   - A Sarah não dá conselho de saúde. Ela aponta para a ficha, que tem fonte.
   ========================================================================= */

/** Onde o gatilho dispara. `rota` casa com o início do pathname. */
export type GatilhoGuia =
  | { tipo: 'primeira_visita'; rota: string }
  | { tipo: 'retorno' }
  | { tipo: 'visitante'; rota: string };

export interface FalaGuia {
  /**
   * Identificador estável — é o que vai para o banco quando a fala é vista.
   * NUNCA reaproveitar um id para outra fala: quem já viu a antiga não
   * receberia a nova.
   */
  id: string;
  gatilho: GatilhoGuia;
  /** Os balões, na ordem. Cada string é um balão. */
  baloes: string[];
  /**
   * Elemento a destacar, por `data-guia="<valor>"` no DOM. Opcional — sem
   * isso, a Sarah só fala. Se o elemento não existir na tela, o destaque é
   * simplesmente ignorado e a fala continua funcionando.
   */
  destaque?: string;
  /** Ordem de prioridade quando mais de uma fala casa ao mesmo tempo. */
  prioridade: number;
}

export const FALAS_SARAH: FalaGuia[] = [
  /* ---------------------------------------------------------------------
     RETORNO — a homenagem direta ao Clash. Dispara para quem some por uns
     dias e volta. Vem antes de tudo (prioridade 0) porque é a primeira coisa
     que alguém deve ouvir ao reabrir o app.
     ------------------------------------------------------------------- */
  {
    id: 'retorno-v1',
    gatilho: { tipo: 'retorno' },
    baloes: [
      'Curador(a)? É você mesmo?',
      'Que bom que você voltou! O Jardim estava com saudade.',
    ],
    prioridade: 0,
  },

  /* ---------------------------------------------------------------------
     INÍCIO — primeira vez que o usuário chega na base depois do tutorial.
     ------------------------------------------------------------------- */
  {
    id: 'inicio-v1',
    gatilho: { tipo: 'primeira_visita', rota: '/inicio' },
    baloes: [
      'Esta é a sua base, Curador(a). Daqui você vê seu progresso e o que fazer hoje.',
      'Seu objetivo é um só: curar as 15 espécies do acervo. Uma de cada vez.',
    ],
    prioridade: 10,
  },

  /* ---------------------------------------------------------------------
     JARDIM — o coração do app, e a metáfora central: estudar é cultivar.
     ------------------------------------------------------------------- */
  {
    id: 'jardim-v1',
    gatilho: { tipo: 'primeira_visita', rota: '/jardim' },
    baloes: [
      'O Jardim do Conhecimento! Aqui o que você estuda vira planta de verdade.',
      'Plante uma semente num canteiro e espere ela crescer. Conhecimento também leva tempo.',
      'Quando estiver pronta, colha: rende XP, moedas e mais sementes.',
    ],
    destaque: 'canteiro-1',
    prioridade: 10,
  },

  /* ---------------------------------------------------------------------
     BIBLIOTECA — onde a curadoria aparece. É aqui que a Sarah fala com a
     autoridade de quem montou o acervo, e onde entra o aviso de segurança.
     ------------------------------------------------------------------- */
  {
    id: 'biblioteca-v1',
    gatilho: { tipo: 'primeira_visita', rota: '/biblioteca' },
    baloes: [
      'Estas 15 fichas eu reuni uma a uma, direto do Horto. São a base de tudo aqui.',
      'Cada uma traz nome científico, usos tradicionais, preparo e as contraindicações.',
      'Leia as contraindicações sempre. Planta medicinal não é inofensiva só por ser natural.',
    ],
    prioridade: 10,
  },

  /* ---------------------------------------------------------------------
     DESAFIO DIÁRIO — a razão de voltar todo dia.
     ------------------------------------------------------------------- */
  {
    id: 'desafio-v1',
    gatilho: { tipo: 'primeira_visita', rota: '/desafio-diario' },
    baloes: [
      'Todo dia tem um desafio novo, com perguntas tiradas das próprias fichas.',
      'Quem estuda antes passa fácil. E manter a sequência de dias vale ofensiva.',
    ],
    prioridade: 10,
  },

  /* ---------------------------------------------------------------------
     COMUNIDADE — reaproveita a frase que a própria Sarah escreveu no PROMPT
     original: "onde os frutos se conectam".
     ------------------------------------------------------------------- */
  {
    id: 'comunidade-v1',
    gatilho: { tipo: 'primeira_visita', rota: '/comunidade' },
    baloes: [
      'Aqui é onde os frutos se conectam.',
      'Conte o que descobriu, tire dúvidas e troque sementes com outros curadores.',
    ],
    prioridade: 10,
  },

  /* ---------------------------------------------------------------------
     PERFIL — onde o objetivo do jogo fica visível.
     ------------------------------------------------------------------- */
  {
    id: 'perfil-v1',
    gatilho: { tipo: 'primeira_visita', rota: '/perfil' },
    baloes: [
      'Seu herbário fica aqui: o retrato do que você já curou.',
      'Sete das 15 espécies estão na lista RENISUS, do SUS. Essas são as raras.',
    ],
    prioridade: 10,
  },

  /* ---------------------------------------------------------------------
     VISITANTE — modo sem conta (Fase 4). A Sarah recebe quem está só
     olhando, sem empurrar cadastro na cara: diz o que dá para fazer e o que
     a conta acrescenta.
     ------------------------------------------------------------------- */
  {
    id: 'visitante-biblioteca-v1',
    gatilho: { tipo: 'visitante', rota: '/biblioteca' },
    baloes: [
      'Oi! Eu sou a Sarah, fiz a curadoria destas 15 espécies.',
      'Fique à vontade para ler tudo. Para cultivar e guardar seu progresso, aí sim precisa de conta.',
    ],
    prioridade: 20,
  },
  {
    id: 'visitante-comunidade-v1',
    gatilho: { tipo: 'visitante', rota: '/comunidade' },
    baloes: [
      'Este é o mural dos curadores. Pode ler tudo por aqui.',
      'Para publicar, curtir ou propor troca, é preciso entrar.',
    ],
    prioridade: 20,
  },
];

/**
 * Slides do tutorial de boas-vindas, agora na voz da Sarah.
 *
 * Ficam aqui, e não em `app/(auth)/tutorial/page.tsx`, pelo mesmo motivo do
 * resto deste arquivo: é texto para revisão humana, não lógica de tela.
 */
export interface SlideTutorial {
  /** Nome do ícone lucide, resolvido por `lib/icones.ts`. */
  icone: string;
  titulo: string;
  /** Falas da Sarah neste slide, um balão por string. */
  baloes: string[];
}

export const TUTORIAL_SARAH: SlideTutorial[] = [
  {
    icone: 'Sprout',
    titulo: 'Bem-vindo ao GERMINA',
    baloes: [
      'Oi! Eu sou a Sarah.',
      'Reuni 15 plantas medicinais da Amazônia, uma a uma, direto do Horto — e agora esse acervo é seu também.',
    ],
  },
  {
    icone: 'BookOpen',
    titulo: 'Seu objetivo',
    baloes: [
      'Sua missão, Curador(a), é completar o acervo: estudar cada espécie e cultivá-la no Jardim.',
      'Sete delas estão na lista RENISUS, do SUS. São as raras, e valem o dobro de XP.',
    ],
  },
  {
    icone: 'Trophy',
    titulo: 'Como se cultiva conhecimento',
    baloes: [
      'Estudar rende XP. XP sobe seu nível. Subir de nível abre novos canteiros no Jardim.',
      'E no Jardim, o que você plantou vira semente de novo. É um ciclo — igual lá fora.',
      'Quando fechar as 15, você vira Curador Botânico. Vamos começar?',
    ],
  },
];
