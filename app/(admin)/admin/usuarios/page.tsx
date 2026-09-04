import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { formatData } from "@/lib/format";
import { getPlano, CICLOS } from "@/lib/planos";
import type { Usuario } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminUsuariosPage() {
  const admin = getSupabaseAdminClient();

  const { data: usuarios } = await admin.from("usuarios").select("*").order("membro_desde", { ascending: false });

  const lista = (usuarios ?? []) as Usuario[];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-seal">Painel admin</p>
      <h1 className="mt-2 text-3xl text-ink">Usuários</h1>
      <p className="mt-1 text-sm text-ink-muted">{lista.length} usuário(s) cadastrado(s)</p>

      <div className="mt-8 overflow-x-auto border border-line">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-line bg-paper-certificate/60 text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">CPF/CNPJ</th>
              <th className="px-4 py-3 font-medium">Plano</th>
              <th className="px-4 py-3 font-medium">Créditos</th>
              <th className="px-4 py-3 font-medium">Membro desde</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {lista.map((usuario) => {
              const plano = usuario.plano_id ? getPlano(usuario.plano_id) : null;
              const ciclo = CICLOS.find((c) => c.id === usuario.plano_ciclo);
              return (
                <tr key={usuario.id}>
                  <td className="px-4 py-3 text-ink">
                    {usuario.nome}
                    {usuario.is_admin && (
                      <span className="ml-2 rounded-full border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-muted">
                        Admin
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{usuario.email}</td>
                  <td className="px-4 py-3 text-ink-muted">{usuario.documento ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    {plano ? (
                      <>
                        {plano.nome}
                        {ciclo && ` · ${ciclo.label}`}
                      </>
                    ) : (
                      "Sem plano"
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{usuario.creditos_disponiveis}</td>
                  <td className="px-4 py-3 text-ink-muted">{formatData(usuario.membro_desde)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
