import "server-only";
import { Document, Page, View, Text, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { toDataURL } from "qrcode";
import { formatDataHora } from "@/lib/format";
import type { Registro } from "@/lib/types";

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 11, fontFamily: "Helvetica", color: "#1a1a1a" },
  eyebrow: { fontSize: 9, color: "#8a1538", marginBottom: 4, textTransform: "uppercase", letterSpacing: 2 },
  titulo: { fontSize: 22, marginBottom: 4 },
  subtitulo: { fontSize: 10, color: "#666", marginBottom: 24, borderBottomWidth: 1, borderBottomColor: "#ddd", paddingBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  campo: { width: "50%", marginBottom: 14 },
  campoLargo: { width: "100%", marginBottom: 14 },
  label: { fontSize: 8, color: "#666", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 },
  valor: { fontSize: 11 },
  hashLabel: { fontSize: 8, color: "#666", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 10, marginBottom: 3 },
  hash: { fontSize: 9, fontFamily: "Courier" },
  qrRow: { flexDirection: "row", alignItems: "center", marginTop: 24, gap: 14, borderTopWidth: 1, borderTopColor: "#ddd", paddingTop: 16 },
  qrTexto: { fontSize: 8, color: "#666", maxWidth: 340, lineHeight: 1.4 },
  rodape: { marginTop: 20, fontSize: 8, color: "#666", lineHeight: 1.5 },
});

async function gerarQrCodeDataUrl(url: string): Promise<string> {
  return toDataURL(url, { margin: 1, width: 240 });
}

export async function gerarPdfCertificado(registro: Registro, urlVerificacao: string): Promise<Buffer> {
  const qrDataUrl = await gerarQrCodeDataUrl(urlVerificacao);

  const documento = (
    <Document title={`Certificado — ${registro.titulo}`} author="Revollution Lastro">
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Certificado de registro</Text>
        <Text style={styles.titulo}>Prova de anterioridade</Text>
        <Text style={styles.subtitulo}>Revollution Lastro</Text>

        <View style={styles.grid}>
          <View style={styles.campoLargo}>
            <Text style={styles.label}>Obra</Text>
            <Text style={styles.valor}>{registro.titulo}</Text>
          </View>
          <View style={styles.campo}>
            <Text style={styles.label}>Autor(a)</Text>
            <Text style={styles.valor}>{registro.autor}</Text>
          </View>
          {registro.autor_documento && (
            <View style={styles.campo}>
              <Text style={styles.label}>CPF/CNPJ</Text>
              <Text style={styles.valor}>{registro.autor_documento}</Text>
            </View>
          )}
          <View style={styles.campo}>
            <Text style={styles.label}>Categoria</Text>
            <Text style={styles.valor}>{registro.categoria}</Text>
          </View>
          <View style={styles.campo}>
            <Text style={styles.label}>Registrado em</Text>
            <Text style={styles.valor}>{formatDataHora(registro.data_registro)}</Text>
          </View>
          <View style={styles.campoLargo}>
            <Text style={styles.label}>Código de verificação</Text>
            <Text style={styles.valor}>{registro.codigo_verificacao}</Text>
          </View>
          {registro.autor_endereco && (
            <View style={styles.campoLargo}>
              <Text style={styles.label}>Endereço do(a) titular</Text>
              <Text style={styles.valor}>{registro.autor_endereco}</Text>
            </View>
          )}
        </View>

        <Text style={styles.hashLabel}>Hash SHA-256</Text>
        <Text style={styles.hash}>{registro.hash_sha256}</Text>

        <View style={styles.qrRow}>
          <Image src={qrDataUrl} style={{ width: 84, height: 84 }} />
          <Text style={styles.qrTexto}>
            Verifique a autenticidade deste certificado em {urlVerificacao}
          </Text>
        </View>

        <Text style={styles.rodape}>
          Este certificado atesta a existência do arquivo indicado, com o hash acima, na data e
          hora do registro. Não constitui registro oficial de direitos autorais nem
          aconselhamento jurídico. Este PDF traz uma assinatura eletrônica própria da plataforma
          — verifique no painel de assinaturas do seu leitor de PDF (ex.: Adobe Acrobat Reader).
        </Text>
      </Page>
    </Document>
  );

  return renderToBuffer(documento);
}
