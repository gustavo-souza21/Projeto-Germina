import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { createAdminClient } from '../../../lib/supabase/admin';

/**
 * DELETE /api/conta — exclusão definitiva (hard delete) da conta do usuário
 * autenticado.
 *
 * G4 (Kanban) já estava resolvido no nível do schema desde a Migration 1: as
 * 11 tabelas de domínio referenciam profiles(id) com ON DELETE CASCADE, e
 * profiles referencia auth.users(id) com ON DELETE CASCADE também — apagar a
 * linha em auth.users é suficiente para o Postgres remover todo o resto do
 * usuário (perfil, jardim, herbário, atividades, posts, curtidas, etc.) numa
 * única cascata atômica. A dívida real nunca foi "o que apagar", era só
 * "como apagar auth.users em si": isso só é possível pela Admin API do
 * Supabase (`auth.admin.deleteUser`), que exige a service_role key — uma
 * chave que não pode existir em código que roda no navegador. Por isso este
 * é um Route Handler (`app/api/.../route.ts`, executa só no servidor), e não
 * mais uma mutação direta do cliente como as dos Lotes 1 e 2.
 *
 * Segurança crítica: o id do usuário a excluir vem SEMPRE de
 * `supabase.auth.getUser()`, resolvido a partir dos cookies de sessão da
 * própria requisição — nunca de um id enviado no corpo da requisição. Se
 * aceitássemos um id do cliente, bastaria adulterar a chamada fetch para
 * excluir a conta de outra pessoa; a service_role não tem RLS para impedir
 * isso, então essa checagem é a única barreira que resta.
 */
export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    // Erro de configuração (env var ausente), não do usuário — logado
    // detalhado no servidor, resposta genérica pro cliente.
    console.error('createAdminClient() falhou:', err);
    return NextResponse.json({ erro: 'Exclusão de conta indisponível no momento.' }, { status: 500 });
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

  if (deleteError) {
    console.error('Falha ao excluir conta via Admin API:', deleteError.message);
    return NextResponse.json({ erro: 'Falha ao excluir a conta.' }, { status: 500 });
  }

  // O usuário não existe mais em auth.users — limpa os cookies de sessão
  // locais para que o middleware não tente validar alguém que já foi
  // excluído na próxima navegação.
  await supabase.auth.signOut();

  return NextResponse.json({ ok: true });
}
