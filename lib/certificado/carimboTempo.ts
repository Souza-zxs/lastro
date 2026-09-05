import "server-only";
import { KNOWN_TSA_URLS, timestampPdf } from "pdf-rfc3161";

/**
 * Adiciona um carimbo de tempo RFC 3161 usando a FreeTSA.org — serviço
 * gratuito e comunitário, sem SLA, sem garantia de disponibilidade e sem
 * nenhum credenciamento (não é ICP-Brasil, não tem presunção legal
 * automática no Brasil). A própria FreeTSA se declara inadequada para uso
 * de produção jurídica séria (ver freetsa.org/freetsa_cps.html) — usamos
 * mesmo assim, por não ter custo, como um carimbo extra de RFC 3161 além
 * do timestamp do banco, nunca como uma alegação de carimbo de tempo
 * qualificado. Trocar por uma TSA paga/credenciada quando isso for
 * viabilizado (ver lib/certificado/assinarPdf.ts para o mesmo raciocínio
 * sobre o certificado de assinatura).
 *
 * LTV desligado de propósito: embutir cadeia de certificados/CRL/OCSP
 * exigiria requisições extras à própria FreeTSA, que já não tem SLA —
 * mais uma chamada de rede é mais uma chance de falha, sem ganho real
 * já que o carimbo em si não é confiável o bastante pra justificar LTV.
 *
 * Melhor esforço: se a FreeTSA estiver fora do ar ou a chamada falhar por
 * qualquer motivo, devolve o PDF sem carimbar em vez de quebrar a emissão
 * do certificado.
 */
export async function carimbarTempoPdf(pdfBuffer: Buffer): Promise<Buffer> {
  try {
    const resultado = await timestampPdf({
      pdf: pdfBuffer,
      tsa: { url: KNOWN_TSA_URLS.FREETSA },
      enableLTV: false,
    });
    return Buffer.from(resultado.pdf);
  } catch {
    return pdfBuffer;
  }
}
