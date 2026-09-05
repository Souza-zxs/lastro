"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const DOCUMENTO_PATTERN = /^\d{11}$|^\d{14}$/;

export async function completarDadosTitular(formData: FormData) {
  const documento = String(formData.get("documento") ?? "").replace(/\D/g, "");
  const endereco = String(formData.get("endereco") ?? "").trim();

  if (!DOCUMENTO_PATTERN.test(documento)) {
    redirect(`/dashboard/novo?erro=${encodeURIComponent("Informe um CPF ou CNPJ válido.")}`);
  }
  if (endereco.length < 5) {
    redirect(`/dashboard/novo?erro=${encodeURIComponent("Informe um endereço válido.")}`);
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.rpc("completar_dados_titular", {
    p_documento: documento,
    p_endereco: endereco,
  });

  if (error) {
    redirect(`/dashboard/novo?erro=${encodeURIComponent("Não foi possível salvar seus dados. Tente novamente.")}`);
  }

  redirect("/dashboard/novo");
}
