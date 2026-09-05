"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { CAMPOS_CONTEUDO } from "@/lib/conteudo";

export async function salvarConteudoAdmin(formData: FormData) {
  await requireAdmin();

  const chavesValidas = new Set(CAMPOS_CONTEUDO.map((c) => c.chave));
  const linhas: { chave: string; valor: string }[] = [];

  for (const [chave, valor] of formData.entries()) {
    if (chavesValidas.has(chave) && typeof valor === "string") {
      linhas.push({ chave, valor });
    }
  }

  if (linhas.length > 0) {
    const admin = getSupabaseAdminClient();
    await admin.from("conteudos_site").upsert(linhas as never, { onConflict: "chave" });
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/conteudo");
}
