/**
 * Traduz as mensagens de erro do Supabase Auth (sempre em inglês, vêm da API)
 * para um texto que faz sentido pro usuário final do GERMINA. Usado em login,
 * cadastro, recuperação e redefinição de senha — os 4 pontos onde uma chamada
 * a supabase.auth.* pode falhar e o erro precisa virar texto na tela.
 *
 * Mapeamento por trecho (não por igualdade exata): a mensagem do Supabase às
 * vezes varia sutilmente entre versões da API, então comparar por `includes`
 * é mais resiliente do que um switch por string exata.
 */
export function traduzErroAuth(mensagem: string): string {
  const m = mensagem.toLowerCase();

  if (m.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos.';
  }
  if (m.includes('email not confirmed')) {
    return 'Confirme seu e-mail antes de entrar — verifique sua caixa de entrada.';
  }
  if (m.includes('user already registered') || m.includes('already been registered')) {
    return 'Já existe uma conta cadastrada com este e-mail.';
  }
  if (m.includes('token has expired') || m.includes('otp_expired') || m.includes('invalid token')) {
    return 'Código inválido ou expirado. Solicite um novo código.';
  }
  if (m.includes('rate limit')) {
    return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.';
  }
  if (m.includes('password should be at least')) {
    return 'A senha é muito curta.';
  }
  if (m.includes('unable to validate email address') || m.includes('invalid email')) {
    return 'Informe um e-mail válido.';
  }
  if (m.includes('network')) {
    return 'Falha de conexão. Verifique sua internet e tente novamente.';
  }

  // Sem tradução conhecida: melhor mostrar a mensagem original do que um erro
  // genérico que esconde o que de fato aconteceu (essencial pra depurar em
  // produção nas primeiras semanas do app).
  return mensagem;
}
