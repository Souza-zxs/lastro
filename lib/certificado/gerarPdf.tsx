import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Svg,
  Polygon,
  Circle,
  renderToBuffer,
} from "@react-pdf/renderer";
import { toDataURL } from "qrcode";
import { formatDataHora } from "@/lib/format";
import type { Registro } from "@/lib/types";

// Cores da marca (mesmas tokens de app/globals.css).
const CORES = {
  ledger: "#4c0c23",
  ledgerLight: "#63132f",
  seal: "#cba876",
  sealLight: "#f3ecdc",
  paperCertificate: "#fdfbf5",
  ink: "#241119",
  inkMuted: "#6d5b5c",
  line: "#ddd0cb",
};

// Página em paisagem (A4 deitado).
const LARGURA = 841.89;

const styles = StyleSheet.create({
  page: { fontSize: 9.5, fontFamily: "Helvetica", color: CORES.ink },
  corpo: { paddingHorizontal: 44, paddingBottom: 16 },
  logoLinha: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 6 },
  logoTexto: { fontSize: 19, fontFamily: "Times-Bold", color: CORES.ledger, letterSpacing: 0.5 },
  subtitulo: { textAlign: "center", fontSize: 8, color: CORES.inkMuted, marginTop: 2, letterSpacing: 1, textTransform: "uppercase" },
  tituloPrincipal: { textAlign: "center", fontSize: 15, fontFamily: "Helvetica-Bold", color: CORES.ink, marginTop: 8, marginBottom: 12 },
  secaoLabel: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: CORES.ink, marginBottom: 6 },
  linha: { fontSize: 9.5, marginBottom: 3 },
  linhaMuted: { fontSize: 7, color: CORES.inkMuted, marginBottom: 6 },
  tresColunas: { flexDirection: "row", gap: 22 },
  colunaTerco: { width: "31.3%" },
  caixaHashConteudo: {
    borderWidth: 1,
    borderColor: CORES.seal,
    borderRadius: 4,
    padding: 10,
    backgroundColor: CORES.sealLight,
  },
  caixaHashLinha: { fontSize: 8, color: CORES.ink, marginBottom: 4 },
  caixaHashDestaque: { textAlign: "center", fontSize: 7.5, fontFamily: "Helvetica-Bold", color: CORES.ledger, marginTop: 3 },
  hashMono: { fontFamily: "Courier", fontSize: 6.8 },
  verificarLinha: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  verificarLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: CORES.ledger },
  conformidadeTitulo: { fontSize: 8, color: CORES.ledger, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 12, marginBottom: 4 },
  conformidadeColunas: { flexDirection: "row", gap: 22 },
  conformidadeItem: { fontSize: 7.3, color: CORES.inkMuted, marginBottom: 2 },
  explicacao: { fontSize: 7.3, color: CORES.inkMuted, lineHeight: 1.35, marginTop: 8 },
  assinaturaBloco: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: CORES.line,
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  assinaturaTexto: { fontSize: 7.3, color: CORES.ledger },
  rodapeTexto: { fontSize: 7.3, color: CORES.inkMuted },
  instagramBloco: { flexDirection: "row", alignItems: "center", gap: 6 },
  instagramTexto: { fontSize: 7, color: CORES.inkMuted },
});

const INSTAGRAM_URL = "https://www.instagram.com/revollutionideasbrand/";

const CONFORMIDADE_LEGAL = [
  "Lei nº 9.610/1998 (Lei de Direitos Autorais), art. 18 — a proteção autoral independe de registro.",
  "Convenção de Berna para a Proteção das Obras Literárias e Artísticas (Decreto nº 75.699/1975).",
  "Código de Processo Civil, art. 369 (Lei nº 13.105/2015) — meios legais e moralmente legítimos de prova.",
  "Lei nº 13.709/2018 (LGPD) — tratamento dos dados pessoais do titular.",
];

