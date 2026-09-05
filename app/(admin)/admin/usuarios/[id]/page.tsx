import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { ajustarCreditosAdmin, alterarPlanoAdmin } from "@/lib/actions/admin";
import { formatData, formatDataHora } from "@/lib/format";
import { getPlano, PLANOS, CICLOS } from "@/lib/planos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Usuario } from "@/lib/types";

export const dynamic = "force-dynamic";

const CAMPO_SELECT =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export default async function AdminUsuarioDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = getSupabaseAdminClient();

  const { data: usuario } = (await admin.from("usuarios").select("*").eq("id", id).maybeSingle()) as {
    data: Usuario | null;
  };

  if (!usuario) notFound();

  const plano = usuario.plano_id ? getPlano(usuario.plano_id) : null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/admin/usuarios" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ChevronLeft className="size-4" />
        Usuários
      </Link>

      <p className="mt-4 font-mono text-xs uppercase tracking-[0.25em] text-seal">Painel admin</p>
      <h1 className="mt-2 text-3xl text-ink">{usuario.nome}</h1>

      <dl className="mt-8 grid gap-6 border border-line bg-paper-certificate/60 p-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-muted">E-mail</dt>
          <dd className="mt-0.5 text-ink">{usuario.email}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-muted">CPF/CNPJ</dt>
          <dd className="mt-0.5 text-ink">{usuario.documento ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-muted">Endereço</dt>
          <dd className="mt-0.5 text-ink">{usuario.endereco ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-muted">Membro desde</dt>
          <dd className="mt-0.5 text-ink">{formatData(usuario.membro_desde)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-muted">Créditos disponíveis</dt>
          <dd className="mt-0.5 text-ink">{usuario.creditos_disponiveis}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-muted">Plano atual</dt>
          <dd className="mt-0.5 text-ink">
            {plano ? (
              <>
                {plano.nome}
                {usuario.plano_ciclo && ` · ${CICLOS.find((c) => c.id === usuario.plano_ciclo)?.label}`}
              </>
            ) : (
              "Sem plano"
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-muted">Plano ativado em</dt>
          <dd className="mt-0.5 text-ink">
            {usuario.plano_ativado_em ? formatDataHora(usuario.plano_ativado_em) : "—"}
          </dd>
        </div>
      </dl>

      <div className="mt-8 border border-line p-6">
        <h2 className="text-lg text-ink">Ajustar créditos</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Positivo adiciona, negativo desconta. Saldo atual: {usuario.creditos_disponiveis}.
        </p>
        <form action={ajustarCreditosAdmin} className="mt-4 flex items-end gap-3">
          <input type="hidden" name="userId" value={usuario.id} />
          <div className="w-32 space-y-1.5">
            <Label htmlFor="quantidade">Quantidade</Label>
            <Input id="quantidade" name="quantidade" type="number" step={1} placeholder="Ex.: 10" required />
          </div>
          <Button type="submit">Aplicar</Button>
        </form>
      </div>

      <div className="mt-6 border border-line p-6">
        <h2 className="text-lg text-ink">Alterar plano</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Ativa, troca ou remove o plano de assinatura do usuário manualmente.
        </p>
        <form action={alterarPlanoAdmin} className="mt-4 flex flex-wrap items-end gap-3">
          <input type="hidden" name="userId" value={usuario.id} />
          <div className="space-y-1.5">
            <Label htmlFor="planoId">Plano</Label>
            <select id="planoId" name="planoId" defaultValue={usuario.plano_id ?? "nenhum"} className={CAMPO_SELECT}>
              <option value="nenhum">Sem plano</option>
              {PLANOS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ciclo">Ciclo</Label>
            <select id="ciclo" name="ciclo" defaultValue={usuario.plano_ciclo ?? "mensal"} className={CAMPO_SELECT}>
              {CICLOS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit">Atualizar plano</Button>
        </form>
      </div>
    </div>
  );
}
