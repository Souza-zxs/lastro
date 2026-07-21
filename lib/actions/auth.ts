"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error) {
    redirect(`/login?erro=${encodeURIComponent("E-mail ou senha inválidos.")}`);
  }

  redirect("/dashboard");
}

export async function cadastrar(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const documento = String(formData.get("documento") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  if (!nome || !email || !senha) {
    redirect(`/cadastro?erro=${encodeURIComponent("Preencha os campos obrigatórios.")}`);
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { data: { nome, documento: documento || null } },
  });

  if (error) {
    redirect(`/cadastro?erro=${encodeURIComponent(traduzErroCadastro(error.message))}`);
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

function traduzErroCadastro(message: string) {
  if (message.toLowerCase().includes("already registered") || message.toLowerCase().includes("already exists")) {
    return "Este e-mail já está cadastrado.";
  }
  if (message.toLowerCase().includes("password")) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }
  return "Não foi possível criar sua conta. Tente novamente.";
}
