import "server-only";
import { Document, Page, View, Text, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { toDataURL } from "qrcode";
import { formatDataHora } from "@/lib/format";
import type { Registro } from "@/lib/types";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 11, fontFamily: "Helvetica", color: "#1a1a1a" },
  eyebrow: { fontSize: 9, color: "#8a1538", marginBottom: 3, textTransform: "uppercase", letterSpacing: 2 },
  titulo: { fontSize: 20, marginBottom: 3 },
  subtitulo: { fontSize: 9, color: "#666", marginBottom: 14, borderBottomWidth: 1, borderBottomColor: "#ddd", paddingBottom: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  campo: { width: "50%", marginBottom: 9 },
  campoLargo: { width: "100%", marginBottom: 9 },
  label: { fontSize: 7.5, color: "#666", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  valor: { fontSize: 10.5 },
  hashLabel: { fontSize: 7.5, color: "#666", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 4, marginBottom: 2 },
  hash: { fontSize: 8.5, fontFamily: "Courier" },
  explicacao: {
    marginTop: 10,
    fontSize: 8.5,
    color: "#444",
    lineHeight: 1.4,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 9,
  },
  conformidadeTitulo: { fontSize: 8.5, color: "#8a1538", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 9, marginBottom: 4 },
  conformidadeItem: { fontSize: 8.5, color: "#444", marginBottom: 2 },
  qrRow: { flexDirection: "row", alignItems: "center", marginTop: 10, gap: 12, borderTopWidth: 1, borderTopColor: "#ddd", paddingTop: 10 },
  qrTexto: { fontSize: 7.5, color: "#666", maxWidth: 360, lineHeight: 1.3 },
  aviso: { fontSize: 7.5, color: "#666", lineHeight: 1.4, marginTop: 8 },
  assinaturaBloco: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  assinaturaTexto: { fontSize: 7.5, color: "#8a1538" },
  rodape: { fontSize: 7.5, color: "#666" },
  copyright: { fontSize: 7.5, color: "#999" },
});

const CONFORMIDADE_LEGAL = [
  "Lei nº 9.610/1998 (Lei de Direitos Autorais), art. 18 — a proteção autoral independe de registro.",
  "Convenção de Berna para a Proteção das Obras Literárias e Artísticas (Decreto nº 75.699/1975).",
  "Código de Processo Civil, art. 369 (Lei nº 13.105/2015) — meios legais e moralmente legítimos de prova.",
  "Lei nº 13.709/2018 (LGPD) — tratamento dos dados pessoais do titular.",
];

async function gerarQrCodeDataUrl(url: string): Promise<string> {
  return toDataURL(url, { margin: 1, width: 240 });
}

export async function gerarPdfCertificado(registro: Registro, urlVerificacao: string): Promise<Buffer> {
  const qrDataUrl = await gerarQrCodeDataUrl(urlVerificacao);
  const emitidoEm = new Date();

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
            <Text style={styles.label}>Autor(a) / Titular dos direitos</Text>
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
            <Text style={styles.label}>Código do certificado</Text>
            <Text style={styles.valor}>{registro.codigo_verificacao}</Text>
          </View>
          {registro.arquivo_original_nome && (
            <View style={styles.campo}>
              <Text style={styles.label}>Nome do arquivo</Text>
              <Text style={styles.valor}>{registro.arquivo_original_nome}</Text>
            </View>
          )}
          {registro.autor_endereco && (
            <View style={styles.campoLargo}>
              <Text style={styles.label}>Endereço do(a) titular</Text>
              <Text style={styles.valor}>{registro.autor_endereco}</Text>
            </View>
          )}
        </View>

        <Text style={styles.hashLabel}>Hash SHA-256</Text>
        <Text style={styles.hash}>{registro.hash_sha256}</Text>

        <Text style={styles.explicacao}>
          Este certificado comprova, por meio de hash SHA-256, carimbo de tempo (padrão RFC
          3161) e assinatura eletrônica, que a pessoa acima identificada declarou-se autora
          e/ou titular dos direitos sobre a obra mencionada, na data e hora do registro
          indicadas, constituindo registro oficial de direitos autorais e elemento de prova de
          anterioridade e titularidade declarada, utilizável em procedimentos administrativos
          ou judiciais nos termos da legislação aplicável. Diferente de outras plataformas do
          gênero, a Revollution Lastro preserva o arquivo original enviado — não apenas o seu
          hash — permitindo reconferência posterior em caso de disputa. Não constitui
          aconselhamento jurídico.
        </Text>

        <Text style={styles.conformidadeTitulo}>Conformidade legal</Text>
        <View>
          {CONFORMIDADE_LEGAL.map((item, i) => (
            <Text key={i} style={styles.conformidadeItem}>
              • {item}
            </Text>
          ))}
        </View>

        <View style={styles.qrRow}>
          <Image src={qrDataUrl} style={{ width: 68, height: 68 }} />
          <Text style={styles.qrTexto}>
            Verifique a autenticidade deste certificado em {urlVerificacao}
          </Text>
        </View>

        <Text style={styles.aviso}>
          Quaisquer inconsistências nos dados constantes desta declaração são de exclusiva
          responsabilidade do declarante, nos termos da declaração de autoria firmada no ato do
          registro.
        </Text>

        <View style={styles.assinaturaBloco}>
          <View>
            <Text style={styles.assinaturaTexto}>Documento assinado eletronicamente</Text>
            <Text style={styles.rodape}>{formatDataHora(emitidoEm.toISOString())}</Text>
          </View>
          <Text style={styles.copyright}>© Revollution Marcas e Patentes</Text>
        </View>
      </Page>
    </Document>
  );

  return renderToBuffer(documento);
}
