import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatData } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";
import { getPlano, CICLOS } from "@/lib/planos";
import type { Usuario } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const supabase = await getSupabaseServerClient();
  const { data: usuario } = (await supabase.from("usuarios").select("*").single()) as {
    data: Usuario | null;
  };

  if (!usuario) return null;

  const plano = usuario.plano_id ? getPlano(usuario.plano_id) : null;
  const ciclo = CICLOS.find((c) => c.id === usuario.plano_ciclo);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-seal">Conta</p>
      <h1 className="mt-2 text-3xl text-ink">Perfil</h1>

      <dl className="mt-8 grid gap-6 border border-line bg-paper-certificate/60 p-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-muted">Nome</dt>
          <dd className="mt-0.5 text-ink">{usuario.nome}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-muted">E-mail</dt>
          <dd className="mt-0.5 text-ink">{usuario.email}</dd>
        </div>
        {usuario.documento && (
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-muted">CPF/CNPJ</dt>
            <dd className="mt-0.5 text-ink">{usuario.documento}</dd>
          </div>
        )}
        {usuario.endereco && (
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-muted">Endereço</dt>
            <dd className="mt-0.5 text-ink">{usuario.endereco}</dd>
          </div>
        )}
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-muted">Membro desde</dt>
          <dd className="mt-0.5 text-ink">{formatData(usuario.membro_desde)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-muted">Créditos disponíveis</dt>
          <dd className="mt-0.5 text-ink">{usuario.creditos_disponiveis}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-muted">Plano</dt>
          <dd className="mt-0.5 text-ink">
            {plano ? (
              <>
                {plano.nome}
                {ciclo && ` · ${ciclo.label}`}
              </>
            ) : (
              <span className="text-ink-muted">Nenhum plano ativo</span>
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/precos" className={cn(buttonVariants({ variant: "outline" }))}>
          {plano ? "Gerenciar plano" : "Ver planos"}
        </Link>
        {usuario.is_admin && (
          <Link href="/admin" className={cn(buttonVariants({ variant: "outline" }))}>
            Painel admin
          </Link>
        )}
        <form action={logout}>
          <Button type="submit" variant="ghost" className="gap-1.5 text-ink-muted">
            <LogOut className="size-4" />
            Sair da conta
          </Button>
        </form>
      </div>
    </div>
  );
}
