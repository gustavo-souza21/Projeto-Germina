import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

// Usado em Client Components ('use client'). Requer @supabase/ssr no lugar
// do createClient simples do protótipo (que rodava só no client, sem SSR/cookies).
//
// O genérico <Database> é o que dá intellisense e checagem de tipo a partir
// daqui pra toda mutação: `.from('terrenos_jardim').update({ ... })` passa a
// autocompletar nomes de coluna e recusar campo inexistente/tipo errado em
// tempo de build, em vez de só em runtime quando o Postgres rejeitar.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