let logoBuffer: Buffer | null = null;
function carregarLogo(): Buffer {
  if (!logoBuffer) {
    logoBuffer = readFileSync(path.join(process.cwd(), "public", "revollution-mark.png"));
  }
  return logoBuffer;
}

async function gerarQrCodeDataUrl(url: string): Promise<string> {
  return toDataURL(url, { margin: 0, width: 200, color: { dark: CORES.ledger } });
}

/** Insere espaços a cada 8 caracteres para o hash poder quebrar linha
 * dentro da caixa — sem isso, react-pdf trata o hash como uma única
 * "palavra" indivisível e deixa o texto vazar pra fora da borda. */
function formatarHashParaExibicao(hash: string): string {
  return hash.match(/.{1,8}/g)?.join(" ") ?? hash;
}

/** Faixa decorativa angular (topo ou rodapé, espelhada) — mesmo espírito do
 * modelo de referência, com as cores da marca em vez de cinza. */
function FaixaDecorativa({ altura, espelhada = false }: { altura: number; espelhada: boolean }) {
  const p1 = espelhada
    ? `0,${altura} ${LARGURA},${altura} ${LARGURA},${altura - 22} ${LARGURA * 0.42},0 0,${altura - 40}`
    : `0,0 ${LARGURA},0 ${LARGURA},22 ${LARGURA * 0.42},${altura} 0,${altura - 40}`;
  const p2 = espelhada
    ? `0,${altura} ${LARGURA * 0.68},${altura} ${LARGURA * 0.3},${altura - 55} 0,${altura - 18}`
    : `0,0 ${LARGURA * 0.68},0 ${LARGURA * 0.3},${altura - 55} 0,18`;

  return (
    <Svg width={LARGURA} height={altura} style={{ position: "absolute", top: espelhada ? undefined : 0, bottom: espelhada ? 0 : undefined, left: 0 }}>
      <Polygon points={p1} fill={CORES.ledger} />
      <Polygon points={p2} fill={CORES.ledgerLight} />
    </Svg>
  );
}

