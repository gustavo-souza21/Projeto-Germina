/**
 * Junta classes condicionais, ignorando `false`, `null` e `undefined`.
 *
 * Versão mínima e sem dependência externa. Não faz merge de conflitos de
 * Tailwind (como o `tailwind-merge` faria): se você passar `p-4` e `p-6`, os
 * dois vão para o DOM e vence a ordem do CSS gerado. Os componentes de UI
 * deste projeto colocam o `className` recebido por último justamente para que
 * a sobrescrita pelo consumidor funcione na prática.
 *
 * Se em algum momento os conflitos ficarem frequentes, trocar por
 * `clsx` + `tailwind-merge` é uma substituição direta desta assinatura.
 */
export type ClassValue = string | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}
