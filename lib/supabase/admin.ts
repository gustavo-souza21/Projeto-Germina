import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Cliente com a service_role key — ignora TODA política de RLS.
 *
 * ⚠️ NUNCA importar este módulo a partir de um arquivo 'use client' ou de
 * qualquer código que possa rodar no navegador. `SUPABASE_SERVICE_ROLE_KEY`
 * (sem prefixo NEXT_PUBLIC_) só existe no ambiente do servidor — o Next não a
 * injeta no bundle do cliente. O guard abaixo é defesa em profundidade: se
 * este módulo for importado por engano por algo que executa no navegador,
 * falha explicitamente em vez de silenciosamente tentar rodar sem a chave.
 *
 * Uso pretendido, hoje: exclusivamente dentro de Route Handlers (ex.:
 * app/api/conta/route.ts), nunca em Server Components de leitura nem em
 * Client Components — a service_role bypassa RLS, então qualquer engano que
 * troque `server.ts` por `admin.ts` numa query normal quebraria o isolamento
 * entre usuários que a RLS existe para garantir.
 */
export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error(
      'createAdminClient() não pode rodar no navegador — a service_role key nunca deve chegar ao cliente.'
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY ausente. Configure-a nas variáveis de ambiente do servidor ' +
        '(Vercel/host, ou .env.local em desenvolvimento) — nunca com prefixo NEXT_PUBLIC_.'
    );
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      // Este cliente nunca representa uma sessão de usuário — é usado uma
      // vez por requisição, para uma chamada administrativa pontual.
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