export async function gerarPdfCertificado(registro: Registro, urlVerificacao: string): Promise<Buffer> {
  const qrDataUrl = await gerarQrCodeDataUrl(urlVerificacao);
  const instagramQrDataUrl = await gerarQrCodeDataUrl(INSTAGRAM_URL);
  const emitidoEm = new Date();

  const documento = (
    <Document title={`Certificado — ${registro.titulo}`} author="Revollution Lastro">
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={{ height: 96 }}>
          <FaixaDecorativa altura={96} espelhada={false} />
          <View style={{ position: "absolute", top: 0, right: 46, width: 34, height: 78 }}>
            <Svg width={34} height={78} style={{ position: "absolute", top: 0, left: 0 }}>
              <Polygon points="0,0 34,0 34,78 17,62 0,78" fill={CORES.seal} />
              <Circle cx={17} cy={30} r={19} fill={CORES.paperCertificate} stroke={CORES.ledger} strokeWidth={1.5} />
            </Svg>
            <Image
              src={carregarLogo()}
              style={{ position: "absolute", top: 19, left: 6, width: 22, height: 22 }}
            />
          </View>
        </View>

        <View style={styles.corpo}>
          <View style={styles.logoLinha}>
            <Image src={carregarLogo()} style={{ width: 26, height: 26 }} />
            <Text style={styles.logoTexto}>REVOLLUTION LASTRO</Text>
          </View>
          <Text style={styles.subtitulo}>Prova de anterioridade digital</Text>

          <Text style={styles.tituloPrincipal}>Certificado de Anterioridade</Text>

          <View style={styles.tresColunas}>
            <View style={styles.colunaTerco}>
              <Text style={styles.secaoLabel}>Registrado por</Text>
              <Text style={styles.linha}>Titular: {registro.autor}</Text>
              {registro.autor_documento && <Text style={styles.linha}>Documento: {registro.autor_documento}</Text>}
              <Text style={styles.linhaMuted}>(CPF, CNPJ, etc.)</Text>
              {registro.autor_endereco && (
                <Text style={[styles.linha, { marginTop: 4 }]}>Endereço: {registro.autor_endereco}</Text>
              )}
            </View>
            <View style={styles.colunaTerco}>
              <Text style={styles.secaoLabel}>Registro</Text>
              {registro.arquivo_original_nome && <Text style={styles.linha}>Arquivo: {registro.arquivo_original_nome}</Text>}
              <Text style={styles.linha}>Título: {registro.titulo}</Text>
              <Text style={styles.linha}>Categoria: {registro.categoria}</Text>
              <Text style={[styles.linha, { marginTop: 4 }]}>Código: {registro.codigo_verificacao}</Text>
            </View>
            <View style={styles.colunaTerco}>
              <Text style={styles.secaoLabel}>Assinatura eletrônica</Text>
              <View style={styles.caixaHashConteudo}>
                <Text style={styles.caixaHashLinha}>Registrado em: {formatDataHora(registro.data_registro)}</Text>
                <Text style={styles.caixaHashLinha}>Hash do arquivo (SHA-256):</Text>
                <Text style={[styles.hashMono, { marginBottom: 4 }]}>{formatarHashParaExibicao(registro.hash_sha256)}</Text>
                <Text style={styles.caixaHashDestaque}>ASSINADO ELETRONICAMENTE E CARIMBADO (RFC 3161)</Text>
              </View>
              <View style={styles.verificarLinha}>
                <Image src={qrDataUrl} style={{ width: 48, height: 48 }} />
                <Text style={styles.verificarLabel}>Verificar{"\n"}certificado</Text>
              </View>
            </View>
          </View>

          <Text style={styles.explicacao}>
            Este certificado comprova, por meio de hash SHA-256, carimbo de tempo (padrão RFC
            3161) e assinatura eletrônica, que a pessoa acima identificada declarou-se autora
            e/ou titular dos direitos sobre a obra mencionada, na data e hora do registro
            indicadas, constituindo registro oficial de direitos autorais e elemento de prova de
            anterioridade e titularidade declarada, utilizável em procedimentos administrativos
            ou judiciais nos termos da legislação aplicável. Diferente de outras plataformas do
            gênero, a Revollution Lastro preserva o arquivo original enviado — não apenas o seu
            hash — permitindo reconferência posterior em caso de disputa. Não constitui
            aconselhamento jurídico. Quaisquer inconsistências nos dados constantes desta
            declaração são de exclusiva responsabilidade do declarante.
          </Text>

          <Text style={styles.conformidadeTitulo}>Conformidade legal</Text>
          <View style={styles.conformidadeColunas}>
            <View style={{ flex: 1 }}>
              {CONFORMIDADE_LEGAL.slice(0, 2).map((item, i) => (
                <Text key={i} style={styles.conformidadeItem}>
                  • {item}
                </Text>
              ))}
            </View>
            <View style={{ flex: 1 }}>
              {CONFORMIDADE_LEGAL.slice(2).map((item, i) => (
                <Text key={i} style={styles.conformidadeItem}>
                  • {item}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.assinaturaBloco}>
            <View>
              <Text style={styles.assinaturaTexto}>Documento assinado eletronicamente</Text>
              <Text style={styles.rodapeTexto}>{formatDataHora(emitidoEm.toISOString())}</Text>
            </View>
            <View style={styles.instagramBloco}>
              <Image src={instagramQrDataUrl} style={{ width: 30, height: 30 }} />
              <Text style={styles.instagramTexto}>Siga a Revollution{"\n"}@revollutionideasbrand</Text>
            </View>
            <Text style={styles.rodapeTexto}>© Revollution Marcas e Patentes</Text>
          </View>
        </View>

        <View style={{ height: 46, marginTop: "auto" }}>
          <FaixaDecorativa altura={46} espelhada />
        </View>
      </Page>
    </Document>
  );

  return renderToBuffer(documento);
}
