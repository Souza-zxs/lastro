import { NextResponse } from "next/server";
import { gerarPdfTermos } from "@/lib/termos/gerarPdf";

export async function GET() {
  const pdf = await gerarPdfTermos();

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="termos-de-uso-revollution-lastro.pdf"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
