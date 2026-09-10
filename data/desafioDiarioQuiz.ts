import { PlantaComQuiz, PerguntaQuiz } from '../lib/types';

/**
 * BANCO DE PERGUNTAS DO DESAFIO DIÁRIO — GERMINA
 *
 * Fonte única: curadoria oficial de dissertação de Sarah Batista de Freitas
 * (PPGCTS/ICET/UFAM, Bolsista FAPEAM, Itacoatiara/AM, 2025) — "Curadoria de sp.
 * 15 Espécies para o app".
 *
 * REGRA DO BANCO: nenhuma pergunta pode afirmar algo que não esteja escrito na
 * ficha da espécie. Toda pergunta declara `campo_fonte` (qual campo da ficha
 * sustenta a resposta) e `fonte` (a citação literal correspondente). Se um campo
 * da ficha não tem material suficiente, a pergunta não é escrita — registra-se a
 * lacuna, não se preenche com conhecimento externo.
 *
 * 4 eixos por planta, em dificuldade crescente:
 *   1. Indicação Terapêutica ......... fácil    <- "Uso popular na literatura"
 *   2. Preparo Tradicional ........... médio    <- "Dados sobre o uso"
 *   3. Segurança e Contraindicação ... médio    <- "Contra indicações"
 *   4. Identificação Botânica ........ difícil  <- "Características morfológicas" / Família / Composição
 *
 * O eixo 3 foi criado nesta rodada: 10 das 15 fichas trazem contraindicação
 * explícita e a curadoria abre com a diretriz da ANVISA (2010) sobre uso correto —
 * era o eixo de maior valor pedagógico e não existia no banco anterior.
 *
 * DISTRATORES: sempre que possível, as alternativas erradas são usos/preparos
 * REAIS de OUTRAS espécies do mesmo catálogo. Isso força discriminação entre
 * plantas em vez de eliminação por absurdo, e evita inventar informação falsa
 * sobre plantas medicinais.
 *
 * Total: 60 perguntas (15 plantas x 4 eixos). Pendente de validação pelo Comitê
 * Ad Hoc previsto na metodologia da dissertação.
 */
