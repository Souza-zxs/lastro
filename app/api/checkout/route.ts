import { NextResponse } from "next/server";
import { getPacote } from "@/lib/pacotes";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * STUB: concede os créditos do pacote imediatamente, sem cobrança real.
 * Antes de ir para produção, troque isto por uma Checkout Session de um
 * gateway de pagamento (ex.: Stripe, Mercado Pago) e só chame
 * `adicionar_creditos` a partir do webhook que confirma o pagamento —
 * nunca direto a partir desta rota.
 */
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
  const pacote = pacoteId ? getPacote(pacoteId) : undefined;

  if (!pacote) {
    return NextResponse.json({ error: "Pacote inválido." }, { status: 400 });
  }

  // O client admin não tem tipos de schema gerados (sem `supabase gen types`),
  // então o TS não infere os parâmetros da RPC automaticamente.
  const admin = getSupabaseAdminClient();
  const { error } = await admin.rpc("adicionar_creditos", {
    p_user_id: user.id,
    p_quantidade: pacote.creditos,
  } as never);

  if (error) {
    return NextResponse.json({ error: "Falha ao processar a compra." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, creditosAdicionados: pacote.creditos });
}
