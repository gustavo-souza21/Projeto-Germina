import { createClient } from "@supabase/supabase-js";

// ATENÇÃO: por enquanto o app roda 100% em dados mock (ver /data/plantas.js)
// para permitir demo e deploy sem depender de credenciais reais.
//
// Para conectar ao Supabase real:
// 1. Crie um projeto em https://supabase.com
// 2. Copie .env.local.example para .env.local e preencha as chaves
// 3. Troque as importações de "@/data/plantas" pelas consultas abaixo
//    nas páginas que hoje usam os mocks.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Exemplo de uso futuro:
// const { data: plantas, error } = await supabase.from("plantas").select("*");
