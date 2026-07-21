import { notFound } from "next/navigation";
import { CertificadoPreview } from "@/components/CertificadoPreview";
import { CertificadoToolbar } from "@/components/CertificadoToolbar";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { origemAtual } from "@/lib/origem";

export const dynamic = "force-dynamic";

export default async function CertificadoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();
  const { data: registro } = await supabase
    .from("registros")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!registro) notFound();
  const origem = await origemAtual();

  return (
    <div className="bg-paper-texture min-h-screen bg-paper py-8 print:bg-white print:py-0">
      <CertificadoToolbar voltarHref={`/dashboard/registro/${registro.id}`} />
      <div className="mx-auto mt-6 max-w-2xl px-6 print:mt-0 print:max-w-none print:px-0">
        <CertificadoPreview registro={registro} origem={origem} className="print:shadow-none" />
      </div>
    </div>
  );
}
