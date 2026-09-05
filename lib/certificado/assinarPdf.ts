import "server-only";
import { PDFDocument } from "pdf-lib";
import { pdflibAddPlaceholder } from "@signpdf/placeholder-pdf-lib";
import signpdf from "@signpdf/signpdf";
import { P12Signer } from "@signpdf/signer-p12";

/**
 * Assina eletronicamente um PDF com o certificado autoassinado da
 * plataforma (SIGNING_CERT_P12_BASE64/SIGNING_CERT_PASSWORD — gerado por
 * scripts/gerar-certificado-assinatura.mjs). Não é um certificado
 * ICP-Brasil: não tem confiança automática no Adobe Reader nem a
 * presunção legal da MP 2.200-2, mas é uma assinatura eletrônica real e
 * verificável (Lei 14.063/2020), gratuita, sem depender de nenhum
 * provedor externo. Se o certificado não estiver configurado, devolve o
 * PDF sem assinar — nunca quebra a emissão do certificado por causa
 * disso.
 */
export async function assinarPdfCertificado(pdfBuffer: Buffer): Promise<Buffer> {
  const p12Base64 = process.env.SIGNING_CERT_P12_BASE64;
  const senha = process.env.SIGNING_CERT_PASSWORD;
  if (!p12Base64 || !senha) return pdfBuffer;

  const pdfDoc = await PDFDocument.load(pdfBuffer);
  pdflibAddPlaceholder({
    pdfDoc,
    reason: "Certificado de anterioridade — Revollution Lastro",
    contactInfo: "contato@revollution.com.br",
    name: "Revollution Ideas Brand",
    location: "Brasil",
  });
  const pdfComPlaceholder = Buffer.from(await pdfDoc.save());

  const p12Buffer = Buffer.from(p12Base64, "base64");
  const signer = new P12Signer(p12Buffer, { passphrase: senha });

  return signpdf.sign(pdfComPlaceholder, signer);
}
