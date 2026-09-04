import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { formatCentavos, formatDataHora } from "@/lib/format";
import { getPacote } from "@/lib/pacotes";
import type { Pedido, GreennWebhookEvento } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_PEDIDO_LABEL: Record<Pedido["status"], string> = {
  pago: "Pago",
  pendente: "Pendente",
  cancelado: "Cancelado",
};

export default async function AdminAssinaturasPage() {
  const admin = getSupabaseAdminClient();

  const [{ data: pedidos }, { data: eventos }] = await Promise.all([
    admin
      .from("pedidos")
      .select("*, usuarios(nome, email)")
      .order("created_at", { ascending: false }),
    admin.from("greenn_webhook_eventos").select("*").order("recebido_em", { ascending: false }),
  ]);

  const listaPedidos = (pedidos ?? []) as (Pedido & { usuarios: { nome: string; email: string } | null })[];
  const listaEventos = (eventos ?? []) as GreennWebhookEvento[];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-seal">Painel admin</p>
      <h1 className="mt-2 text-3xl text-ink">Assinaturas e compras</h1>

      <h2 className="mt-8 text-lg text-ink">Compras de créditos avulsos</h2>
      <p className="mt-1 text-sm text-ink-muted">{listaPedidos.length} pedido(s), via Asaas</p>
      {listaPedidos.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">Nenhum pedido registrado ainda.</p>
      ) : (
        <div className="mt-4 overflow-x-auto border border-line">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-line bg-paper-certificate/60 text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Pacote</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Criado em</th>
                <th className="px-4 py-3 font-medium">Pago em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {listaPedidos.map((pedido) => (
                <tr key={pedido.id}>
                  <td className="px-4 py-3 text-ink">
                    {pedido.usuarios?.nome ?? "—"}
                    <div className="text-xs text-ink-muted">{pedido.usuarios?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {getPacote(pedido.pacote_id)?.nome ?? pedido.pacote_id} ({pedido.quantidade_creditos} créditos)
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{formatCentavos(pedido.valor_centavos)}</td>
                  <td className="px-4 py-3 text-ink-muted">{STATUS_PEDIDO_LABEL[pedido.status]}</td>
                  <td className="px-4 py-3 text-ink-muted">{formatDataHora(pedido.created_at)}</td>
                  <td className="px-4 py-3 text-ink-muted">{pedido.pago_em ? formatDataHora(pedido.pago_em) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-10 text-lg text-ink">Assinaturas (eventos da Greenn)</h2>
      <p className="mt-1 text-sm text-ink-muted">{listaEventos.length} evento(s) recebido(s)</p>
      {listaEventos.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">Nenhum evento de assinatura recebido ainda.</p>
      ) : (
        <div className="mt-4 overflow-x-auto border border-line">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-line bg-paper-certificate/60 text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Ativação</th>
                <th className="px-4 py-3 font-medium">Recebido em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {listaEventos.map((evento) => (
                <tr key={evento.id}>
                  <td className="px-4 py-3 text-ink">{evento.email_cliente ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-muted">{evento.produto_nome ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-muted">{evento.status}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    {evento.processado ? (
                      "Ativada"
                    ) : evento.erro ? (
                      <span className="text-destructive">{evento.erro}</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{formatDataHora(evento.recebido_em)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
