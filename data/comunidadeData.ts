import { PostComunidade, RespostaPost, ItemTroca } from '../lib/types';

/**
 * ATENÇÃO: ARQUIVO MORTO — nenhum import aponta para cá (confirmado por grep em
 * `app/`, `components/`, `lib/` e `data/`). É o mock da Comunidade de antes de
 * `lib/queries/comunidade.ts` passar a ler do Supabase (A7). Continua sendo
 * compilado, então na Fase 2 (09/09/2026) o campo `autor_instituicao` foi
 * removido daqui junto com o resto — não por ser exibido em algum lugar, mas
 * porque `PostComunidade` deixou de ter esse campo e este arquivo quebraria o
 * `tsc`. Candidato a exclusão num lote de limpeza; deixado no lugar aqui para
 * não misturar remoção de arquivo com correção de segurança.
 */

export const POSTS_INICIAIS: PostComunidade[] = [
  {
    id: 'p1',
    autor_nome: 'Profa. Sarah Batista de Freitas',
    autor_nivel: 'Nível 5 - Árvore',
    conteudo: 'Iniciamos hoje o mapeamento das 7 espécies medicinais da lista RENISUS no campus. O Crajiru (Pariri) apresentou excelente concentração de flavonoides no extrato!',
    tag: '#RENISUS',
    curtidas: 24,
    curtido_pelo_usuario: false,
    respostas_count: 2,
    criado_em: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'p2',
    autor_nome: 'Manoel da Silva (Ribeirinho)',
    autor_nivel: 'Nível 4 - Flores',
    conteudo: 'O chá de Capim Santo com Hortelã pimenta preparado na infusão tradicional tem ajudado muito os vizinhos para febre e calmante natural nesta semana.',
    tag: '#SaberesTradicionais',
    curtidas: 18,
    curtido_pelo_usuario: true,
    respostas_count: 1,
    criado_em: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'p3',
    autor_nome: 'Lucas Andrade',
    autor_nivel: 'Nível 2 - Broto',
    conteudo: 'Alguém teria 2 sementes de Cumaru para troca? Posso oferecer adubo orgânico preparado no minhocário da faculdade!',
    tag: '#TrocaDeSementes',
    curtidas: 9,
    curtido_pelo_usuario: false,
    respostas_count: 0,
    criado_em: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export const RESPOSTAS_INICIAIS: RespostaPost[] = [
  {
    id: 'r1',
    post_id: 'p1',
    autor_nome: 'Manoel da Silva (Ribeirinho)',
    autor_nivel: 'Nível 4 - Flores',
    conteudo: 'Muito bom, professora! Aqui na comunidade também usamos bastante o Crajiru pra ferimentos.',
    criado_em: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'r2',
    post_id: 'p1',
    autor_nome: 'Lucas Andrade',
    autor_nivel: 'Nível 2 - Broto',
    conteudo: 'A senhora vai postar os dados da análise fitoquímica depois? Tenho interesse acadêmico nisso.',
    criado_em: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'r3',
    post_id: 'p2',
    autor_nome: 'Profa. Sarah Batista de Freitas',
    autor_nivel: 'Nível 5 - Árvore',
    conteudo: 'Ótimo relato, Manoel! Esse é exatamente o tipo de saber tradicional que a curadoria do GERMINA busca documentar.',
    criado_em: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
];

export const TROCAS_INICIAIS: ItemTroca[] = [
  {
    id: 't1',
    autor_nome: 'Profa. Sarah Batista de Freitas',
    item_nome: 'Muda de Crajiru',
    is_renisus: true,
    quantidade_disponivel: 'Muda única',
    procura: 'Sementes de Cumaru',
  },
  {
    id: 't2',
    autor_nome: 'Manoel da Silva (Ribeirinho)',
    item_nome: 'Sementes de Boldo',
    is_renisus: true,
    quantidade_disponivel: '3 disponíveis',
    procura: 'Adubo Orgânico',
  },
];
