import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

function requireSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL em .env.local");
  }
  return url;
}

/**
 * Client por requisição, autenticado com a sessão do usuário (cookies) e
 * sujeito às policies de RLS. Use este client em toda leitura/escrita
 * disparada por um usuário logado.
 */
export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!anonKey) {
    throw new Error("Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local");
  }

  return createServerClient(requireSupabaseUrl(), anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Chamado a partir de um Server Component: a sessão é
          // atualizada pelo middleware, não é preciso escrever aqui.
        }
      },
    },
  });
}

let adminClient: ReturnType<typeof createClient> | null = null;

/**
 * Client com a service-role key, que ignora RLS. Reserve para operações
 * verdadeiramente privilegiadas (ex.: conceder créditos a partir de um
 * webhook de pagamento) — nunca para atender uma requisição de usuário
 * comum.
 */
export function getSupabaseAdminClient() {
  if (adminClient) return adminClient;

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("Supabase não configurado: defina SUPABASE_SERVICE_ROLE_KEY em .env.local");
  }

  adminClient = createClient(requireSupabaseUrl(), serviceRoleKey, {
    auth: { persistSession: false },
  });
  return adminClient;
}
