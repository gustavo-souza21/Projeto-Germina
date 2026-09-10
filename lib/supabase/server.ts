import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

// Usado em Server Components, Route Handlers e Middleware (login/cadastro
// via Supabase Auth precisam disso para ler/escrever a sessão em cookies).
//
// Mesmo genérico <Database> do client.ts do browser — as queries de leitura
// em lib/queries/*.ts (Server Components) ganham o mesmo intellisense/
// checagem de tipo que as mutações do lado do cliente.
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // chamado a partir de um Server Component — ok ignorar,
            // o middleware cuida de refrescar a sessão
          }
        },
      },
    }
  );
}
