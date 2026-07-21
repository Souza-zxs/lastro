const RESEND_ENDPOINT = "https://api.resend.com/emails";

/**
 * Envio de e-mail transacional via Resend (self-service, sem contato
 * comercial — mesma lógica de escolha do Google Vision em
 * lib/monitoramento/provedor.ts). Sem RESEND_API_KEY configurada, a
 * função não faz nada — e-mail é um recurso adicional, não deve derrubar
 * quem chama (ex.: o job de monitoramento) só por faltar essa env var.
 */
export async function enviarEmail({
  para,
  assunto,
  html,
}: {
  para: string;
  assunto: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const remetente = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !remetente) return false;

  try {
    const resposta = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: remetente, to: para, subject: assunto, html }),
    });
    return resposta.ok;
  } catch {
    return false;
  }
}
