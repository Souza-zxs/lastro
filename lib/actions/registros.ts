"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function excluirRegistro(registroId: string) {
  const supabase = await getSupabaseServerClient();
  // RLS restringe a exclusão à própria linha (auth.uid() = user_id) — não
  // precisa checar o dono aqui, um id de outro usuário simplesmente não
  // casa com nenhuma linha e o delete não afeta nada.
  await supabase.from("registros").delete().eq("id", registroId);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
