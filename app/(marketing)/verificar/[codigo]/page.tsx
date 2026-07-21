import Link from "next/link";
import { ShieldCheck, ShieldAlert, ArrowLeft } from "lucide-react";
import { CertificadoPreview } from "@/components/CertificadoPreview";
import { buttonVariants } from "@/components/ui/button";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { origemAtual } from "@/lib/origem";
import type { Registro } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function VerificarCodigoPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  const codigoNormalizado = decodeURIComponent(codigo).toUpperCase();
  const supabase = await getSupabaseServerClient();
  // Visitante não autenticado: a RLS bloqueia leitura direta de `registros`,
  // então a busca pública passa pela RPC `verificar_registro` (security
  // definer), que só devolve o registro que casa com o código informado.
  const { data: registro } = (await supabase
    .rpc("verificar_registro", { p_codigo: codigoNormalizado })
    .maybeSingle()) as { data: Registro | null };
  const origem = await origemAtual();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/verificar" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="size-3.5" />
        Verificar outro código
      </Link>

      {registro ? (
        <>
          <div className="mt-6 flex items-center gap-3 border border-ledger/30 bg-ledger/5 px-5 py-4">
            <ShieldCheck className="size-6 shrink-0 text-ledger" />
            <div>
              <p className="font-medium text-ledger">Certificado autêntico</p>
              <p className="text-sm text-ink-muted">
                Este código corresponde a um registro válido em nossa base.
              </p>
            </div>
          </div>
          <CertificadoPreview registro={registro} origem={origem} className="mt-6" />
        </>
      ) : (
        <div className="mt-6 flex items-start gap-3 border border-destructive/30 bg-destructive/5 px-5 py-4">
          <ShieldAlert className="mt-0.5 size-6 shrink-0 text-destructive" />
          <div>
            <p className="font-medium text-destructive">Nenhum registro encontrado</p>
            <p className="mt-1 text-sm text-ink-muted">
              O código <span className="font-mono">{codigoNormalizado}</span> não
              corresponde a nenhum certificado emitido. Confira se ele foi
              digitado corretamente.
            </p>
            <Link href="/verificar" className={`${buttonVariants({ variant: "outline", size: "sm" })} mt-4`}>
              Tentar novamente
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