export const PLANTAS_COM_QUIZ: PlantaComQuiz[] = [
  // =========================================================================
  {
    planta_id: '1',
    planta: 'Amora',
    desafios: [
      {
        nivel: 'facil',
        eixo: 'Indicação Terapêutica',
        pergunta:
          'Entre os usos populares registrados na literatura para a Amora (Morus nigra L.), qual está relacionado a uma fase da vida da mulher?',
        alternativas: {
          A: 'Auxílio nos sintomas da menopausa',
          B: 'Tratamento de ovários policísticos',
          C: 'Combate a inflamações uterinas e hemorragias',
          D: 'Estímulo da produção de leite na amamentação',
        },
        resposta_correta: 'A',
        feedback:
          'A curadoria registra o uso da Amora para menopausa (Da Silva, 2025). As opções B e C também são usos reais, mas de outras espécies do catálogo: ovários policísticos aparece na ficha da Cidreira e inflamações uterinas na do Crajiru.',
        campo_fonte: 'usos_tradicionais',
        fonte: 'Uso popular na literatura: "menopausa (Da Silva, 2025)".',
      },
      {
        nivel: 'medio',
        eixo: 'Preparo Tradicional',
        pergunta:
          'Segundo os dados sobre o uso da Amora, qual é a quantidade diária registrada para o chá da folha?',
        alternativas: {
          A: '1 xícara ao dia',
          B: '2 xícaras ao dia',
          C: 'Até 3 vezes ao dia',
          D: 'Sem limite estabelecido',
        },
        resposta_correta: 'A',
        feedback:
          'A ficha registra "o chá da folha, 1 xícara ao dia (Amador e Lucas, 2025)". A folha também aparece em decocção para anemia e emagrecimento (Oliveira et al., 2025).',
        campo_fonte: 'preparo',
        fonte: 'Dados sobre o uso: "o chá da folha, 1 xícara ao dia (Amador e Lucas, 2025)".',
      },
      {
        nivel: 'medio',
        eixo: 'Segurança e Contraindicação',
        pergunta:
          'O campo de contraindicações da ficha da Amora traz a palavra "Nenhuma". Qual é a leitura correta dessa informação?',
        alternativas: {
          A: 'Que a planta pode ser consumida em qualquer quantidade, sem risco',
          B: 'Que a literatura consultada não relatou contraindicações, o que não dispensa uso responsável',
          C: 'Que a planta foi aprovada como medicamento isento de prescrição',
          D: 'Que crianças e gestantes podem usá-la livremente e sem orientação',
        },
        resposta_correta: 'B',
        feedback:
          'Ausência de contraindicação relatada não é o mesmo que comprovação de segurança. A própria curadoria abre com a diretriz da ANVISA: as plantas medicinais devem ser usadas garantindo os efeitos benéficos e evitando que o uso incorreto cause efeitos indesejáveis e toxicidade (ANVISA, 2010).',
        campo_fonte: 'contraindicacoes',
        fonte:
          'Contra indicações: "Nenhuma (Veras, 2025)" + nota de abertura da curadoria (ANVISA, 2010).',
      },
      {
        nivel: 'dificil',
        eixo: 'Identificação Botânica',
        pergunta: 'A que família botânica pertence a Amora (Morus nigra L.)?',
        alternativas: {
          A: 'Myrtaceae',
          B: 'Lauraceae',
          C: 'Moraceae',
          D: 'Lamiaceae',
        },
        resposta_correta: 'C',
        feedback:
          'Moraceae (Souza e Lorenzi, 2019). Myrtaceae é a família da Goiaba, Lauraceae a do Abacate e Lamiaceae a do Boldo, Hortelã pimenta, Boldinho japonês e Malvarisco.',
        campo_fonte: 'familia',
        fonte: 'Família: "Moraceae (Souza e Lorenzi, 2019)".',
      },
    ],
  },
  // =========================================================================
  {
    planta_id: '2',
    planta: 'Goiaba',
    desafios: [
      {
        nivel: 'facil',
        eixo: 'Indicação Terapêutica',
        pergunta:
          'Qual é o uso popular da Goiaba (Psidium guajava L.) mais citado na literatura reunida pela curadoria?',
        alternativas: {
          A: 'Efeito calmante e auxílio no sono',
          B: 'Ação antidiarreica',
          C: 'Tratamento de pedra nos rins',
          D: 'Fortalecimento dos cabelos',
        },
        resposta_correta: 'B',
        feedback:
          'A ação antidiarreica é o uso com mais citações na ficha (Martínez et al., 2021; Almeida et al., 2023; Yusuf et al., 2021; Oliveira et al., 2024). Calmante é uso da Cidreira e do Capim santo; pedra nos rins, do Pobre-velho; fortalecer cabelos, do Capim santo.',
        campo_fonte: 'usos_tradicionais',
        fonte:
          'Uso popular na literatura: "Antidiarreica (Martínez et al., 2021; Almeida et al., 2023; Yusuf et al., 2021; Oliveira et al., 2024)".',
      },
      {
        nivel: 'medio',
        eixo: 'Preparo Tradicional',
        pergunta:
          'De acordo com os dados sobre o uso, de que formas as folhas da goiabeira são preparadas?',
        alternativas: {
          A: 'Somente em tintura alcoólica',
          B: 'Apenas por inalação do vapor',
          C: 'Em infusões, decocções e extratos aquosos',
          D: 'Apenas em compressa das flores',
        },
        resposta_correta: 'C',
        feedback:
          'A ficha registra que as folhas são usadas em infusões, decocções e extratos aquosos (Yusuf et al., 2021), além do chá da folha (Santana et al., 2025) e de decocção e banho (Oliveira et al., 2025).',
        campo_fonte: 'preparo',
        fonte:
          'Dados sobre o uso: "As folhas são usadas em infusões, decocções e extratos aquosos (Yusuf et al., 2021)".',
      },
      {
        nivel: 'medio',
        eixo: 'Segurança e Contraindicação',
        pergunta:
          'A ficha da Goiaba não registra contraindicações. Qual orientação da ANVISA, citada na abertura da curadoria, continua valendo mesmo nesses casos?',
        alternativas: {
          A: 'Que plantas sem contraindicação registrada dispensam qualquer cuidado',
          B: 'Que apenas as plantas da lista RENISUS exigem uso cuidadoso',
          C: 'Que o uso deve garantir os efeitos benéficos e evitar que o uso incorreto cause efeitos indesejáveis e toxicidade',
          D: 'Que toda planta medicinal exige prescrição médica obrigatória',
        },
        resposta_correta: 'C',
        feedback:
          'A curadoria abre justamente com essa diretriz (ANVISA, 2010): ela vale para todas as espécies, inclusive as que não têm contraindicação relatada na literatura consultada.',
        campo_fonte: 'nota_geral',
        fonte:
          'Nota de abertura da curadoria: "As plantas medicinais devem ser utilizadas, garantindo os efeitos benéficos e evitando que o uso incorreto possa causar efeitos indesejáveis e toxicidade (ANVISA, 2010)".',
      },
      {
        nivel: 'dificil',
        eixo: 'Identificação Botânica',
        pergunta:
          'Segundo a descrição morfológica da goiabeira, as flores brancas medem cerca de quanto de diâmetro?',
        alternativas: {
          A: '25 mm',
          B: '5 mm',
          C: '50 mm',
          D: '10 cm',
        },
        resposta_correta: 'A',
        feedback:
          'As flores brancas medem cerca de 25 mm de diâmetro e aparecem isoladas ou em grupos de 2 a 3 nas axilas das folhas. Os 10 cm da alternativa D correspondem ao diâmetro do fruto, não da flor.',
        campo_fonte: 'descricao',
        fonte:
          'Características morfológicas: "flores brancas, medindo cerca de 25mm de diâmetro" (Fitoterapia Brasil).',
      },
    ],
  },
  // =========================================================================
  {
    planta_id: '3',
    planta: 'Abacate',
    desafios: [
      {
        nivel: 'facil',
        eixo: 'Indicação Terapêutica',
        pergunta:
          'Quais condições metabólicas aparecem entre os usos populares registrados para o Abacate (Persea americana Mill.)?',
        alternativas: {
          A: 'Anemia e emagrecimento',
          B: 'Colesterol e diabetes',
          C: 'Hipertireoidismo e ansiedade',
          D: 'Leucemia e icterícia',
        },
        resposta_correta: 'B',
        feedback:
          'A ficha registra colesterol e diabetes (Oliveira et al., 2025). Anemia e emagrecimento são usos da Amora; hipertireoidismo e ansiedade, da Cidreira; leucemia e icterícia, do Crajiru.',
        campo_fonte: 'usos_tradicionais',
        fonte: 'Uso popular na literatura: "colesterol e diabetes (Oliveira et al., 2025)".',
      },
      {
        nivel: 'medio',
        eixo: 'Preparo Tradicional',
        pergunta:
          'A curadoria descreve um preparo do abacateiro que não usa a folha. Qual é ele?',
        alternativas: {
          A: 'Macerar a semente em álcool por sete dias',
          B: 'Raspar a casca e deixar no fogo para retirada do óleo',
          C: 'Torrar a folha até virar pó e dissolver em suco',
          D: 'Ferver a raiz por 40 minutos e inalar o vapor',
        },
        resposta_correta: 'B',
        feedback:
          'A ficha registra: "como remédio se raspa a casca deixa no fogo para retirada do óleo (Bastos et al., 2025)". O caroço também aparece, em chá e suco, 2 xícaras/copos ao dia (Veras, 2025).',
        campo_fonte: 'preparo',
        fonte:
          'Dados sobre o uso: "como remédio se raspa a casca deixa no fogo para retirada do óleo (Bastos et al., 2025)".',
      },
      {
        nivel: 'medio',
        eixo: 'Segurança e Contraindicação',
        pergunta:
          'Qual efeito indesejado a curadoria associa ao consumo excessivo do Abacate?',
        alternativas: {
          A: 'Queda de pressão e dor no estômago',
          B: 'Efeito abortivo em gestantes',
          C: 'Prisão de ventre e indigestão',
          D: 'Danos hepáticos severos',
        },
        resposta_correta: 'C',
        feedback:
          'Se ingerido em excesso, pode causar prisão de ventre e indigestão (Veras, 2025). Queda de pressão é o alerta da Cidreira; efeito abortivo, do Boldo e do Malvarisco.',
        campo_fonte: 'contraindicacoes',
        fonte:
          'Contra indicações: "Se ingerido em excesso, pode causar prisão de ventre e indigestão (Veras, 2025)".',
      },
      {
        nivel: 'dificil',
        eixo: 'Identificação Botânica',
        pergunta: 'Como as flores do abacateiro são descritas na curadoria?',
        alternativas: {
          A: 'Pequenas, bissexuais e verde-amareladas',
          B: 'Grandes, campanuladas e violáceas',
          C: 'Amarelas, em espiga terminal protegida por brácteas cor de carmim',
          D: 'Azuis-arroxeadas, em inflorescências capituliformes',
        },
        resposta_correta: 'A',
        feedback:
          'As flores são pequenas, bissexuais e verde-amareladas (Cavalcante, 1991). As demais descrições pertencem, respectivamente, ao Crajiru, ao Pobre-velho e à Cidreira.',
        campo_fonte: 'descricao',
        fonte:
          'Características morfológicas: "flores são pequenas, bissexuais, verde-amareladas" (Cavalcante, 1991).',
      },
    ],
  },
  // =========================================================================
  {
    planta_id: '4',
    planta: 'Boldo',
    desafios: [
      {
        nivel: 'facil',
        eixo: 'Indicação Terapêutica',
        pergunta:
          'O Boldo (Plectranthus barbatus Andrew) é registrado na curadoria principalmente para qual grupo de queixas?',
        alternativas: {
          A: 'Cicatrização de feridas e queimaduras',
          B: 'Má digestão e dores estomacais',
          C: 'Pedra nos rins e infecção urinária',
          D: 'Anemia e fraqueza',
        },
        resposta_correta: 'B',
        feedback:
          'A ficha lista má digestão, dor de barriga, prisão de ventre, dores estomacais, diarreia e cólica (Veras, 2025), além de distúrbios digestivos (Silva, 2025). Cicatrização é uso da Terramicina; pedra nos rins, do Pobre-velho.',
        campo_fonte: 'usos_tradicionais',
        fonte:
          'Uso popular na literatura: "má digestão, infecção no intestino e fígado, ... dor de barriga, prisão de ventre, dores estomacais, diarreia, cólica, gripe e calmante (Veras, 2025)".',
      },
      {
        nivel: 'medio',
        eixo: 'Preparo Tradicional',
        pergunta:
          'Segundo os dados sobre o uso do Boldo, qual é a quantidade diária registrada para o chá e o suco da folha?',
        alternativas: {
          A: '1 xícara ao dia',
          B: '2 xícaras/copos ao dia',
          C: 'Até 3 vezes ao dia',
          D: '4 xícaras ao dia',
        },
        resposta_correta: 'B',
        feedback:
          'A ficha registra "sua folha usada como chá e suco, 2 xícaras/copos ao dia (Veras, 2025)"; também aparecem decocções e infusões para mitigar inflamações (Warycha et al., 2022).',
        campo_fonte: 'preparo',
        fonte:
          'Dados sobre o uso: "Sua folha usada como chá e suco, 2 xícaras/copos ao dia (Veras, 2025)".',
      },
      {
        nivel: 'medio',
        eixo: 'Segurança e Contraindicação',
        pergunta: 'Qual é o alerta mais grave que a curadoria registra sobre o Boldo?',
        alternativas: {
          A: 'Pode causar queda de pressão arterial',
          B: 'Pode provocar litíase urinária',
          C: 'Pode ter efeito abortivo',
          D: 'Não há alerta registrado para esta espécie',
        },
        resposta_correta: 'C',
        feedback:
          'A ficha é explícita: abortivo, podendo trazer problemas de saúde se ingerido em excesso por gestantes, lactantes e crianças (Veras, 2025).',
        campo_fonte: 'contraindicacoes',
        fonte:
          'Contra indicações: "Abortivo e pode trazer problemas de saúde, se ingerido em excesso por gestantes, lactantes e crianças (Veras, 2025)".',
      },
      {
        nivel: 'dificil',
        eixo: 'Identificação Botânica',
        pergunta:
          'De acordo com a descrição morfológica, como são as flores do Boldo e em que estrutura se organizam?',
        alternativas: {
          A: 'Brancas, em panícula aberta no ápice dos ramos',
          B: 'Pequenas e azuladas, em racemos (espigas)',
          C: 'Róseas ou violáceas, em panículas terminais',
          D: 'Amarelas, em espiga terminal de 6 a 10 cm',
        },
        resposta_correta: 'B',
        feedback:
          'Flores pequenas e azuladas em racemos, ou espigas (Jardim Botânico USP). As outras alternativas descrevem a Terramicina, o Crajiru e o Pobre-velho.',
        campo_fonte: 'descricao',
        fonte:
          'Características morfológicas: "flores pequenas e azuladas se dão em racemos (espigas)" (Jardim Botânico USP).',
      },
    ],
  },
  // =========================================================================
  {
    planta_id: '5',
    planta: 'Corama',
    desafios: [
      {
        nivel: 'facil',
        eixo: 'Indicação Terapêutica',
        pergunta:
          'Quais queixas gástricas aparecem entre os usos populares registrados para a Corama (Kalanchoe pinnata Lam.)?',
        alternativas: {
          A: 'Gastrite e úlceras gástricas',
          B: 'Gonorreia e nefrites',
          C: 'Insônia e nervosismo',
          D: 'Bronquite e asma',
        },
        resposta_correta: 'A',
        feedback:
          'A ficha registra gastrite (De Campos e Oliveira, 2025) e úlceras gástricas (Sousa et al., 2023), além de dor de estômago e indigestão (Oliveira et al., 2025). Gonorreia e nefrites são usos do Pobre-velho; bronquite e asma, do Cumaru.',
        campo_fonte: 'usos_tradicionais',
        fonte:
          'Uso popular na literatura: "Gastrite (De Campos e Oliveira, 2025); úlceras gástricas (Sousa et al., 2023)".',
      },
      {
        nivel: 'medio',
        eixo: 'Preparo Tradicional',
        pergunta:
          'Além do chá, que outra forma de uso da folha de Corama a curadoria registra — e por qual via?',
        alternativas: {
          A: 'Banho das folhas, por via cutânea',
          B: 'Compressa da folha, por via cutânea',
          C: 'Inalação do vapor, por via respiratória',
          D: 'Tintura da folha, por via oral',
        },
        resposta_correta: 'B',
        feedback:
          'A ficha registra "o chá e compressa da folha por via oral, cutânea (Amador e Lucas, 2025)", com o chá em 2 xícaras ao dia (Veras, 2025). Banho das folhas é preparo registrado para o Capim santo e para a Goiaba.',
        campo_fonte: 'preparo',
        fonte:
          'Dados sobre o uso: "o chá e compressa da folha por via oral, cutânea (Amador e Lucas, 2025)".',
      },
      {
        nivel: 'medio',
        eixo: 'Segurança e Contraindicação',
        pergunta:
          'A ficha da Corama registra "Nenhuma" em contraindicações. Qual conduta é a mais adequada diante desse dado?',
        alternativas: {
          A: 'Considerar o uso liberado para gestantes, lactantes e crianças',
          B: 'Assumir que a planta é comprovadamente segura em qualquer dose',
          C: 'Entender que a literatura consultada não relatou contraindicação e manter uso responsável',
          D: 'Concluir que a planta não tem princípios ativos relevantes',
        },
        resposta_correta: 'C',
        feedback:
          'A ausência de relato na literatura consultada não é prova de inocuidade. A própria ficha lista compostos ativos como alcaloides, saponinas, taninos e antraquinonas (Huachhuaco et al., 2024) — motivo a mais para uso responsável.',
        campo_fonte: 'contraindicacoes',
        fonte:
          'Contra indicações: "Nenhuma (Veras, 2025)" + Composição fitoquímica (Huachhuaco et al., 2024).',
      },
      {
        nivel: 'dificil',
        eixo: 'Identificação Botânica',
        pergunta:
          'Qual característica das folhas identifica a Corama na descrição morfológica da curadoria?',
        alternativas: {
          A: 'Folhas opostas, suculentas, ovaladas e de margem crenada',
          B: 'Folhas espiraladas, invaginantes e paralelinérveas',
          C: 'Folhas compostas, bi ou trifolioladas',
          D: 'Folhas verde-grisáceo, longas, lineares e estreitas',
        },
        resposta_correta: 'A',
        feedback:
          'Folhas opostas, suculentas, ovaladas e de margem crenada, com 10 a 20 cm (Lorenzi e Matos, 2008). As demais descrevem o Pobre-velho, o Crajiru e o Capim santo.',
        campo_fonte: 'descricao',
        fonte:
          'Características morfológicas: "folhas opostas, suculentas, ovaladas e de margem crenada com 10 a 20cm de comprimento" (Lorenzi e Matos, 2008).',
      },
    ],
  },
  // =========================================================================
  {
    planta_id: '6',
    planta: 'Crajiru',
    desafios: [
      {
        nivel: 'facil',
        eixo: 'Indicação Terapêutica',
        pergunta:
          'Qual uso do Crajiru (Fidericia chica) é sustentado pelo maior número de fontes na curadoria, incluindo a mais antiga delas (Côrrea, 1926)?',
        alternativas: {
          A: 'Tratamento de anemia',
          B: 'Alívio da insônia',
          C: 'Controle da diabetes',
          D: 'Ação descongestionante nasal',
        },
        resposta_correta: 'A',
        feedback:
          'Anemia aparece em três fontes: Amador e Lucas (2025), Ferreira et al. (2013) e Côrrea (1926). A ficha também registra ação anti-inflamatória, cicatrizante e antimicrobiana.',
        campo_fonte: 'usos_tradicionais',
        fonte:
          'Uso popular na literatura: "Anemia (Amador e Lucas, 2025; Ferreira et al., 2013; Côrrea, 1926)".',
      },
      {
        nivel: 'medio',
        eixo: 'Preparo Tradicional',
        pergunta:
          'Qual é a única forma de uso do Crajiru registrada no campo "Dados sobre o uso" da curadoria?',
        alternativas: {
          A: 'Banho das folhas, por via cutânea',
          B: 'Compressa da folha sobre a pele',
          C: 'Chá das folhas, por via oral',
          D: 'Maceração das folhas em álcool',
        },
        resposta_correta: 'C',
        feedback:
          'A ficha registra apenas "Chá das folhas, uso oral (Amador e Lucas, 2025)". Atenção: embora o Crajiru tenha usos cicatrizantes e para lavagem de feridas citados na literatura, a curadoria não descreve preparo de uso externo para esta espécie.',
        campo_fonte: 'preparo',
        fonte: 'Dados sobre o uso: "Chá das folhas, uso oral (Amador e Lucas, 2025)".',
      },
      {
        nivel: 'medio',
        eixo: 'Segurança e Contraindicação',
        pergunta:
          'Por qual motivo a curadoria contraindica o Crajiru para gestantes, lactantes e crianças?',
        alternativas: {
          A: 'Por comprovação de efeito abortivo',
          B: 'Por falta de estudos',
          C: 'Pelo alto teor de mentol',
          D: 'Por risco de queda de pressão arterial',
        },
        resposta_correta: 'B',
        feedback:
          'A contraindicação é por falta de estudos — não por dano comprovado. É a mesma justificativa usada para o Pobre-velho. O teor de mentol é o motivo no Boldinho japonês; o efeito abortivo, no Boldo e no Malvarisco.',
        campo_fonte: 'contraindicacoes',
        fonte:
          'Contra indicações: "Contra indicado o uso por gestantes, lactantes e crianças, por falta de estudos".',
      },
      {
        nivel: 'dificil',
        eixo: 'Identificação Botânica',
        pergunta: 'Qual é o hábito de crescimento do Crajiru descrito na curadoria?',
        alternativas: {
          A: 'Erva de hastes cilíndricas e duras, até 80 cm',
          B: 'Planta herbácea estolonífera de caule quadrangular',
          C: 'Árvore frutífera perene de até 10 m',
          D: 'Planta arbustiva trepadeira, com ramos escandentes',
        },
        resposta_correta: 'D',
        feedback:
          'Planta arbustiva trepadeira com ramos escandentes, folhas bi ou trifolioladas e frutos em cápsulas deiscentes (Ferreira et al., 2005). As outras descrevem o Pobre-velho, o Boldinho japonês e a Goiaba.',
        campo_fonte: 'descricao',
        fonte:
          'Características morfológicas: "Planta arbustiva trepadeira, com ramos escandentes" (Ferreira et al., 2005).',
      },
    ],
  },
  // =========================================================================
  {
    planta_id: '7',
    planta: 'Pobre-velho',
    desafios: [
      {
        nivel: 'facil',
        eixo: 'Indicação Terapêutica',
        pergunta:
          'Os usos populares do Pobre-velho (Costus spicatus Jaqc.) se concentram em qual sistema do corpo?',
        alternativas: {
          A: 'Sistema respiratório',
          B: 'Sistema urinário e renal',
          C: 'Sistema nervoso central',
          D: 'Sistema tegumentar (pele)',
        },
        resposta_correta: 'B',
        feedback:
          'A ficha registra pedra nos rins, infecção urinária, dor de urina, nefrites, ação diurética, ureolítica e para disfunção renal, além de bexiga (Côrrea, 1926).',
        campo_fonte: 'usos_tradicionais',
        fonte:
          'Uso popular na literatura: "Pedra nos rins (Oliveira et al., 2025; Amador e Lucas, 2025); infecção urinária, dor de urina (Amador e Lucas, 2025)".',
      },
      {
        nivel: 'medio',
        eixo: 'Preparo Tradicional',
        pergunta:
          'Segundo os dados sobre o uso, qual preparo das folhas do Pobre-velho é indicado para pedra nos rins?',
        alternativas: {
          A: 'Infusão',
          B: 'Compressa cutânea',
          C: 'Banho',
          D: 'Tintura',
        },
        resposta_correta: 'A',
        feedback:
          'A ficha registra "folhas usadas em infusão para pedra nos rins (Oliveira et al., 2025)", além do chá das folhas por via oral (Amador e Lucas, 2025).',
        campo_fonte: 'preparo',
        fonte:
          'Dados sobre o uso: "Folhas usadas em infusão para pedra nos rins (Oliveira et al., 2025)".',
      },
      {
        nivel: 'medio',
        eixo: 'Segurança e Contraindicação',
        pergunta: 'Qual grupo NÃO deve usar o Pobre-velho, segundo a curadoria?',
        alternativas: {
          A: 'Apenas pessoas com hipertensão',
          B: 'Apenas menores de 18 anos',
          C: 'Gestantes, lactantes e crianças',
          D: 'Nenhum grupo é contraindicado',
        },
        resposta_correta: 'C',
        feedback:
          'Contraindicado para gestantes, lactantes e crianças, por falta de estudos. A restrição a menores de 18 anos é específica do Capim santo.',
        campo_fonte: 'contraindicacoes',
        fonte:
          'Contra indicações: "Contra indicado o uso por gestantes, lactantes e crianças, por falta de estudos".',
      },
      {
        nivel: 'dificil',
        eixo: 'Identificação Botânica',
        pergunta:
          'Que estrutura protege a espiga terminal de flores amarelas do Pobre-velho?',
        alternativas: {
          A: 'Brácteas escamosas cor de carmim',
          B: 'Cápsulas deiscentes',
          C: 'Um cálice coriáceo ferrugíneo',
          D: 'Uma bainha pilosa esbranquiçada',
        },
        resposta_correta: 'A',
        feedback:
          'Flores amarelas em espiga terminal de 6 a 10 cm, protegida por brácteas escamosas cor de carmim (Côrrea, 1926). O cálice coriáceo ferrugíneo é do Cumaru; as cápsulas deiscentes, do Crajiru.',
        campo_fonte: 'descricao',
        fonte:
          'Características morfológicas: "flores amarelas dispostas em espiga terminal de 6-10 cm, protegida por brácteas escamosas cor de carmim" (Côrrea, 1926).',
      },
    ],
  },
  // =========================================================================
  {
    planta_id: '8',
    planta: 'Terramicina',
    desafios: [
      {
        nivel: 'facil',
        eixo: 'Indicação Terapêutica',
        pergunta:
          'Qual é o uso da Terramicina (Alternanthera brasiliana L.) com maior número de fontes na curadoria?',
        alternativas: {
          A: 'Ação anti-inflamatória',
          B: 'Ação calmante',
          C: 'Tratamento de anemia',
          D: 'Controle do colesterol',
        },
        resposta_correta: 'A',
        feedback:
          'Inflamação/anti-inflamatório aparece em quatro fontes (Oliveira et al., 2025; Amador e Lucas, 2025; Pereira, 2023; Freitas, 2025). A ficha ainda registra ação cicatrizante, analgésica e efeitos antifúngicos e antigripais.',
        campo_fonte: 'usos_tradicionais',
        fonte:
          'Uso popular na literatura: "Inflamação (anti-inflamatório) (Oliveira et al., 2025; Amador e Lucas, 2025; Pereira, 2023; Freitas, 2025)".',
      },
      {
        nivel: 'medio',
        eixo: 'Preparo Tradicional',
        pergunta:
          'Segundo a curadoria, qual preparo da Terramicina é usado para cicatrização e queimaduras?',
        alternativas: {
          A: 'O chá das folhas',
          B: 'O sumo da planta',
          C: 'A decocção da raiz',
          D: 'O óleo extraído da casca',
        },
        resposta_correta: 'B',
        feedback:
          'A ficha distingue as duas formas: o chá é usado para inflamações em geral e o sumo, para cicatrização e queimaduras (Freitas, 2025).',
        campo_fonte: 'preparo',
        fonte:
          'Dados sobre o uso: "Chá usado para inflamações em geral, sumo usado para cicatrização, para queimaduras (Freitas, 2025)".',
      },
      {
        nivel: 'medio',
        eixo: 'Segurança e Contraindicação',
        pergunta:
          'A contraindicação da Terramicina para gestantes, lactantes e crianças tem uma ressalva. Qual é ela?',
        alternativas: {
          A: 'Vale apenas para o uso do sumo, não do chá',
          B: 'Vale apenas para menores de 6 anos',
          C: 'Não se aplica sob supervisão médica',
          D: 'Vale apenas em doses acima de 3 xícaras diárias',
        },
        resposta_correta: 'C',
        feedback:
          'A ficha registra a contraindicação "exceto sob supervisão médica" (Freitas, 2025) — é a única das 15 espécies com essa ressalva explícita.',
        campo_fonte: 'contraindicacoes',
        fonte:
          'Contra indicações: "Contra indicado o uso por gestantes, lactantes e crianças, exceto sob supervisão médica (Freitas, 2025)".',
      },
      {
        nivel: 'dificil',
        eixo: 'Identificação Botânica',
        pergunta:
          'A coloração das folhas da Terramicina, segundo a descrição morfológica, pode variar entre quais tons?',
        alternativas: {
          A: 'Apenas tons de verde-acinzentado',
          B: 'De verde, em várias tonalidades, até vermelho e púrpura',
          C: 'De verde escuro a roxo-purpúreo, apenas no caule',
          D: 'De branco a vermelho, conforme a maturação',
        },
        resposta_correta: 'B',
        feedback:
          'A folha pode ser verde em várias tonalidades até cores mais fortes como vermelho e púrpura (Fitoterapia Brasil). A alternativa C descreve o caule da Hortelã pimenta.',
        campo_fonte: 'descricao',
        fonte:
          'Características morfológicas: "a coloração pode ser verde, em várias tonalidades, até cores mais fortes como vermelho e púrpura" (Fitoterapia Brasil).',
      },
    ],
  },
  // =========================================================================
  {
    planta_id: '9',
    planta: 'Cidreira',
    desafios: [
      {
        nivel: 'facil',
        eixo: 'Indicação Terapêutica',
        pergunta: 'Qual é o uso popular mais destacado da Cidreira (Lippia alba) na curadoria?',
        alternativas: {
          A: 'Efeito calmante',
          B: 'Ação cicatrizante',
          C: 'Efeito antidiarreico',
          D: 'Ação diurética',
        },
        resposta_correta: 'A',
        feedback:
          'A ficha abre com "Calmante (Veras, 2025; Amador e Lucas, 2025)" e registra ainda insônia, ansiedade e nervosismo.',
        campo_fonte: 'usos_tradicionais',
        fonte: 'Uso popular na literatura: "Calmante (Veras, 2025; Amador e Lucas, 2025)".',
      },
      {
        nivel: 'medio',
        eixo: 'Preparo Tradicional',
        pergunta:
          'Quais formas de preparo das folhas da Cidreira estão registradas na curadoria?',
        alternativas: {
          A: 'Chá por via oral e infusão das folhas',
          B: 'Banho e compressa cutânea',
          C: 'Tintura e inalante',
          D: 'Decocção da raiz e maceração',
        },
        resposta_correta: 'A',
        feedback:
          'A ficha registra chá das folhas por via oral (Amador e Lucas, 2025) e infusão das folhas (Oliveira et al., 2025). Tintura e inalante são preparos do Boldinho japonês.',
        campo_fonte: 'preparo',
        fonte:
          'Dados sobre o uso: "Chá das folhas por via oral (Amador e Lucas, 2025); infusão das folhas (Oliveira et al., 2025)".',
      },
      {
        nivel: 'medio',
        eixo: 'Segurança e Contraindicação',
        pergunta:
          'Que efeitos o consumo excessivo de Cidreira pode causar, segundo a curadoria?',
        alternativas: {
          A: 'Prisão de ventre e indigestão',
          B: 'Queda de pressão e dor no estômago',
          C: 'Náusea e sonolência intensa',
          D: 'Danos hepáticos e litíase urinária',
        },
        resposta_correta: 'B',
        feedback:
          'A ficha alerta: "Se ingerir em excesso, pode ter queda de pressão e dor no estômago (Veras, 2025)" — coerente com o uso registrado de regular a pressão arterial. Prisão de ventre é o alerta do Abacate.',
        campo_fonte: 'contraindicacoes',
        fonte:
          'Contra indicações: "Se ingerir em excesso, pode ter queda de pressão e dor no estômago (Veras, 2025)".',
      },
      {
        nivel: 'dificil',
        eixo: 'Identificação Botânica',
        pergunta: 'A que família botânica pertence a Cidreira (Lippia alba)?',
        alternativas: {
          A: 'Lamiaceae',
          B: 'Amaranthaceae',
          C: 'Verbenaceae',
          D: 'Poaceae',
        },
        resposta_correta: 'C',
        feedback:
          'Verbenaceae (Souza e Lorenzi, 2019) — atenção, é uma confusão comum: a "erva-cidreira" da família Lamiaceae é outra espécie. Amaranthaceae é a família da Terramicina e da Cuia-mansa; Poaceae, a do Capim santo.',
        campo_fonte: 'familia',
        fonte: 'Família: "Verbenaceae (Souza e Lorenzi, 2019)".',
      },
    ],
  },
  // =========================================================================
  {
    planta_id: '10',
    planta: 'Hortelã pimenta',
    desafios: [
      {
        nivel: 'facil',
        eixo: 'Indicação Terapêutica',
        pergunta:
          'Quais usos populares a curadoria registra para a Hortelã pimenta (Mentha x piperita L.)?',
        alternativas: {
          A: 'Gripe, problemas respiratórios e diarreia',
          B: 'Anemia e cicatrização de feridas',
          C: 'Pedra nos rins e infecção urinária',
          D: 'Gastrite e úlceras gástricas',
        },
        resposta_correta: 'A',
        feedback:
          'A ficha registra gripe e problemas respiratórios (Amador e Lucas, 2025) e diarreia e gripe (Oliveira et al., 2025) — é uma das fichas com menos usos listados no catálogo.',
        campo_fonte: 'usos_tradicionais',
        fonte:
          'Uso popular na literatura: "Gripe, problemas respiratórios (Amador e Lucas, 2025); diarreia, gripe (Oliveira et al., 2025)".',
      },
      {
        nivel: 'medio',
        eixo: 'Preparo Tradicional',
        pergunta:
          'Segundo a curadoria, de quais três maneiras a folha da Hortelã pimenta pode ser utilizada?',
        alternativas: {
          A: 'Banho, compressa e inalação',
          B: 'Decocção, infusão ou maceração',
          C: 'Tintura, xarope ou pomada',
          D: 'Suco, sumo ou óleo',
        },
        resposta_correta: 'B',
        feedback:
          'A folha pode ser utilizada em decocção, infusão ou maceração (Oliveira et al., 2025); a ficha também registra o chá por via oral (Amador e Lucas, 2025) e o uso por infusão (Pereira, 2020).',
        campo_fonte: 'preparo',
        fonte:
          'Dados sobre o uso: "Folha pode ser utilizada em deccoção, infusão ou maceração (Oliveira et al., 2025)".',
      },
      {
        nivel: 'medio',
        eixo: 'Segurança e Contraindicação',
        pergunta:
          'A Hortelã pimenta tem a lista de contraindicações mais extensa do catálogo. Qual das situações abaixo NÃO consta nessa lista?',
        alternativas: {
          A: 'Refluxo gastroesofágico',
          B: 'Cálculos biliares e litíase urinária',
          C: 'Crianças menores de 4 anos',
          D: 'Pessoas com hipertensão arterial',
        },
        resposta_correta: 'D',
        feedback:
          'A ficha contraindica na gestação e lactação, para refluxo gastroesofágico, menores de 4 anos, cálculos biliares, obstrução dos ductos biliares, danos hepáticos severos e litíase urinária (EMA, 2020). Hipertensão não aparece.',
        campo_fonte: 'contraindicacoes',
        fonte:
          'Contra indicações: "...refluxo gastroesofágico... crianças menores de 4 anos... cálculos biliares, obstrução dos ductos biliares, danos hepáticos severos e litíase urinária (EMA, 2020)".',
      },
      {
        nivel: 'dificil',
        eixo: 'Identificação Botânica',
        pergunta:
          'Qual característica do caule aparece na descrição morfológica da Hortelã pimenta?',
        alternativas: {
          A: 'Caule quadrangular, de cor verde escuro a roxo-purpúreo',
          B: 'Caule rizomatoso, escuro, curto e palhoso',
          C: 'Caule liso, prostrado, de 0,5 a 1,2 m',
          D: 'Ramos eretos e sublenhosos de até 1,5 m',
        },
        resposta_correta: 'A',
        feedback:
          'Caules quadrangulares, de cor verde escuro a roxo-purpúreo (Fitoterapia Brasil). As outras descrevem o Capim santo, a Cuia-mansa e o Boldo.',
        campo_fonte: 'descricao',
        fonte:
          'Características morfológicas: "caules quadrangulares, de cor verde escuro a roxo-purpúreo" (Fitoterapia Brasil).',
      },
    ],
  },
  // =========================================================================
  {
    planta_id: '11',
    planta: 'Cuia-mansa',
    desafios: [
      {
        nivel: 'facil',
        eixo: 'Indicação Terapêutica',
        pergunta:
          'Quais usos populares a curadoria registra para a Cuia-mansa (Alternanthera tenella)?',
        alternativas: {
          A: 'Infecção urinária, anti-inflamatório e antioxidante',
          B: 'Calmante, insônia e ansiedade',
          C: 'Tosse, bronquite e asma',
          D: 'Náuseas, vômitos e gases',
        },
        resposta_correta: 'A',
        feedback:
          'A ficha registra infecção urinária (Da Silva, Pantoja e Oliveira, 2022), anti-inflamatório (Kassuya et al., 2021; Magalhães et al., 2021) e antioxidante (Brandão et al., 2014).',
        campo_fonte: 'usos_tradicionais',
        fonte:
          'Uso popular na literatura: "Infecção urinária (Da Silva, Pantoja e Oliveira, 2022); anti-inflamatório (Kassuya et al., 2021; Magalhães et al., 2021); Anti-oxidante (Brandão et al., 2014)".',
      },
      {
        nivel: 'medio',
        eixo: 'Preparo Tradicional',
        pergunta:
          'A curadoria registra para a Cuia-mansa o preparo mais detalhado do catálogo em tempo e frequência. Qual é ele?',
        alternativas: {
          A: 'Infusão por cerca de 10 minutos, até três vezes ao dia',
          B: 'Decocção por 40 minutos, uma vez ao dia',
          C: 'Chá da folha, 1 xícara ao dia',
          D: 'Chá e suco, 2 xícaras/copos ao dia',
        },
        resposta_correta: 'A',
        feedback:
          'A ficha registra "chá usado através da infusão, infuso por cerca de 10 minutos e podendo ser consumido até três vezes ao dia (Magalhães et al., 2021)". Atenção: as opções C e D são preparos reais, mas da Amora e do Boldo.',
        campo_fonte: 'preparo',
        fonte:
          'Dados sobre o uso: "Chá usado através da infusão, infuso por cerca de 10 minutos e podendo ser consumido até três vezes ao dia (Magalhães et al., 2021)".',
      },
      {
        nivel: 'medio',
        eixo: 'Segurança e Contraindicação',
        pergunta:
          'O que a curadoria registra nos campos de composição fitoquímica e contraindicações da Cuia-mansa?',
        alternativas: {
          A: 'Que não há contraindicações conhecidas',
          B: 'Que há escassez de material científico sobre ambos',
          C: 'Que é contraindicada apenas para gestantes',
          D: 'Que é segura por não conter princípios ativos',
        },
        resposta_correta: 'B',
        feedback:
          'Os dois campos trazem "Escassez de material" — a Cuia-mansa é a espécie com menor cobertura científica do catálogo. Isso não significa segurança: significa que não há dados para afirmar nem risco nem inocuidade, o que pede cautela redobrada.',
        campo_fonte: 'contraindicacoes',
        fonte:
          'Composição fitoquímica: "Escassez de material." / Contra indicações: "Escassez de material."',
      },
      {
        nivel: 'dificil',
        eixo: 'Identificação Botânica',
        pergunta:
          'Além das sementes, de que outra forma a Cuia-mansa se propaga, segundo a descrição morfológica?',
        alternativas: {
          A: 'Por estacas produzidas a partir dos ramos',
          B: 'Por rizomas dos quais emergem novas plantas',
          C: 'Quando os nós do caule tocam o solo e criam novas raízes',
          D: 'Por brotações eretas que se curvam e se enraízam',
        },
        resposta_correta: 'C',
        feedback:
          'A propagação ocorre principalmente por sementes, mas a planta também se alastra quando os nós do caule entram em contato com o solo e criam novas raízes (Flora Digital UFSC). As opções A, B e D descrevem, respectivamente, o Malvarisco, a Hortelã pimenta e a Cidreira.',
        campo_fonte: 'descricao',
        fonte:
          'Características morfológicas: "propagação ocorre principalmente por sementes, mas também se alastra quando os nós do caule entram em contato com o solo e criam novas raízes" (Flora Digital UFSC, Daniel Gracel).',
      },
    ],
  },
  // =========================================================================
  {
    planta_id: '12',
    planta: 'Capim santo',
    desafios: [
      {
        nivel: 'facil',
        eixo: 'Indicação Terapêutica',
        pergunta:
          'Qual é o uso do Capim santo (Cymbopogon citratus) com maior número de fontes na curadoria?',
        alternativas: {
          A: 'Efeito cicatrizante',
          B: 'Efeito calmante',
          C: 'Tratamento de gastrite',
          D: 'Ação antidiarreica',
        },
        resposta_correta: 'B',
        feedback:
          'Calmante aparece em três fontes (Amador e Lucas, 2025; Veras, 2025; Maciel et al., 2025), acompanhado de insônia e distúrbios nervosos. A ficha ainda registra um uso incomum no catálogo: fortalecer cabelos.',
        campo_fonte: 'usos_tradicionais',
        fonte:
          'Uso popular na literatura: "Calmante (Amador e Lucas, 2025; Veras, 2025; Maciel et al., 2025)".',
      },
      {
        nivel: 'medio',
        eixo: 'Preparo Tradicional',
        pergunta:
          'Além do chá, que outra forma de uso das folhas do Capim santo a curadoria registra?',
        alternativas: {
          A: 'Banho das folhas, de forma cutânea',
          B: 'Compressa sobre o abdômen',
          C: 'Inalação do vapor',
          D: 'Tintura da folha seca',
        },
        resposta_correta: 'A',
        feedback:
          'A ficha registra "chá das folhas, banho das folhas forma cutânea (Amador e Lucas, 2025)", além de decocção e infusão (Veras, 2025). Compressa é preparo registrado para a Corama.',
        campo_fonte: 'preparo',
        fonte:
          'Dados sobre o uso: "Chá das folhas, banho das folhas forma cutânea (Amador e Lucas, 2025)".',
      },
      {
        nivel: 'medio',
        eixo: 'Segurança e Contraindicação',
        pergunta:
          'O Capim santo tem uma restrição de idade que é única entre as 15 espécies do catálogo. Qual é ela?',
        alternativas: {
          A: 'Desaconselhado para menores de 6 anos',
          B: 'Não recomendado para menores de 4 anos',
          C: 'Contraindicado para menores de 18 anos',
          D: 'Contraindicado para maiores de 65 anos',
        },
        resposta_correta: 'C',
        feedback:
          'Contraindicado na gestação, lactação e para menores de 18 anos, por falta de dados adequados de segurança (Royo, Damasceno e Veloso, 2023). As opções A e B são restrições reais, mas do Boldinho japonês e da Hortelã pimenta.',
        campo_fonte: 'contraindicacoes',
        fonte:
          'Contra indicações: "O uso é contraindicado durante a gestação, lactação e para menores de 18 anos, devido à falta de dados adequados que comprovem a segurança nessas situações (Royo, Damasceno e Veloso, 2023)".',
      },
      {
        nivel: 'dificil',
        eixo: 'Identificação Botânica',
        pergunta:
          'O que a descrição morfológica registra sobre o florescimento do Capim santo?',
        alternativas: {
          A: 'Ocorre no final do inverno, com flores brancas e pequenas',
          B: 'É raro, e as flores eventualmente formadas são estéreis',
          C: 'Ocorre o ano todo, com flores azuis-arroxeadas',
          D: 'Produz flores campanuladas róseas em panículas terminais',
        },
        resposta_correta: 'B',
        feedback:
          'O florescimento é raro e as flores eventualmente formadas são estéreis (Fitoterapia Brasil) — por isso a propagação se dá pelos rizomas. As demais descrevem a Amora, a Cidreira e o Crajiru.',
        campo_fonte: 'descricao',
        fonte:
          'Características morfológicas: "florescimento é raro; flores, eventualmente formadas, são estéreis" (Fitoterapia Brasil).',
      },
    ],
  },
  // =========================================================================
  {
    planta_id: '13',
    planta: 'Cumaru',
    desafios: [
      {
        nivel: 'facil',
        eixo: 'Indicação Terapêutica',
        pergunta:
          'Quais queixas respiratórias aparecem entre os usos populares do Cumaru (Dipteryx odorata)?',
        alternativas: {
          A: 'Tosse, bronquite e asma',
          B: 'Sinusite e resfriado',
          C: 'Congestão nasal e rouquidão',
          D: 'Pneumonia e tuberculose',
        },
        resposta_correta: 'A',
        feedback:
          'A ficha registra tosse, bronquite e asma (Martins et al., 2021), junto de ação antiespasmódica, tônica, anti-inflamatória, antimicrobiana e para reumatismos e dores abdominais. Sinusite e resfriado são usos do Malvarisco.',
        campo_fonte: 'usos_tradicionais',
        fonte:
          'Uso popular na literatura: "Antiespasmódico, tônico, anti-inflamatório, reumatismos, antimicrobiano, dores abdominais, tosse, bronquite e asma (Martins et al., 2021)".',
      },
      {
        nivel: 'medio',
        eixo: 'Preparo Tradicional',
        pergunta:
          'O campo "Dados sobre o uso" da ficha do Cumaru descreve, na verdade, a composição de qual parte da planta?',
        alternativas: {
          A: 'Da folha seca',
          B: 'Do óleo',
          C: 'Da casca raspada',
          D: 'Da raiz em decocção',
        },
        resposta_correta: 'B',
        feedback:
          'A ficha descreve o óleo do cumaru, com ácidos graxos de cadeia longa como linoleico, palmítico, ortocumárico e esteárico (Martins et al., 2021). LACUNA CONHECIDA: é a única das 15 espécies cujo campo de uso não descreve um modo de preparo — a ser complementado com a autora.',
        campo_fonte: 'preparo',
        fonte:
          'Dados sobre o uso: "O óleo do cumaru possui ácidos graxos de cadeia longa como o ácido linoleico, ácido palmítico, ácido ortocumárico, ácido esteárico entre outros componentes químicos (Martins et al., 2021)".',
      },
      {
        nivel: 'medio',
        eixo: 'Segurança e Contraindicação',
        pergunta:
          'A curadoria afirma que o Cumaru não é tóxico. Que ressalva ela faz em seguida?',
        alternativas: {
          A: 'Que ainda assim se infere contraindicação na gestação e lactação',
          B: 'Que o uso é liberado para todos os grupos',
          C: 'Que só pode ser usado sob supervisão médica',
          D: 'Que não deve ser usado por menores de 18 anos',
        },
        resposta_correta: 'A',
        feedback:
          'A ficha registra: não é tóxico (Melo et al., 2014), porém infere-se contraindicação durante a gestação e a lactação. Repare que a curadoria usa "infere-se" — é uma inferência de cautela, não um achado direto da literatura.',
        campo_fonte: 'contraindicacoes',
        fonte:
          'Contra indicações: "Não é tóxico (Melo et al., 2014), porém, ainda sim, infere-se que é contraindicado durante a gestação e lactação".',
      },
      {
        nivel: 'dificil',
        eixo: 'Identificação Botânica',
        pergunta: 'A que família botânica pertence o Cumaru (Dipteryx odorata)?',
        alternativas: {
          A: 'Costaceae',
          B: 'Bignoniaceae',
          C: 'Crassulaceae',
          D: 'Fabaceae',
        },
        resposta_correta: 'D',
        feedback:
          'Fabaceae (Souza e Lorenzi, 2019), a família das leguminosas. Costaceae é a do Pobre-velho, Bignoniaceae a do Crajiru e Crassulaceae a da Corama.',
        campo_fonte: 'familia',
        fonte: 'Família: "Fabaceae (Souza e Lorenzi, 2019)".',
      },
    ],
  },
  // =========================================================================
  {
    planta_id: '14',
    planta: 'Boldinho japonês',
    desafios: [
      {
        nivel: 'facil',
        eixo: 'Indicação Terapêutica',
        pergunta:
          'Quais usos a curadoria registra para o Boldinho japonês (Mentha arvensis)?',
        alternativas: {
          A: 'Problemas estomacais, náuseas e vômitos',
          B: 'Pedra nos rins e infecção urinária',
          C: 'Anemia e emagrecimento',
          D: 'Cicatrização de feridas e queimaduras',
        },
        resposta_correta: 'A',
        feedback:
          'A ficha registra problemas estomacais e vômitos (Assis et al., 2022), além de uso como descongestionante nasal, na eliminação de gases e como sedativo do estômago, contra náuseas e vômitos (Infoteca Embrapa).',
        campo_fonte: 'usos_tradicionais',
        fonte:
          'Uso popular na literatura: "Problemas estomacais e vômitos (Assis et al., 2022); descongestionante nasal, na eliminação de gases do aparelho digestivo ou como sedativo do estômago, contra náuseas e vômitos (Infoteca Embrapa)".',
      },
      {
        nivel: 'medio',
        eixo: 'Preparo Tradicional',
        pergunta:
          'Segundo a curadoria, de quais formas as folhas do Boldinho japonês podem ser usadas?',
        alternativas: {
          A: 'Somente frescas, em infusão rápida',
          B: 'Frescas ou secas, em chá, tintura ou como inalante',
          C: 'Apenas em banho cutâneo',
          D: 'Apenas em compressa e sumo',
        },
        resposta_correta: 'B',
        feedback:
          'A ficha registra que as folhas podem ser usadas frescas, secas, na forma de chá, tintura ou como inalante (Assis et al., 2022) — é a única espécie do catálogo com o uso como inalante registrado.',
        campo_fonte: 'preparo',
        fonte:
          'Dados sobre o uso: "As folhas podem ser usadas frescas, secas, na forma de chá, tintura ou como inalante" (Assis et al., 2022).',
      },
      {
        nivel: 'medio',
        eixo: 'Segurança e Contraindicação',
        pergunta:
          'Qual substância presente no Boldinho japonês motiva a contraindicação na gestação e lactação?',
        alternativas: {
          A: 'O citral',
          B: 'A cânfora',
          C: 'O mentol',
          D: 'A β-ecdisona',
        },
        resposta_correta: 'C',
        feedback:
          'A ficha atribui a contraindicação ao mentol, e desaconselha o uso para menores de 6 anos. O óleo essencial é rico em levomentol (65-75%) e mentol. Citral é o componente principal do Capim santo; cânfora aparece no Malvarisco; β-ecdisona, na Terramicina.',
        campo_fonte: 'contraindicacoes',
        fonte:
          'Contra indicações: "Devido ao mentol, é contraindicado durante a gestação e lactação. E desaconselhado para menores de 6 anos".',
      },
      {
        nivel: 'dificil',
        eixo: 'Identificação Botânica',
        pergunta:
          'Segundo a composição fitoquímica registrada, qual é o teor de levomentol no óleo essencial do Boldinho japonês?',
        alternativas: {
          A: '10 a 20%',
          B: '30 a 40%',
          C: '65 a 75%',
          D: '90 a 100%',
        },
        resposta_correta: 'C',
        feedback:
          'O óleo essencial é rico em levomentol (65-75%), substância responsável pelo cheiro da planta e por seu princípio ativo (Infoteca Embrapa).',
        campo_fonte: 'evidencias',
        fonte:
          'Composição fitoquímica: "Contém óleo essencial rico em levomentol (65-75%), mentol (70%), substância responsável pelo cheiro da planta e por seu princípio ativo" (Infoteca Embrapa).',
      },
    ],
  },
  // =========================================================================
  {
    planta_id: '15',
    planta: 'Malvarisco',
    desafios: [
      {
        nivel: 'facil',
        eixo: 'Indicação Terapêutica',
        pergunta:
          'Quais queixas das vias respiratórias aparecem entre os usos do Malvarisco (Plectranthus amboinicus Lour.)?',
        alternativas: {
          A: 'Gripe, resfriado e sinusite',
          B: 'Bronquite, asma e reumatismo',
          C: 'Tosse seca e rouquidão',
          D: 'Pneumonia e catarro',
        },
        resposta_correta: 'A',
        feedback:
          'A ficha registra gripe, resfriado e sinusite (Veras, 2025), junto de vários usos digestivos e calmantes. Bronquite e asma são usos do Cumaru e do Boldo; catarro, do Pobre-velho.',
        campo_fonte: 'usos_tradicionais',
        fonte:
          'Uso popular na literatura: "...antioxidante, gripe, resfriado e sinusite (Veras, 2025)".',
      },
      {
        nivel: 'medio',
        eixo: 'Preparo Tradicional',
        pergunta: 'Qual é o preparo e a dose diária do Malvarisco registrados na curadoria?',
        alternativas: {
          A: 'Infusão da folha, até três vezes ao dia',
          B: 'Chá da folha, 2 xícaras ao dia',
          C: 'Chá da folha, 1 xícara ao dia',
          D: 'Banho das folhas, uma vez ao dia',
        },
        resposta_correta: 'B',
        feedback:
          'A ficha registra "folha utilizada para chá, 2 xícaras ao dia (Veras, 2025)" — mesma dose registrada para a Corama e o Boldo.',
        campo_fonte: 'preparo',
        fonte: 'Dados sobre o uso: "Folha utilizada para chá, 2 xícaras ao dia (Veras, 2025)".',
      },
      {
        nivel: 'medio',
        eixo: 'Segurança e Contraindicação',
        pergunta:
          'Além da contraindicação para gestantes, que precaução específica a curadoria recomenda no uso do Malvarisco?',
        alternativas: {
          A: 'Evitar exposição ao sol após o uso',
          B: 'Não usar junto de alimentos gordurosos',
          C: 'Cautela ao administrar junto com antimicrobianos, pelo risco de interferência no efeito terapêutico',
          D: 'Suspender o uso em caso de pressão alta',
        },
        resposta_correta: 'C',
        feedback:
          'A ficha alerta que a planta mostrou atividade sinérgica com alguns antifúngicos, mas antagônica com outros antimicrobianos — daí a recomendação de precaução no uso conjunto. Gestantes não podem ingerir: pode ser abortivo e causar má formação (Veras, 2025).',
        campo_fonte: 'contraindicacoes',
        fonte:
          'Contra indicações: "Recomenda-se, portanto, precaução na administração da planta conjuntamente com esses medicamentos, podendo interferir nos efeitos terapêuticos desejados" (Horto Didático UFSC).',
      },
      {
        nivel: 'dificil',
        eixo: 'Identificação Botânica',
        pergunta:
          'O que diferencia o Malvarisco das outras espécies de Plectranthus conhecidas como "boldos" (P. barbatus e P. ornatus)?',
        alternativas: {
          A: 'Ter folhas maiores e não aromáticas',
          B: 'Não ter o sabor amargo característico dessas plantas',
          C: 'Ter flores amarelas em vez de azuladas',
          D: 'Ser a única do gênero que se propaga por sementes',
        },
        resposta_correta: 'B',
        feedback:
          'A ficha destaca que o Malvarisco se diferencia de P. barbatus e P. ornatus por não ter o sabor amargo característico dessas duas plantas (Horto Didático UFSC). A propagação do Malvarisco, aliás, é feita por estacas dos ramos.',
        campo_fonte: 'descricao',
        fonte:
          'Características morfológicas: "Esta espécie diferencia-se das outras do gênero Plectranthus (P. barbatus e P. ornatus), conhecidas popularmente como boldos, por não ter o sabor amargo característico dessas duas outras plantas" (Horto Didático UFSC).',
      },
    ],
  },
];

