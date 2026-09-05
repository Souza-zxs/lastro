import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { gerarPdfCertificado } from "@/lib/certificado/gerarPdf";
import { assinarPdfCertificado } from "@/lib/certificado/assinarPdf";
import { carimbarTempoPdf } from "@/lib/certificado/carimboTempo";
import { origemAtual } from "@/lib/origem";
import type { Registro } from "@/lib/types";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();

  // RLS já restringe a leitura ao dono do registro — mesmo padrão de
  // app/certificado/[id]/page.tsx.
  const { data: registro } = (await supabase
    .from("registros")
    .select("*")
    .eq("id", id)
    .maybeSingle()) as { data: Registro | null };

  if (!registro) {
    return NextResponse.json({ error: "Certificado não encontrado." }, { status: 404 });
  }

  const origem = (await origemAtual()) ?? "https://lastro.app";
  const urlVerificacao = `${origem.replace(/\/$/, "")}/verificar/${registro.codigo_verificacao}`;

  const pdfSemAssinar = await gerarPdfCertificado(registro, urlVerificacao);
  const pdfAssinado = await assinarPdfCertificado(pdfSemAssinar);
  const pdf = await carimbarTempoPdf(pdfAssinado);

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificado-${registro.codigo_verificacao}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
