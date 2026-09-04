"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { TipoProcessoInpi } from "@/lib/types";

const ERROS_CONHECIDOS = ["sem_plano_ativo", "limite_processos_atingido"];

export async function adicionarProcessoInpi(formData: FormData) {
  const numeroProcesso = String(formData.get("numero_processo") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "") as TipoProcessoInpi;
  const apelido = String(formData.get("apelido") ?? "").trim() || null;

  if (!numeroProcesso || !["marca", "patente", "desenho_industrial"].includes(tipo)) {
    return;
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.rpc("criar_processo_inpi", {
    p_numero_processo: numeroProcesso,
    p_tipo: tipo,
    p_apelido: apelido,
  } as never);

  if (error) {
    const codigo = ERROS_CONHECIDOS.find((c) => error.message.includes(c)) ?? "erro";
    redirect(`/dashboard/inpi?erro=${codigo}`);
  }

  revalidatePath("/dashboard/inpi");
}

export async function removerProcessoInpi(processoId: string) {
  const supabase = await getSupabaseServerClient();
  await supabase.from("processos_inpi").delete().eq("id", processoId);
  revalidatePath("/dashboard/inpi");
}

export async function marcarEventoInpiLido(eventoId: string) {
  const supabase = await getSupabaseServerClient();
  await supabase.from("eventos_processo_inpi").update({ lido: true }).eq("id", eventoId);
  revalidatePath("/dashboard/inpi");
}
