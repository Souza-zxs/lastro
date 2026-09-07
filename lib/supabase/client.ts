import { createBrowserClient } from "@supabase/ssr";

/**
 * Client de navegador (chave anônima, sujeito a RLS) — usado só quando
 * algo precisa subir direto do browser pro Supabase (Storage, hoje),
 * sem passar pela nossa API. Existe por causa do limite de ~4,5MB de
 * corpo de requisição das Serverless Functions da Vercel: o arquivo
 * original de uma foto de celular passa disso fácil, então não pode
 * mais ir dentro do FormData de /api/registros.
 */
export function getSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