/**
 * PERGUNTAS COMPLEMENTARES — EIXO ODS
 *
 * Estas 3 perguntas vieram do banco anterior (modelo AI Studio) e conectam as
 * plantas aos Objetivos de Desenvolvimento Sustentável. Ficaram FORA do banco
 * principal porque sua fonte é o PROMPT institucional do projeto, e não a
 * curadoria — e a regra deste banco é lastro na curadoria.
 *
 * Não são consumidas pelo fluxo do Desafio Diário. Estão preservadas aqui para
 * que a autora decida: (a) descartar, (b) reintegrar como eixo declaradamente
 * institucional, ou (c) reescrever a partir de uma fonte citável sobre ODS.
 */
export const PERGUNTAS_ODS_COMPLEMENTARES: Array<{
  planta_id: string;
  planta: string;
  pergunta: PerguntaQuiz;
}> = [
  {
    planta_id: '6',
    planta: 'Crajiru',
    pergunta: {
      nivel: 'dificil',
      eixo: 'Curiosidade ODS',
      pergunta:
        'De que maneira a valorização e o manejo sustentável do Crajiru se relacionam com o ODS 15 (Vida Terrestre) da ONU?',
      alternativas: {
        A: 'Incentivando a substituição da floresta por monoculturas de grande escala',
        B: 'Proibindo qualquer coleta comunitária em áreas de vegetação nativa',
        C: 'Promovendo a conservação da biodiversidade com extrativismo sustentável',
        D: 'Exportando toda matéria-prima sem gerar valor ou renda para os saberes locais',
      },
      resposta_correta: 'C',
      feedback:
        'O cultivo ético e a valorização das plantas nativas preservam o bioma amazônico e os conhecimentos tradicionais das comunidades locais.',
      campo_fonte: 'nota_geral',
      fonte: 'PROMPT do projeto GERMINA (conexão com as ODS) — não consta na curadoria.',
    },
  },
  {
    planta_id: '4',
    planta: 'Boldo',
    pergunta: {
      nivel: 'dificil',
      eixo: 'Curiosidade ODS',
      pergunta:
        'Considerando o ODS 3 (Saúde e Bem-Estar), qual atitude representa o consumo consciente e seguro de chás de Boldo?',
      alternativas: {
        A: 'Consumir vários litros por dia continuamente sem pausa',
        B: 'Substituir tratamentos prescritos sem consultar profissionais',
        C: 'Utilizar livremente na gestação sem orientação médica prévia',
        D: 'Utilizar de forma pontual respeitando cuidados e contraindicações',
      },
      resposta_correta: 'D',
      feedback:
        'O autocuidado com plantas medicinais requer responsabilidade; a curadoria registra o Boldo como abortivo e contraindicado em excesso para gestantes, lactantes e crianças (Veras, 2025).',
      campo_fonte: 'nota_geral',
      fonte:
        'PROMPT do projeto GERMINA (ODS 3) + Contra indicações da ficha do Boldo (Veras, 2025).',
    },
  },
  {
    planta_id: '1',
    planta: 'Amora',
    pergunta: {
      nivel: 'dificil',
      eixo: 'Curiosidade ODS',
      pergunta:
        'Como o cultivo da Amora em hortas comunitárias favorece as metas do ODS 12 (Consumo e Produção Responsáveis)?',
      alternativas: {
        A: 'Estimulando a produção local sustentável e o aproveitamento de plantas medicinais',
        B: 'Gerando grande quantidade de embalagens plásticas descartáveis',
        C: 'Exigindo transporte aéreo constante de insumos estrangeiros',
        D: 'Substituindo a biodiversidade nativa por espécies invasoras perigosas',
      },
      resposta_correta: 'A',
      feedback:
        'O cultivo local reduz transporte e resíduos e aproxima o uso medicinal da comunidade, como no Horto Municipal de Itacoatiara/AM.',
      campo_fonte: 'nota_geral',
      fonte: 'PROMPT do projeto GERMINA (ODS 12) — não consta na curadoria.',
    },
  },
];
