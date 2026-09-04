import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

interface CorpoInscricao {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "É necessário estar autenticado." }, { status: 401 });
  }

  const corpo = (await request.json().catch(() => null)) as CorpoInscricao | null;
  if (!corpo?.endpoint || !corpo.keys?.p256dh || !corpo.keys?.auth) {
    return NextResponse.json({ error: "Inscrição inválida." }, { status: 400 });
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: corpo.endpoint,
      p256dh: corpo.keys.p256dh,
      auth: corpo.keys.auth,
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    return NextResponse.json({ error: "Falha ao salvar a inscrição." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "É necessário estar autenticado." }, { status: 401 });
  }

  const corpo = (await request.json().catch(() => null)) as { endpoint?: string } | null;
  if (!corpo?.endpoint) {
    return NextResponse.json({ error: "Endpoint obrigatório." }, { status: 400 });
  }

  await supabase.from("push_subscriptions").delete().eq("endpoint", corpo.endpoint);

  return NextResponse.json({ ok: true });
}
