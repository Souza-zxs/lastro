import "server-only";
import { Document, Page, View, Text, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { CLAUSULAS, CONTROLADOR, EMBASAMENTO_JURIDICO, INTRODUCAO, ULTIMA_ATUALIZACAO, type BlocoTexto } from "@/lib/termos/conteudo";

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a", lineHeight: 1.4 },
  eyebrow: { fontSize: 8, color: "#8a1538", marginBottom: 4, textTransform: "uppercase", letterSpacing: 2 },
  titulo: { fontSize: 16, marginBottom: 4 },
  subtitulo: { fontSize: 9, color: "#666", marginBottom: 16, borderBottomWidth: 1, borderBottomColor: "#ddd", paddingBottom: 12 },
  intro: { fontSize: 9.5, color: "#444", marginBottom: 8 },
  clausulaTitulo: { fontSize: 11, marginTop: 14, marginBottom: 6 },
  paragrafo: { fontSize: 9.5, color: "#444", marginBottom: 5 },
  itemLista: { fontSize: 9.5, color: "#444", marginBottom: 3, paddingLeft: 12 },
  secaoTitulo: { fontSize: 12, marginTop: 18, marginBottom: 8, borderTopWidth: 1, borderTopColor: "#ddd", paddingTop: 14 },
  rodapeInfo: { fontSize: 9.5, color: "#444", marginTop: 4 },
});

function renderBloco(bloco: BlocoTexto, chave: string) {
  if (typeof bloco === "string") {
    return (
      <Text key={chave} style={styles.paragrafo}>
        {bloco}
      </Text>
    );
  }
  return (
    <View key={chave}>
      {bloco.itens.map((item, i) => (
        <Text key={i} style={styles.itemLista}>
          • {item}
        </Text>
      ))}
    </View>
  );
}

export async function gerarPdfTermos(): Promise<Buffer> {
  const documento = (
    <Document title="Termos de Uso e Política de Privacidade — Revollution Lastro" author="Revollution Lastro">
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.eyebrow}>Documento legal</Text>
        <Text style={styles.titulo}>
          Termo de Uso, Privacidade e Autorização para Tratamento e Compartilhamento de Dados
        </Text>
        <Text style={styles.subtitulo}>
          Plataforma de registro de direitos autorais · Última atualização: {ULTIMA_ATUALIZACAO}
        </Text>

        <Text style={styles.intro}>{INTRODUCAO}</Text>

        {CLAUSULAS.map((clausula) => (
          <View key={clausula.numero} wrap={false}>
            <Text style={styles.clausulaTitulo}>
              Cláusula {clausula.numero} - {clausula.titulo}
            </Text>
            {clausula.blocos.map((bloco, i) => renderBloco(bloco, `${clausula.numero}-${i}`))}
          </View>
        ))}

        <View>
          <Text style={styles.secaoTitulo}>Embasamento jurídico da prova de anterioridade</Text>
          {EMBASAMENTO_JURIDICO.map((paragrafo, i) => (
            <Text key={i} style={styles.paragrafo}>
              {paragrafo}
            </Text>
          ))}
        </View>

        <View>
          <Text style={styles.secaoTitulo}>Informações do controlador</Text>
          <Text style={styles.rodapeInfo}>Controlador dos dados: {CONTROLADOR.nome}</Text>
          <Text style={styles.rodapeInfo}>CNPJ: {CONTROLADOR.cnpj}</Text>
          <Text style={styles.rodapeInfo}>E-mail para assuntos de privacidade: {CONTROLADOR.emailPrivacidade}</Text>
          <Text style={styles.rodapeInfo}>Encarregado (DPO): {CONTROLADOR.dpo}</Text>
          <Text style={styles.rodapeInfo}>Endereço: {CONTROLADOR.endereco}</Text>
        </View>
      </Page>
    </Document>
  );

  return renderToBuffer(documento);
}
