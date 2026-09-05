import { NovoRegistroForm } from "./NovoRegistroForm";
import { CompletarCadastroForm } from "./CompletarCadastroForm";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NovoRegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const supabase = await getSupabaseServerClient();
  const { data: usuario } = await supabase
    .from("usuarios")
    .select("creditos_disponiveis, documento, endereco")
    .single();

  if (!usuario?.documento || !usuario?.endereco) {
    return <CompletarCadastroForm erro={erro} />;
  }

  return <NovoRegistroForm creditosDisponiveis={usuario.creditos_disponiveis} />;
}
