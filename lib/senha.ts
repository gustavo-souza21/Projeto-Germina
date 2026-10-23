/* ============================================================================
   POLÍTICA DE SENHA — FONTE ÚNICA  (achado #5 da auditoria, Fase 3)

   O PROBLEMA QUE ISTO RESOLVE

   A lista de regras vivia DUPLICADA, palavra por palavra, em
   `app/(auth)/cadastro/page.tsx` e `app/(auth)/redefinir-senha/page.tsx`.
   Hoje as duas cópias concordam; nada as obrigava a continuar concordando.
   É a mesma classe de bug do QA-02 (xp/nivel_atual) e do QA-03 (quantidade
   anunciada vs. creditada na loja): dois lugares livres para alterar um sem o
   outro. Se alguém endurecesse a regra no cadastro, a tela de redefinir senha
   continuaria aceitando a senha fraca — e seria o caminho óbvio para
   contornar a política nova.

   O LIMITE DESTA CAMADA — e por que ele importa

   Isto roda no NAVEGADOR. Não é uma defesa: quem chamar
   `supabase.auth.signUp()` direto, fora da UI, não passa por aqui. A única
   política de senha que o servidor de fato aplica é a configurada no projeto
   Supabase (Dashboard → Authentication → Policies: comprimento mínimo e
   "required characters"). Este arquivo existe para dar FEEDBACK ao usuário
   enquanto ele digita, não para garantir nada — e os dois precisam ser
   configurados para dizer a mesma coisa, senão o app promete uma exigência
   que o servidor não cobra (ou, pior, recusa no envio uma senha que a tela
   marcou como válida).

   Ver o passo de configuração correspondente no doc de status do projeto,
   Prioridade 1 — ele não pode ser feito por código, só no painel.
   ========================================================================= */

export interface RegraSenha {
  id: string;
  label: string;
  teste: (senha: string) => boolean;
}

/** Símbolos que o Supabase conta como "symbol": !@#$%^&*()_+-=[]{};'\\:"|<>?,./`~ */
const SIMBOLOS_SUPABASE = /[!@#$%^&*()_+\-=[\]{};'\\:"|<>?,./`~]/;

/** Comprimento mínimo. Precisa bater com o "Minimum password length" do painel. */
export const SENHA_TAMANHO_MINIMO = 8;

/**
 * As regras exibidas ao usuário, na ordem em que aparecem na tela.
 *
 * Equivalente no painel do Supabase: comprimento mínimo 8 e "Required
 * characters" = "Lowercase, uppercase, digits and symbols" — a opção mais
 * estrita, que é exatamente esta lista.
 */
export const REGRAS_SENHA: RegraSenha[] = [
  {
    id: 'tamanho',
    label: `Mínimo de ${SENHA_TAMANHO_MINIMO} caracteres`,
    teste: (s) => s.length >= SENHA_TAMANHO_MINIMO,
  },
  { id: 'maiuscula', label: 'Uma letra maiúscula', teste: (s) => /[A-Z]/.test(s) },
  { id: 'minuscula', label: 'Uma letra minúscula', teste: (s) => /[a-z]/.test(s) },
  { id: 'numero', label: 'Um número', teste: (s) => /[0-9]/.test(s) },
  {
    id: 'especial',
    label: 'Um símbolo, como ! @ # $ % & * ?',
    // EXATAMENTE os símbolos que o Supabase aceita na política mais estrita
    // (docs: Auth → Password security). Antes valia qualquer caractere que não
    // fosse letra ou número — "ç", "é" ou um espaço deixavam a regra verde na
    // tela, e o servidor recusava a senha no envio.
    teste: (s) => SIMBOLOS_SUPABASE.test(s),
  },
];

/** Cada regra com o resultado para a senha digitada — para a lista de checks da UI. */
export function avaliarSenha(senha: string): Array<RegraSenha & { ok: boolean }> {
  return REGRAS_SENHA.map((r) => ({ ...r, ok: r.teste(senha) }));
}

/** A senha cumpre todas as regras? */
export function senhaAtendeRegras(senha: string): boolean {
  return REGRAS_SENHA.every((r) => r.teste(senha));
}
