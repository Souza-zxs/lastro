import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { PLANOS, CICLOS, type CicloCobranca } from "@/lib/planos";

interface GreennWebhookPayload {
  event?: string;
  type?: string;
  currentStatus?: string;
  product?: { id?: number | string; name?: string };
  sale?: { id?: number | string; status?: string };
  contract?: { id?: number | string; status?: string };
  client?: { email?: string };
}

const STATUS_PAGO = new Set(["paid", "approved"]);

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * A Greenn não expõe nenhum campo pra gente mapear plano/ciclo pro
 * produto cadastrado lá — só a URL do webhook. Na ausência (ainda) de um
 * product.id conhecido em greenn_produtos, tenta inferir plano+ciclo pelo
 * nome do produto cadastrado no painel da Greenn (funciona se o nome
 * contiver o nome do plano e o ciclo, ex. "Lastro Estúdio Anual").
 */
function inferirPlanoECiclo(nomeProduto: string | undefined | null) {
  if (!nomeProduto) return null;
  const normalizado = normalizar(nomeProduto);
  const plano = PLANOS.find(
    (p) => normalizado.includes(p.id) || normalizado.includes(normalizar(p.nome))
  );
  const ciclo = CICLOS.find((c) => normalizado.includes(c.id))?.id;
  if (!plano || !ciclo) return null;
  return { planoId: plano.id, ciclo };
}

/**
 * A Greenn não assina nem manda token nenhum sozinha — a autenticação é
 * nossa: a "URL do Webhook" cadastrada no painel dela (Produtos > editar
 * produto > Conteúdos > Sistema Externo > Webhook) deve incluir
 * ?token=<GREENN_WEBHOOK_TOKEN>. Ver migration 20260904020000.
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const tokenEsperado = process.env.GREENN_WEBHOOK_TOKEN;
  const tokenRecebido = url.searchParams.get("token");

  if (!tokenEsperado || tokenRecebido !== tokenEsperado) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as GreennWebhookPayload | null;
  if (!payload) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const vendaId = String(payload.sale?.id ?? payload.contract?.id ?? "");
  const status = payload.sale?.status ?? payload.contract?.status ?? payload.currentStatus ?? "";

  if (!vendaId || !status) {
    return NextResponse.json({ error: "Payload sem id/status de venda." }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();

  // Dedup: a Greenn reenvia o mesmo evento em caso de erro/timeout do
  // lado dela. `unique (venda_id, status)` + tratar 23505 (violação de
  // unique) como "já processado" é o jeito idempotente de não ativar o
  // plano duas vezes por causa de um reenvio.
  const { data: evento, error: eventoError } = (await admin
    .from("greenn_webhook_eventos")
    .insert({
      venda_id: vendaId,
      evento: payload.event ?? payload.type ?? "desconhecido",
      status,
      produto_id: payload.product?.id != null ? String(payload.product.id) : null,
      produto_nome: payload.product?.name ?? null,
      email_cliente: payload.client?.email ?? null,
      payload,
    } as never)
    .select("id")
    .single()) as { data: { id: string } | null; error: { code?: string; message: string } | null };

  if (eventoError?.code === "23505") {
    return NextResponse.json({ ok: true, duplicado: true });
  }
  if (eventoError || !evento) {
    return NextResponse.json({ error: "Falha ao registrar evento." }, { status: 500 });
  }

  if (!STATUS_PAGO.has(status)) {
    return NextResponse.json({ ok: true, ignorado: status });
  }

  const marcarErro = (erro: string) =>
    admin.from("greenn_webhook_eventos").update({ erro } as never).eq("id", evento.id);

  const email = payload.client?.email;
  if (!email) {
    await marcarErro("sem_email_cliente");
    return NextResponse.json({ error: "Payload sem e-mail do cliente." }, { status: 400 });
  }

  const { data: usuario } = (await admin
    .from("usuarios")
    .select("id")
    .ilike("email", email)
    .maybeSingle()) as { data: { id: string } | null };

  if (!usuario) {
    await marcarErro("usuario_nao_encontrado");
    // 200: reenvio da Greenn não vai resolver sozinho (o e-mail da venda
    // não bate com nenhuma conta), fica registrado pra investigar.
    return NextResponse.json({ ok: true, erro: "usuario_nao_encontrado" });
  }

  const produtoId = payload.product?.id != null ? String(payload.product.id) : null;
  let mapeamento: { planoId: string; ciclo: CicloCobranca } | null = null;

  if (produtoId) {
    const { data: produto } = (await admin
      .from("greenn_produtos")
      .select("plano_id, ciclo")
      .eq("produto_id", produtoId)
      .maybeSingle()) as { data: { plano_id: string; ciclo: CicloCobranca } | null };
    if (produto) mapeamento = { planoId: produto.plano_id, ciclo: produto.ciclo };
  }

  if (!mapeamento) {
    mapeamento = inferirPlanoECiclo(payload.product?.name) as
      | { planoId: string; ciclo: CicloCobranca }
      | null;
  }

  if (!mapeamento) {
    await marcarErro("produto_nao_mapeado");
    return NextResponse.json({ ok: true, erro: "produto_nao_mapeado" });
  }

  const { error: ativarError } = await admin.rpc("ativar_plano_usuario", {
    p_user_id: usuario.id,
    p_plano_id: mapeamento.planoId,
    p_ciclo: mapeamento.ciclo,
  } as never);

  if (ativarError) {
    await marcarErro(`falha_ativar_plano: ${ativarError.message}`);
    return NextResponse.json({ error: "Falha ao ativar plano." }, { status: 500 });
  }

  await admin.from("greenn_webhook_eventos").update({ processado: true } as never).eq("id", evento.id);

  return NextResponse.json({ ok: true });
}
