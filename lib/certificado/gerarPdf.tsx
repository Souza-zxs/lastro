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
  explicacao: {
    marginTop: 16,
    fontSize: 9,
    color: "#444",
    lineHeight: 1.5,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 14,
  },
  conformidadeTitulo: { fontSize: 9, color: "#8a1538", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 14, marginBottom: 6 },
  conformidadeItem: { fontSize: 9, color: "#444", marginBottom: 3 },
  qrRow: { flexDirection: "row", alignItems: "center", marginTop: 16, gap: 14, borderTopWidth: 1, borderTopColor: "#ddd", paddingTop: 16 },
  qrTexto: { fontSize: 8, color: "#666", maxWidth: 340, lineHeight: 1.4 },
  avisoTitulo: { fontSize: 8, color: "#8a1538", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 16, marginBottom: 4 },
  aviso: { fontSize: 8, color: "#666", lineHeight: 1.5, marginBottom: 6 },
  rodape: { marginTop: 12, fontSize: 8, color: "#666", lineHeight: 1.5 },
  assinaturaBloco: {
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  assinaturaTexto: { fontSize: 8, color: "#8a1538" },
  copyright: { fontSize: 8, color: "#999" },
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
          e/ou titular dos direitos sobre a obra mencionada neste documento, na data e hora do
          registro indicadas. Diferente de outras plataformas do gênero, a Revollution Lastro
          preserva o arquivo original enviado — não apenas o seu hash — permitindo reconferência
          posterior em caso de disputa.
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
          <Image src={qrDataUrl} style={{ width: 84, height: 84 }} />
          <Text style={styles.qrTexto}>
            Verifique a autenticidade deste certificado em {urlVerificacao}
          </Text>
        </View>

        <Text style={styles.avisoTitulo}>Avisos</Text>
        <Text style={styles.aviso}>
          Quaisquer inconsistências nos dados constantes desta declaração são de exclusiva
          responsabilidade do declarante, nos termos da declaração de autoria firmada no ato do
          registro.
        </Text>
        <Text style={styles.aviso}>
          A proteção autoral é assegurada pela Lei nº 9.610/1998, independentemente de registro,
          conforme dispõe o art. 18. Esta certificação registra o conteúdo apresentado, a
          identificação do titular e a data de submissão, constituindo elemento de prova de
          anterioridade e de titularidade declarada, podendo ser utilizada como meio de prova em
          procedimentos administrativos ou judiciais, nos termos da legislação aplicável, e
          constitui registro oficial de direitos autorais. Não constitui aconselhamento jurídico.
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
