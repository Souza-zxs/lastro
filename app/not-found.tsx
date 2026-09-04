import Link from "next/link";
import { Logo } from "@/components/Logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-seal">Erro 404</p>
        <h1 className="mt-2 text-3xl text-ink">Essa página não existe.</h1>
        <p className="mt-2 max-w-sm text-ink-muted">
          O endereço que você tentou acessar não existe ou foi movido.
        </p>
      </div>
      <Link href="/" className={cn(buttonVariants({ size: "lg" }))}>
        Voltar ao início
      </Link>
    </div>
  );
}
