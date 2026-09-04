import webpush from "web-push";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

let configurado = false;

function configurar(): boolean {
  if (configurado) return true;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return false;

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configurado = true;
  return true;
}

interface PayloadPush {
  titulo: string;
  corpo: string;
  url?: string;
}

/**
 * Envia uma notificação push pra todas as inscrições ativas de um
 * usuário. Sem VAPID_PRIVATE_KEY/NEXT_PUBLIC_VAPID_PUBLIC_KEY/VAPID_SUBJECT
 * configuradas, não faz nada — notificação é um recurso adicional, não
 * deve derrubar quem chama (mesmo espírito de enviarEmail em lib/email.ts,
 * que também é tolerante à ausência de config).
 */
export async function enviarPushParaUsuario(userId: string, payload: PayloadPush): Promise<void> {
  if (!configurar()) return;

  const admin = getSupabaseAdminClient();
  const { data: inscricoes } = (await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId)) as {
    data: { id: string; endpoint: string; p256dh: string; auth: string }[] | null;
  };

  for (const inscricao of inscricoes ?? []) {
    try {
      await webpush.sendNotification(
        {
          endpoint: inscricao.endpoint,
          keys: { p256dh: inscricao.p256dh, auth: inscricao.auth },
        },
        JSON.stringify(payload)
      );
    } catch (erro) {
      // 404/410 = inscrição expirada ou revogada pelo navegador — remove
      // pra não tentar de novo nos próximos envios.
      const status = (erro as { statusCode?: number } | null)?.statusCode;
      if (status === 404 || status === 410) {
        await admin.from("push_subscriptions").delete().eq("id", inscricao.id);
      }
    }
  }
}
