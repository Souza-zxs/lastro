import { NovoRegistroForm } from "./NovoRegistroForm";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NovoRegistroPage() {
  const supabase = await getSupabaseServerClient();
  const { data: usuario } = await supabase.from("usuarios").select("creditos_disponiveis").single();

  return <NovoRegistroForm creditosDisponiveis={usuario?.creditos_disponiveis ?? 0} />;
}
