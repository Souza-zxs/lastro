import { NextResponse } from "next/server";
import { criarCobranca, criarOuBuscarCliente } from "@/lib/asaas";
import { getPacote } from "@/lib/pacotes";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";

const DOCUMENTO_PATTERN = /^\d{11}$|^\d{14}$/;

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "É necessário estar autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const pacoteId = typeof body?.pacoteId === "string" ? body.pacoteId : undefined;
  const documentoInformado =
    typeof body?.documento === "string" ? body.documento.replace(/\D/g, "") : undefined;
  const pacote = pacoteId ? getPacote(pacoteId) : undefined;

  if (!pacote) {
    return NextResponse.json({ error: "Pacote inválido." }, { status: 400 });
  }

  // O client admin não tem tipos de schema gerados (sem `supabase gen
  // types`), então o TS não infere os parâmetros de update/rpc
  // automaticamente — daqui pra baixo, todo body de update/insert é
  // castado `as never`.
  const admin = getSupabaseAdminClient();
  const { data: usuario, error: usuarioError } = (await admin
    .from("usuarios")
    .select("nome, email, documento, asaas_customer_id")
    .eq("id", user.id)
    .single()) as {
    data: { nome: string; email: string; documento: string | null; asaas_customer_id: string | null } | null;
    error: { message: string } | null;
  };

  if (usuarioError || !usuario) {
    return NextResponse.json({ error: "Falha ao carregar seus dados." }, { status: 500 });
  }

  const documento = usuario.documento ?? documentoInformado;
  if (!documento || !DOCUMENTO_PATTERN.test(documento)) {
    return NextResponse.json({ error: "cpf_cnpj_obrigatorio" }, { status: 422 });
  }

  if (!usuario.documento) {
    await admin.from("usuarios").update({ documento } as never).eq("id", user.id);
  }

  let customerId = usuario.asaas_customer_id;
  if (!customerId) {
    try {
      customerId = await criarOuBuscarCliente({ nome: usuario.nome, email: usuario.email, cpfCnpj: documento });
    } catch {
      return NextResponse.json({ error: "Falha ao criar cliente no Asaas." }, { status: 502 });
    }
    await admin.from("usuarios").update({ asaas_customer_id: customerId } as never).eq("id", user.id);
  }

  const { data: pedido, error: pedidoError } = (await admin
    .from("pedidos")
    .insert({
      user_id: user.id,
      pacote_id: pacote.id,
      quantidade_creditos: pacote.creditos,
      valor_centavos: pacote.precoCentavos,
    } as never)
    .select()
    .single()) as { data: { id: string } | null; error: { message: string } | null };

  if (pedidoError || !pedido) {
    return NextResponse.json({ error: "Falha ao criar o pedido." }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

  try {
    const cobranca = await criarCobranca({
      customerId,
      valorCentavos: pacote.precoCentavos,
      descricao: `Lastro — pacote ${pacote.nome}`,
      externalReference: pedido.id,
      successUrl: `${siteUrl}/dashboard?compra=confirmada`,
    });

    await admin.from("pedidos").update({ asaas_payment_id: cobranca.id } as never).eq("id", pedido.id);

    return NextResponse.json({ ok: true, checkoutUrl: cobranca.invoiceUrl });
  } catch {
    // Cobrança falhou depois de criar o pedido: marca como cancelado em
    // vez de deixar um "pendente" órfão que nunca vai ser confirmado pelo
    // webhook (não existe asaas_payment_id pra ele reagir).
    await admin.from("pedidos").update({ status: "cancelado" } as never).eq("id", pedido.id);
    return NextResponse.json({ error: "Falha ao gerar cobrança." }, { status: 502 });
  }
}
