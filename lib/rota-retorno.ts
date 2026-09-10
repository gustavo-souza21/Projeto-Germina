/* ============================================================================
   ROTA DE RETORNO PÓS-LOGIN (`?next=`) — Fase 4, modo visitante

   POR QUE ISTO É UM ARQUIVO, E NÃO UM `if` NA TELA DE LOGIN

   O modo visitante criou um percurso novo e agora comum: a pessoa explora o
   app sem conta, esbarra numa tela que exige login, entra, e espera continuar
   de onde parou. Para isso o destino viaja na URL (`/login?next=/jardim`) —
   e uma URL é dado que vem de fora, mesmo quando quem a montou fomos nós.

   O risco concreto é OPEN REDIRECT: se `next` for aceito sem conferência,
   `/login?next=https://site-falso.exemplo/germina` faz o app mandar o usuário
   para um domínio de terceiros logo depois de ele digitar a senha — no
   momento em que ele mais confia na tela. Como o GERMINA é distribuído a
   alunos por link, um link assim é fácil de repassar por WhatsApp ou e-mail
   parecendo legítimo: o domínio inicial É o do app.

   Daí a regra ser conservadora: só caminho interno começando com uma barra,
   e nada mais. Qualquer coisa fora disso vira o destino padrão em vez de
   erro — falhar aqui não deve impedir alguém de entrar na própria conta.
   ========================================================================= */

/** Para onde ir depois do login quando não há destino específico pedido. */
export const ROTA_PADRAO_POS_LOGIN = '/inicio';

/**
 * Devolve `next` se ele for um caminho interno seguro; senão, `null`.
 *
 * Recusa, nesta ordem:
 *   • vazio/ausente;
 *   • qualquer coisa que não comece com `/` (URL absoluta, `javascript:`,
 *     caminho relativo);
 *   • `//outro-dominio` e `/\outro-dominio` — as duas formas de URL
 *     protocol-relative, que o navegador trata como domínio externo apesar
 *     de começarem com barra. É a pegadinha clássica deste tipo de checagem:
 *     testar só `startsWith('/')` deixa passar exatamente este caso.
 */
export function rotaInternaSegura(next: string | null | undefined): string | null {
  if (!next) return null;
  if (!next.startsWith('/')) return null;
  if (next.startsWith('//') || next.startsWith('/\\')) return null;
  return next;
}

/** O destino validado, ou a rota padrão. Conveniência para os call sites. */
export function destinoPosLogin(next: string | null | undefined): string {
  return rotaInternaSegura(next) ?? ROTA_PADRAO_POS_LOGIN;
}
