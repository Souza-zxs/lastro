"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { StatusAlerta } from "@/lib/types";

/**
 * STUB: liga o monitoramento na hora, sem cobrança — igual ao stub de
 * checkout em /api/checkout. Quando a assinatura mensal existir de
 * verdade, isso deve virar consequência de um pagamento confirmado, não
 * um botão direto.
 */
export async function ativarMonitoramento() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("usuarios").update({ monitoramento_ativo: true }).eq("id", user.id);
  revalidatePath("/dashboard/alertas");
}

export async function desativarMonitoramento() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("usuarios").update({ monitoramento_ativo: false }).eq("id", user.id);
  revalidatePath("/dashboard/alertas");
}

export async function atualizarStatusAlerta(alertaId: string, status: StatusAlerta) {
  const supabase = await getSupabaseServerClient();
  await supabase.from("alertas_uso_indevido").update({ status }).eq("id", alertaId);
  revalidatePath("/dashboard/alertas");
}
