import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const EVENTOS_PAGAMENTO_CONFIRMADO = new Set(["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"]);

interface AsaasWebhookPayload {
  event: string;
  payment?: { id: string };
}

/**
 * O Asaas manda esse token de volta no header `asaas-access-token` em
 * toda notificação, exatamente como configurado no painel (Integrações >
 * Webhooks). Não é uma rota pensada para ser chamada pelo client.
 */
export async function POST(request: Request) {
  const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN;
  const tokenRecebido = request.headers.get("asaas-access-token");

  if (!webhookToken || tokenRecebido !== webhookToken) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as AsaasWebhookPayload | null;
  const paymentId = payload?.payment?.id;

  if (!payload?.event || !paymentId) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  if (!EVENTOS_PAGAMENTO_CONFIRMADO.has(payload.event)) {
    return NextResponse.json({ ok: true, ignorado: payload.event });
  }

  const admin = getSupabaseAdminClient();
  const { error } = await admin.rpc("confirmar_pagamento_pedido", {
    p_asaas_payment_id: paymentId,
  } as never);

  if (error) {
    // pedido_nao_encontrado pode acontecer se o webhook chegar antes do
    // checkout terminar de salvar o asaas_payment_id — devolvemos 500
    // pra o Asaas tentar de novo (ele reenvia com backoff).
    return NextResponse.json({ error: "Falha ao confirmar pagamento." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
