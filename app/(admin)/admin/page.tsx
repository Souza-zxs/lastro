import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { formatCentavos, formatDataHora } from "@/lib/format";
import { PLANOS } from "@/lib/planos";
import type { Pedido, GreennWebhookEvento } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_GREENN_PAGO = new Set(["paid", "approved"]);

export default async function AdminPage() {
  const admin = getSupabaseAdminClient();

  const [{ data: usuarios }, { data: pedidos }, { data: eventosGreenn }] = await Promise.all([
    admin.from("usuarios").select("plano_id"),
    admin.from("pedidos").select("status, valor_centavos, quantidade_creditos, created_at"),
    admin.from("greenn_webhook_eventos").select("status, processado, produto_nome, email_cliente, recebido_em"),
  ]);

  const listaUsuarios = (usuarios ?? []) as { plano_id: string | null }[];
  const listaPedidos = (pedidos ?? []) as Pick<Pedido, "status" | "valor_centavos" | "quantidade_creditos" | "created_at">[];
  const listaEventos = (eventosGreenn ?? []) as Pick<
    GreennWebhookEvento,
    "status" | "processado" | "produto_nome" | "email_cliente" | "recebido_em"
  >[];

  const totalUsuarios = listaUsuarios.length;
  const porPlano = PLANOS.map((plano) => ({
    id: plano.id,
    nome: plano.nome,
    total: listaUsuarios.filter((u) => u.plano_id === plano.id).length,
  }));
  const semPlano = listaUsuarios.filter((u) => !u.plano_id).length;

  const pedidosPagos = listaPedidos.filter((p) => p.status === "pago");
  const receitaCreditosCentavos = pedidosPagos.reduce((soma, p) => soma + p.valor_centavos, 0);
  const pedidosPendentes = listaPedidos.filter((p) => p.status === "pendente").length;

  const assinaturasAtivadas = listaEventos.filter((e) => STATUS_GREENN_PAGO.has(e.status) && e.processado).length;
  const assinaturasComErro = listaEventos.filter((e) => STATUS_GREENN_PAGO.has(e.status) && !e.processado).length;

  const eventosRecentes = [...listaEventos]
    .sort((a, b) => new Date(b.recebido_em).getTime() - new Date(a.recebido_em).getTime())
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-seal">Painel admin</p>
      <h1 className="mt-2 text-3xl text-ink">Visão geral</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-line bg-paper-certificate/60 p-5">
          <p className="text-xs uppercase tracking-wide text-ink-muted">Usuários</p>
          <p className="mt-1 text-3xl text-ink">{totalUsuarios}</p>
        </div>
        <div className="border border-line bg-paper-certificate/60 p-5">
          <p className="text-xs uppercase tracking-wide text-ink-muted">Receita em créditos avulsos</p>
          <p className="mt-1 text-3xl text-ink">{formatCentavos(receitaCreditosCentavos)}</p>
          <p className="mt-1 text-xs text-ink-muted">
            {pedidosPagos.length} pago(s) · {pedidosPendentes} pendente(s)
          </p>
        </div>
        <div className="border border-line bg-paper-certificate/60 p-5">
          <p className="text-xs uppercase tracking-wide text-ink-muted">Assinaturas ativadas</p>
          <p className="mt-1 text-3xl text-ink">{assinaturasAtivadas}</p>
          {assinaturasComErro > 0 && (
            <p className="mt-1 text-xs text-destructive">{assinaturasComErro} com erro de ativação</p>
          )}
        </div>
        <div className="border border-line bg-paper-certificate/60 p-5">
          <p className="text-xs uppercase tracking-wide text-ink-muted">Sem plano ativo</p>
          <p className="mt-1 text-3xl text-ink">{semPlano}</p>
        </div>
      </div>

      <h2 className="mt-10 text-lg text-ink">Usuários por plano</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {porPlano.map((plano) => (
          <div key={plano.id} className="border border-line bg-paper-certificate/60 p-5">
            <p className="text-xs uppercase tracking-wide text-ink-muted">{plano.nome}</p>
            <p className="mt-1 text-2xl text-ink">{plano.total}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-lg text-ink">Assinaturas recebidas recentemente</h2>
      {eventosRecentes.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">Nenhum evento de assinatura recebido ainda.</p>
      ) : (
        <div className="mt-4 overflow-x-auto border border-line">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line bg-paper-certificate/60 text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Recebido em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {eventosRecentes.map((evento, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 text-ink">{evento.email_cliente ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-muted">{evento.produto_nome ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-muted">{evento.status}</td>
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
