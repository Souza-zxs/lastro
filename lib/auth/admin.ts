import "server-only";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Confirma que o usuário logado tem is_admin = true antes de liberar uma
 * página em app/(admin). Usa o client comum (RLS) só pra ler o próprio
 * is_admin — as queries de dado de outros usuários dentro de /admin devem
 * usar getSupabaseAdminClient(), que ignora RLS.
 */
export async function requireAdmin() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: usuario } = await supabase.from("usuarios").select("is_admin, nome, email").single();

  if (!usuario?.is_admin) redirect("/dashboard");

  return { id: user.id, nome: usuario.nome as string, email: usuario.email as string };
}
