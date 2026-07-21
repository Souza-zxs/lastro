import { Plus } from "lucide-react";
import Link from "next/link";
import { RegistroCard } from "@/components/RegistroCard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Registro, Usuario } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  const [{ data: registros }, { data: usuarioData }] = await Promise.all([
    // RLS já restringe às linhas do usuário autenticado.
    supabase.from("registros").select("*").order("data_registro", { ascending: false }),
    supabase.from("usuarios").select("*").single(),
  ]);

  const lista = (registros ?? []) as Registro[];
  const usuario = usuarioData as Usuario;
  const confirmados = lista.filter((r) => r.status === "confirmado").length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-ink-muted">Olá, {usuario.nome.split(" ")[0]}</p>
          <h1 className="mt-1 text-3xl text-ink">Seus registros</h1>
        </div>
        <Link
          href="/dashboard/novo"
          className={cn(buttonVariants({ size: "lg" }), "gap-1.5 sm:hidden")}
        >
          <Plus className="size-4" />
          Novo registro
        </Link>
      </div>

      <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-line py-5 sm:max-w-md">
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-muted">Registros</dt>
          <dd className="mt-1 text-2xl text-ink">{lista.length}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-muted">Confirmados</dt>
          <dd className="mt-1 text-2xl text-ink">{confirmados}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-muted">Créditos</dt>
          <dd className="mt-1 text-2xl text-ink">{usuario.creditos_disponiveis}</dd>
        </div>
      </dl>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {lista.map((registro) => (
          <RegistroCard key={registro.id} registro={registro} />
        ))}
      </div>
    </div>
  );
}
