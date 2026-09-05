import Link from "next/link";
import { Scale } from "lucide-react";
import { Logo } from "@/components/Logo";
import { buscarConteudo, valorConteudo } from "@/lib/conteudo";

export async function Footer() {
  const mapa = await buscarConteudo();
  const c = (chave: string) => valorConteudo(mapa, chave);

  return (
    <footer className="border-t border-line/80 bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{c("footer.descricao")}</p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:flex sm:gap-16">
            <div className="flex flex-col gap-2.5">
              <span className="font-medium text-ink">Produto</span>
              <Link href="/precos" className="text-ink-muted hover:text-ink">Preços</Link>
              <Link href="/cadastro" className="text-ink-muted hover:text-ink">Criar conta</Link>
              <Link href="/verificar" className="text-ink-muted hover:text-ink">Verificar certificado</Link>
            </div>
            <div className="flex flex-col gap-2.5">
              <span className="font-medium text-ink">Conta</span>
              <Link href="/login" className="text-ink-muted hover:text-ink">Entrar</Link>
              <Link href="/dashboard" className="text-ink-muted hover:text-ink">Painel</Link>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-line/80 pt-6">
          <div className="mb-4 flex items-center gap-2.5">
            <Scale className="size-4 shrink-0 text-seal" />
            <p className="text-xs text-ink-muted">
              Validado juridicamente por{" "}
              <strong className="font-medium text-ink">Dra. Heloize Camargo</strong>, advogada
              responsável pelo produto.
            </p>
          </div>
          <p className="text-xs leading-relaxed text-ink-muted">{c("footer.disclaimer")}</p>
          <p className="mt-3 text-xs text-ink-muted/80">{c("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
