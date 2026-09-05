"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { getPlano } from "@/lib/planos";

export async function ajustarCreditosAdmin(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const quantidade = Number(formData.get("quantidade"));
  if (!userId || !Number.isFinite(quantidade) || quantidade === 0) return;

  const admin = getSupabaseAdminClient();
  await admin.rpc("adicionar_creditos", { p_user_id: userId, p_quantidade: Math.trunc(quantidade) } as never);

  revalidatePath(`/admin/usuarios/${userId}`);
  revalidatePath("/admin/usuarios");
}

export async function alterarPlanoAdmin(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const planoId = String(formData.get("planoId") ?? "");
  const ciclo = String(formData.get("ciclo") ?? "");
  if (!userId) return;

  const admin = getSupabaseAdminClient();

  if (!planoId || planoId === "nenhum" || !getPlano(planoId)) {
    await admin
      .from("usuarios")
      .update({
        plano_id: null,
        plano_ciclo: null,
        plano_processos_bonus: 0,
        plano_ativado_em: null,
      } as never)
      .eq("id", userId);
  } else {
    await admin.rpc("ativar_plano_usuario", {
      p_user_id: userId,
      p_plano_id: planoId,
      p_ciclo: ciclo || "mensal",
    } as never);
  }

  revalidatePath(`/admin/usuarios/${userId}`);
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin");
}
