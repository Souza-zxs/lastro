interface DadosNoticia {
  autor: string;
  emailAutor: string;
  titulo: string;
  codigoVerificacao: string;
  urlVerificacao: string;
  hashSha256: string;
  urlEncontrada: string;
}

/**
 * Gera um modelo de notificação de remoção de conteúdo (estilo takedown)
 * que o usuário pode copiar e enviar ao host/plataforma onde a cópia foi
 * encontrada. Deliberadamente genérico — não é um formulário de DMCA
 * específico de nenhum provedor, só um texto-base com as evidências que o
 * Lastro já tem (código de verificação, hash, URLs).
 */
export function gerarNoticiaDeRemocao({
  autor,
  emailAutor,
  titulo,
  codigoVerificacao,
  urlVerificacao,
  hashSha256,
  urlEncontrada,
}: DadosNoticia): string {
  return `Prezados,

Sou ${autor}, autor(a) da obra intitulada "${titulo}", registrada através da plataforma Lastro com o seguinte comprovante de anterioridade:

Código de verificação: ${codigoVerificacao}
Verificação pública: ${urlVerificacao}
Hash SHA-256 do arquivo original: ${hashSha256}

Identifiquei uma cópia não autorizada desta obra no seguinte endereço:
${urlEncontrada}

Solicito a remoção do conteúdo ou a devida atribuição de autoria, conforme a legislação de direitos autorais aplicável.

Atenciosamente,
${autor}
${emailAutor}

---
Este é um modelo gerado automaticamente pela plataforma Lastro e não constitui aconselhamento jurídico. Para orientação específica sobre o seu caso, consulte um(a) advogado(a).`;
}
